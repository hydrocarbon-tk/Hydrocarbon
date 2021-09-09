/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import spark from "@candlelib/spark";
import { WorkerRunner } from "../build/workers/worker_runner.js";
import parser_loader from "../grammar/ir_parser.js";
import { getProductionByName } from '../grammar/nodes/common.js';
import { getRootSym, Sym_Is_A_Token } from '../grammar/nodes/symbol.js';
import { BuildPack } from "../render/render.js";
import { fail_state_mask } from '../runtime/kernel.js';
import { GrammarObject, ProductionImportSymbol, ProductionSymbol, TokenSymbol } from "../types/grammar_nodes";
import { IRStateData, StateAttrib, StateMap } from '../types/ir_state_data';
import { BlockData, InstructionType, IR_Instruction, ResolvedIRBranch, Resolved_IR_State } from '../types/ir_types';
import { getSymbolMapFromIds } from '../utilities/code_generating.js';
import { ir_reduce_numeric_len_id } from './ir_reduce_numeric_len_id.js';
import { garbageCollect, optimize } from './optimize.js';
import { renderIRNode } from './render_ir_state.js';

const ir_parser = await parser_loader;
export const default_case_indicator = 9999;
export async function createBuildPack(
    grammar: GrammarObject,
    number_of_workers: number = 1
): Promise<BuildPack> {

    const
        mt_code_compiler = new WorkerRunner(grammar, number_of_workers);

    for await (const updates of mt_code_compiler.run())
        await spark.sleep(1);

    const ir_states = [...mt_code_compiler.tables.entries()];

    const states_map: StateMap = new Map();

    for (const [string, ir_state_ast] of <([string, Resolved_IR_State])[]>[
        ...ir_states.map(

            //@ts-ignore
            ([hash, str], i) => {
                try {
                    const ir_state = ir_parser(str, {}/* , ir_parser.ir_state */)
                        .result[0];
                    //console.log(str);
                    return [str, ir_state];
                } catch (e) {
                    console.log(hash, str);
                    throw e;
                }
            }
        ),
        ...grammar.ir_states.map(ir => [
            ir.pos.slice(),
            ir
        ])
    ])
        insertIrStateBlock(ir_state_ast, string, grammar, states_map);


    // Map recovery states to state of their target production ---------------------

    for (const [id, state] of states_map) {

        if (id.slice(0, 4) == "%%%%") {

            const target_production = id.slice(4);

            if (states_map.has(target_production)) {
                //@ts-ignore
                states_map.get(target_production).ir_state_ast.fail = state.ir_state_ast;

                state.attributes |= StateAttrib.FAIL_STATE;
            }
        }
    }

    // Process States -------------------------------------------------------------

    const sym_map: Map<string, number> = new Map();

    let OPTIMIZE = true;

    garbageCollect(states_map, grammar);

    assignStateAttributeInformation(states_map, grammar);

    let prev_size = states_map.size;

    let original_states = new Map(states_map);

    if (OPTIMIZE) {
        while (optimize(states_map, grammar)) {

            console.log(`reduction ratio ${Math.round((1 - (states_map.size / prev_size)) * 100)}% - prev size ${prev_size} - current size ${states_map.size}`);

            prev_size = states_map.size;
        }

        prev_size = original_states.size;

        console.log(`Total reduction ratio ${Math.round((1 - (states_map.size / prev_size)) * 100)}% - prev size ${prev_size} - current size ${states_map.size}`);
    }

    //Render state strings for later reference

    for (const [, state_data] of states_map) {
        state_data.string = (state_data.string.match(/\/\*[^\*]+\*\//sm)?.[0] ?? "")
            + "\n"
            + renderIRNode(state_data.ir_state_ast);
        extractTokenSymbols(state_data, grammar);
    }

    //Build states buffer -------------------------------------------------------------

    const state_buffer = new Uint32Array(statesOutputsBuildPass(states_map, grammar, sym_map));

    console.log(`Buffer size = ${state_buffer.length * 4}bytes`);

    return <BuildPack>{
        grammar,
        state_buffer,
        states_map,
        sym_map
    };
}


const numeric_sort = (a: number, b: number): number => a - b;

function insertIrStateBlock(
    ir_state_ast: Resolved_IR_State,
    string: string,
    grammar: GrammarObject,
    states_map: StateMap,
    state_attributes: StateAttrib = 0
) {

    const id = ir_state_ast.id;

    const IS_PRODUCTION_ENTRY = getProductionByName(grammar, id) != null;

    states_map.set(id, {
        reference_count: 0,
        block_offset: 0,
        pointer: -1,
        attributes: (IS_PRODUCTION_ENTRY ? StateAttrib.PRODUCTION_ENTRY : 0) | state_attributes,
        string: ((StateAttrib.FAIL_STATE & state_attributes) ? "[FAILURE HANDLER]\n\n" : "") + string,
        ir_state_ast: ir_state_ast,
        block: null,
    });

    if (ir_state_ast.fail)
        insertIrStateBlock(ir_state_ast.fail, ir_state_ast.fail.pos.slice(), grammar, states_map, StateAttrib.FAIL_STATE);
}

function convertBlockDataToBufferData(block_info: BlockData, state_map: StateMap): number[] {

    const buffer = [];

    buffer.push(...insertInstructionSequences(
        block_info.instruction_sequence,
        state_map,
        block_info
    ));

    while (buffer.length < (block_info.total_size / 4))
        buffer.push(0);

    if (buffer.length > (block_info.total_size / 4))
        throw new Error("Buffer data length does not match length calculated in BlockData");

    return buffer;
}


function insertInstructionSequences(
    instruction_sections: any[][],
    state_map: StateMap,
    block_info: BlockData,
    default_block_size: number = 0
): number[] {
    if (!instruction_sections)
        debugger;

    let buffer = [];
    for (const data of instruction_sections) {
        let i = 0;
        let temp_buffer = [];
        for (; i < data.length; i++) {
            switch (data[i]) {

                case "end": case InstructionType.pass:
                    temp_buffer.push(0 >>> 0); break;

                case InstructionType.left_most: {
                    temp_buffer.push(13 << 28);
                } break;

                case InstructionType.consume: {
                    temp_buffer.push(1 << 28);
                } break;

                case InstructionType.goto: {
                    i++;
                    temp_buffer.push(2 << 28 | state_map.get(data[i]).pointer);
                } break;

                case InstructionType.set_prod: {
                    let prod = +data[++i];
                    temp_buffer.push(3 << 28 | prod);
                } break;

                case InstructionType.reduce: {

                    let sym_len = +data[++i];

                    if (sym_len == ir_reduce_numeric_len_id) {
                        sym_len = 0xFFFF;

                        let reduce_fn_id = +data[++i];

                        temp_buffer.push(4 << 28 | reduce_fn_id << 16 | sym_len & 0xFFFF);
                    } else {
                        let low = 0;
                        let high = 0;

                        let reduce_fn_id = +data[++i];

                        if (reduce_fn_id > 0xFF || sym_len > 0x1F) {
                            low = 4 | (reduce_fn_id << 3);
                            high = sym_len;
                        } else {
                            low = ((sym_len & 0x1F) << 3) | ((reduce_fn_id & 0xFF) << 8);
                        };

                        temp_buffer.push(4 << 28 | high << 16 | low);
                    }


                } break;

                case InstructionType.token_length: {
                    let length = +data[++i];
                    temp_buffer.push(5 << 28 | length);
                } break;

                case InstructionType.fork_to: {

                    let length = +data[++i];

                    temp_buffer.push(6 << 28 | length);

                    while (length-- > 0)
                        temp_buffer.push(state_map.get(data[++i]).pointer);

                } break;

                case InstructionType.scan_back_until: {
                    let token_id = +data[++i];
                    let length = +data[++i];
                    temp_buffer.push(7 << 28 | 0x00100000 | (length & 0xFFFF), token_id << 16, ...data.slice(i + 1, i + 1 + length));
                    i += length;
                } break;

                case InstructionType.scan_until: {
                    let token_id = +data[++i];
                    let length = +data[++i];
                    temp_buffer.push(7 << 28 | (length & 0xFFFF), token_id << 16, ...data.slice(i + 1, i + 1 + length));
                    i += length;
                } break;

                case InstructionType.pop: {
                    let length = +data[++i];
                    temp_buffer.push(8 << 28 | length);
                } break;

                case "table": {

                    const [
                        input_type,
                        lexer_type,
                        use_peek_for_assert_or_consume,
                        consume_peek,
                        skip_table_row,
                        token_table_row,
                        token_basis,
                        number_of_rows,
                        row_size,
                        table_entries
                    ] = data.slice(i + 1, i + 11);

                    i += 10;

                    const
                        table_header =
                            (9 << 28) |
                            ((["production", "token"].indexOf(input_type) + 1) << 24)
                            |
                            ((["peek", "assert"].indexOf(lexer_type) + 1) << 26)
                            |
                            (+use_peek_for_assert_or_consume << 16)
                            |
                            (+consume_peek << 17)
                            |
                            (token_basis & 0xFFFF),

                        token_info =
                            (skip_table_row & 0xFFFF)
                            |
                            ((token_table_row & 0xFFFF) << 16),

                        table_info =
                            ((number_of_rows & 0xFFFF) << 16)
                            |
                            (row_size & 0xFFFF);

                    temp_buffer.push(table_header >>> 0, token_info >>> 0, table_info >>> 0);

                    let default_row_size: number = data[++i];

                    temp_buffer.push(...insertInstructionSequences(
                        table_entries, state_map, block_info, row_size
                    ));
                } break;
                case "scanner": {

                    const
                        [
                            input_type,
                            lexer_type,
                            use_peek_for_assert_or_consume,
                            consume_peek,
                            skip_table_row,
                            token_table_row,
                            scan_field_length,
                            instruction_field_size,
                            scanner_key_index_pairs,
                            sequence_entries
                        ] = data.slice(i + 1, i + 11);

                    i += 10;

                    //construct the hash entries

                    const hash_entries = (new Array(scanner_key_index_pairs.length))
                        .fill(0, 0, scanner_key_index_pairs.length);

                    const pending_pairs = scanner_key_index_pairs.slice();

                    const mod_base = Math.floor(Math.log2(scanner_key_index_pairs.length));

                    const mod_mask = (1 << mod_base) - 1;

                    for (let i = 0, j = 0; i < (1 << mod_base); i++) {

                        for (let j = 0; j < pending_pairs.length; j++) {
                            const [val, instr] = pending_pairs[j];
                            if ((val & mod_mask) == i) {
                                pending_pairs.splice(j, 1);
                                hash_entries[i] = (
                                    (val & 0x7FF)
                                    |
                                    ((instr & 0x7FF) << 11)
                                    |
                                    (512 << 22)
                                ) >>> 0;
                                break;
                            }
                        }
                    }

                    for (let i = 0; i < pending_pairs.length; i++) {

                        const [val, instr] = pending_pairs[i];

                        let pointer = 0;

                        let node = val & mod_mask;

                        while (true) {

                            pointer = ((hash_entries[node] >>> 22) & 0x3FF) - 512;

                            if (pointer == 0)
                                break;

                            else
                                node += pointer;
                        }

                        for (let j = 0; j < hash_entries.length; j++) {
                            if (hash_entries[j] == 0) {

                                hash_entries[node] =
                                    (
                                        ((((j - node) + 512) & 0x3FF) << 22)
                                        |
                                        (hash_entries[node] & ((1 << 22) - 1))
                                    ) >>> 0;

                                hash_entries[node] = hash_entries[node] >>> 0;

                                hash_entries[j] = (
                                    (val & 0x7FF)
                                    |
                                    ((instr & 0x7FF) << 11)
                                    |
                                    (512 << 22)
                                ) >>> 0;

                                break;
                            }
                        }
                    }

                    const
                        table_header =
                            (10 << 28) |
                            ((["production", "token"].indexOf(input_type) + 1) << 24)
                            |
                            ((["peek", "assert"].indexOf(lexer_type) + 1) << 26)
                            |
                            (+use_peek_for_assert_or_consume << 16)
                            |
                            (+consume_peek << 17)
                            |
                            (instruction_field_size & 0xFFFF),

                        token_info =
                            (skip_table_row & 0xFFFF)
                            |
                            ((token_table_row & 0xFFFF) << 16),

                        table_info =
                            ((mod_base & 0xFFFF) << 16)
                            |
                            (scanner_key_index_pairs.length & 0xFFFF);

                    temp_buffer.push(table_header, token_info, table_info);

                    temp_buffer.push(...hash_entries);

                    temp_buffer.push(...insertInstructionSequences(
                        sequence_entries, state_map, block_info, 0
                    ));
                } break;
                case "set fail": {
                    temp_buffer.push(11 << 28 | fail_state_mask | state_map.get(data[++i]).pointer);
                } break;

                case InstructionType.repeat: {
                    temp_buffer.push(12 << 28);
                } break;

                case InstructionType.fail: temp_buffer.push((15 << 28) >>> 0); break;
            }
        }


        while (temp_buffer.length < default_block_size)
            temp_buffer.push(0);

        buffer.push(...temp_buffer);
    }
    return buffer;
}

function createInstructionSequence(
    active_instructions: IR_Instruction[],
    grammar: GrammarObject,
    token_id: number,
    skip_id: number
): { byte_length: number, byte_sequence: any; } {

    const byte_sequence = [];

    // The order of the goto instructions are reversed to change 
    // their execution order from FIFO to FILO, conforming to 
    // behavior observed on a stack.

    const goto_instructions = active_instructions.filter(i => i.type == InstructionType.goto || i.type == InstructionType.repeat).reverse();
    const standard_instructions = active_instructions.filter(i => !(i.type == InstructionType.goto || i.type == InstructionType.repeat));

    let byte_length = 0;

    for (const instr of [...standard_instructions, ...goto_instructions]) {
        switch (instr.type) {

            case InstructionType.token_length:
                byte_length += 4;
                byte_sequence.push(InstructionType.token_length, instr.len);
                break;

            case InstructionType.pass:
                byte_length += 4;
                byte_sequence.push(InstructionType.pass);
                break;

            case InstructionType.consume:
                byte_length += 4;

                if (instr.EMPTY) {
                    byte_sequence.push(InstructionType.empty_consume);
                } else
                    byte_sequence.push(InstructionType.consume);

                break;

            case InstructionType.fail:
                byte_length += 4;
                byte_sequence.push(InstructionType.fail);
                break;

            case InstructionType.goto:
                byte_length += 4;
                byte_sequence.push(InstructionType.goto, instr.state);
                break;

            case InstructionType.set_prod:
                byte_length += 4;
                byte_sequence.push(InstructionType.set_prod, ...convertTokenIDsToSymbolIds([<any>instr.id], grammar));
                break;

            case InstructionType.fork_to:
                byte_length += 4 + 4 * (instr.states.length);
                byte_sequence.push(InstructionType.fork_to, instr.states.length, ...instr.states);
                break;

            case InstructionType.scan_back_until:
                byte_length += 8 + 4 * instr.ids.length;
                byte_sequence.push(InstructionType.scan_back_until, token_id, instr.ids.length, ...convertTokenIDsToSymbolIds(instr.ids, grammar));
                break;

            case InstructionType.scan_until:
                byte_length += 8 + 4 * instr.ids.length;
                byte_sequence.push(InstructionType.scan_until, token_id, instr.ids.length, ...convertTokenIDsToSymbolIds(instr.ids, grammar));
                break;

            case InstructionType.pop:
                byte_length += 4;
                byte_sequence.push(InstructionType.pop, instr.len);
                break;

            case InstructionType.left_most:
                byte_length += 4;
                byte_sequence.push(InstructionType.left_most);
                break;

            case InstructionType.reduce:
                byte_length += 4;
                byte_sequence.push(InstructionType.reduce, instr.len, instr.reduce_fn);
                break;

            case InstructionType.repeat:
                byte_length += 4;
                byte_sequence.push(InstructionType.repeat);
                break;
        }
    }

    byte_sequence.push("end");
    byte_length += 4;

    return { byte_length, byte_sequence };
}

function getStateName(
    name_candidate: ProductionSymbol | ProductionImportSymbol | string
): string {
    if (!name_candidate) return "";

    if (typeof name_candidate == "string")
        return name_candidate;

    return name_candidate.name;
}

function assignStateAttributeInformation(StateMap: StateMap, grammar: GrammarObject) {


    for (const [state_name, state_data] of StateMap) {

        let attributes = state_data.attributes;

        //Construct base state attributes 

        // Get all initial states. if branch function,
        // assert all top level instructions are of the
        // the same class [prod or token]

        const token_instr_types = {
            [InstructionType.assert]: StateAttrib.ASSERT_BRANCH,
            [InstructionType.peek]: StateAttrib.PEEK_BRANCH,
            [InstructionType.prod]: StateAttrib.PROD_BRANCH
        };

        attributes |= state_data.ir_state_ast.instructions.reduce((r, v) =>
            r | (token_instr_types[v.type] ?? 0), 0);

        if ((attributes & (StateAttrib.TOKEN_BRANCH)) > 0
            &&
            state_data.ir_state_ast.instructions.length > 1
        ) attributes |= StateAttrib.MULTI_BRANCH;

        if (
            (attributes & StateAttrib.TOKEN_BRANCH) > 0
            &&
            (attributes & StateAttrib.PROD_BRANCH) > 0
        ) new Error(`Unsupported mixture of token branch (assert | peek) and production branch ( on prod ) instructions`);

        if (
            (attributes & (StateAttrib.ASSERT_BRANCH)) > 0
            &&
            (attributes & StateAttrib.PEEK_BRANCH) > 0
        ) new Error(`Unsupported mixture of assertion branch ( assert ) and peek branch ( peek ) instructions`);

        state_data.attributes = attributes;
    }
}

function convertTokenIDsToSymbolIds(ids: (number | string | TokenSymbol | ProductionSymbol)[], grammar: GrammarObject): (string | number)[] {
    let out_ids = [];

    for (const id of ids) {

        if (typeof id == "number" || typeof id == "string")

            out_ids.push(id);

        else if (Sym_Is_A_Token(id))

            out_ids.push(getRootSym(id, grammar).id);

        else

            out_ids.push(grammar.productions[id.val].name);

    }

    return out_ids;
}

function processInstructionTokens(
    instructions: IR_Instruction[],
    expected_symbols: number[],
    grammar: GrammarObject
) {
    for (const instruction of instructions) {
        switch (instruction.type) {
            case InstructionType.assert:
            case InstructionType.peek:
                //@ts-ignore
                expected_symbols.push(...convertTokenIDsToSymbolIds(instruction.ids, grammar));
                processInstructionTokens(instruction.instructions, expected_symbols, grammar);
                break;
            case InstructionType.scan_until:
                //@ts-ignore
                expected_symbols.push(...convertTokenIDsToSymbolIds(instruction.ids, grammar));
                break;

        }
    }
}
function extractTokenSymbols(state_data: IRStateData, grammar: GrammarObject) {

    const expected_symbols = [];
    const skipped_symbols = [];

    processInstructionTokens(
        state_data.ir_state_ast.instructions,
        expected_symbols,
        grammar
    );

    if (state_data.ir_state_ast.symbol_meta) {
        const { expected, skipped } = state_data.ir_state_ast.symbol_meta;
        expected_symbols.push(...expected);
        skipped_symbols.push(...skipped);
    }

    state_data.expected_tokens = expected_symbols.filter(s => s != default_case_indicator); // <- remove default value
    state_data.skipped_tokens = skipped_symbols.filter(s => s != default_case_indicator);// <- remove default value
}

function statesOutputsBuildPass(StateMap: StateMap, grammar: GrammarObject, sym_map: Map<string, number> = new Map(),) {

    let total_instruction_byte_size = 8; // Ensure the zero position is reserved for the "null" state

    for (const [state_name, state_data] of StateMap) {

        const { ir_state_ast: state_ast, attributes, string } = state_data;

        let { expected_tokens, skipped_tokens } = state_data;

        let skip_id = 0, tok_id = 0;

        if (expected_tokens.length > 0 || skipped_tokens.length > 0) {
            //create a meta lookup instruction

            const expected = expected_tokens.concat(skipped_tokens).setFilter().sort(numeric_sort);
            const skipped = skipped_tokens.setFilter().sort(numeric_sort);

            if (expected.length > 0) {
                const id_string = getSymbolMapFromIds(expected, grammar).map(i => (i >>> 0) + "").join('_');
                if (!sym_map.has(id_string))
                    sym_map.set(id_string, sym_map.size);

                tok_id = sym_map.get(id_string);
            }

            if (skipped.length > 0) {
                const id_string = getSymbolMapFromIds(skipped, grammar).map(i => (i >>> 0) + "").join('_');

                if (!sym_map.has(id_string))
                    sym_map.set(id_string, sym_map.size);

                skip_id = sym_map.get(id_string);
            }
        }

        state_data.block_offset = total_instruction_byte_size;

        if ((attributes & (StateAttrib.PROD_BRANCH)) > 0) {
            const

                table_block_info = buildJumpTableBranchBlock(
                    state_ast, attributes, tok_id, skip_id, "production", "peek", grammar
                ),

                scan_block_info = buildHashTableBranchBlock(
                    state_ast, attributes, tok_id, skip_id, "production", "peek", grammar
                ),

                block = scan_block_info ? selectBestFitBlockType(table_block_info, scan_block_info)
                    : table_block_info;

            total_instruction_byte_size += block.total_size;

            state_data.block = block;

        } else if ((attributes & (StateAttrib.TOKEN_BRANCH)) > 0) {

            const
                lexer_state = (attributes & (StateAttrib.PEEK_BRANCH)) ? "peek" : "assert",

                table_block_info = buildJumpTableBranchBlock(
                    state_ast, attributes, tok_id, skip_id, "token", lexer_state, grammar
                ),

                scan_block_info = buildHashTableBranchBlock(
                    state_ast, attributes, tok_id, skip_id, "token", lexer_state, grammar
                ),

                block = scan_block_info ? selectBestFitBlockType(table_block_info, scan_block_info)
                    : table_block_info;

            total_instruction_byte_size += block.total_size;

            state_data.block = block;

        } else {

            const block_info = buildBasicInstructionBlock(state_ast, tok_id, skip_id, grammar);

            total_instruction_byte_size += block_info.total_size;

            state_data.block = block_info;
        }

        state_data.pointer = (state_data.block_offset / 4);

        if ((attributes & StateAttrib.FAIL_STATE) > 0)
            state_data.pointer |= fail_state_mask;

    }

    const out_buffer = [0, 0];

    for (const [_, { block }] of StateMap) {

        const buffer = convertBlockDataToBufferData(block, StateMap);

        out_buffer.push(...buffer);
    }

    return out_buffer;
}
function selectBestFitBlockType(jump_table_block: BlockData, hash_table_block: BlockData) {

    // How much bigger a jump table block is compared to a hash table block
    // in ratio form
    const block_size_ratio = jump_table_block.total_size / hash_table_block.total_size;

    // How many more jump table entries there are compared to hash table entries
    // in ratio form
    const sparse_table_fill_ratio = jump_table_block.number_of_elements
        / (hash_table_block.number_of_elements);

    const block = (
        (!isNaN(sparse_table_fill_ratio) && !isNaN(block_size_ratio)) &&
        (sparse_table_fill_ratio < 1.05 && block_size_ratio < 1.05)) ? jump_table_block : hash_table_block;


    return block;
}

function get8AlignedOffset(request_size: number) {
    return Math.ceil(request_size / 8) * 8;
}

function get32AlignedOffset(request_size: number) {
    return Math.ceil(request_size / 32) * 32;
}

function buildJumpTableBranchBlock(
    state_ast: Resolved_IR_State,
    attributes: StateAttrib,
    tok_id = 0,
    skip_id = 0,
    input_type: "production" | "token" = "production",
    lexer_type: "assert" | "peek" = "assert",
    grammar: GrammarObject
): BlockData {

    const instructions = state_ast.instructions as ResolvedIRBranch[];

    const default_instruction = instructions.filter(i => i.ids.some(i => i == default_case_indicator))[0];

    const standard_instructions = instructions.filter(i => !i.ids.some(i => i == default_case_indicator));

    if (standard_instructions.length == 0 && default_instruction) {
        const new_state = Object.assign({}, state_ast, { instructions: default_instruction.instructions });

        return buildBasicInstructionBlock(new_state, tok_id, skip_id, grammar);
    }
    const ids = standard_instructions.flatMap(i => i.ids).sort(numeric_sort);

    const standard_byte_codes = standard_instructions
        .flatMap(({ ids, instructions, type }) => {

            const instr = createInstructionSequence(instructions, grammar, tok_id, skip_id);
            return ids.map(i => ({ id: i, code: instr }));
        });

    const max_instruction_byte_size = (standard_byte_codes.map(i => i.code.byte_length).sort(numeric_sort).pop());

    const number_of_rows = 1 + ids[ids.length - 1] - ids[0];

    const basis = ids[0];

    const table_entries = [];

    let last_offset = basis;
    for (const { id, code } of standard_byte_codes.sort((a, b) => a.id - b.id)) {

        while (++last_offset <= id) {
            table_entries.push(["fail"]);
        }

        table_entries.push(code.byte_sequence);
    }

    let base_size = 12;

    const instruction_sequence = [];

    if (state_ast.fail) {
        base_size += 4;
        instruction_sequence
            .push(["set fail", state_ast.fail.id]);
    }

    const { use_peek_for_assert_or_consume, consume_peek }
        = getPeekConsumptionFlags(attributes, state_ast);

    const row_size = max_instruction_byte_size / 4;

    instruction_sequence.push(
        ["table",
            input_type,
            lexer_type,
            use_peek_for_assert_or_consume,
            consume_peek,
            skip_id,
            tok_id,
            basis,
            number_of_rows,
            row_size,
            table_entries,]
    );

    if (default_instruction) {

        const default_data = createInstructionSequence(default_instruction.instructions, grammar, tok_id, skip_id);

        instruction_sequence.push(default_data.byte_sequence);

        return {
            number_of_elements: number_of_rows,
            instruction_sequence,
            total_size: get8AlignedOffset(base_size + default_data.byte_length + max_instruction_byte_size * (number_of_rows))
        };
    }

    instruction_sequence.push(["fail"]);

    base_size += 4;

    return {
        number_of_elements: number_of_rows,
        instruction_sequence,
        total_size: get8AlignedOffset(base_size + max_instruction_byte_size * (number_of_rows))
    };
}

function buildHashTableBranchBlock(
    state_ast: Resolved_IR_State,
    attributes: StateAttrib,
    tok_id = 0,
    skip_id = 0,
    input_type: "production" | "token" = "production",
    lexer_type: "assert" | "peek" = "assert",
    grammar: GrammarObject
): BlockData {

    const instructions = state_ast.instructions as ResolvedIRBranch[];

    const default_instruction = instructions.filter(i => i.ids.some(i => i == default_case_indicator))[0];
    const standard_instructions = instructions.filter(i => !i.ids.some(i => i == default_case_indicator));

    if (standard_instructions.length == 0 && default_instruction) {
        const new_state = Object.assign({}, state_ast, { instructions: default_instruction.instructions });
        return buildBasicInstructionBlock(new_state, tok_id, skip_id, grammar);
    }

    let instruction_field_byte_size = 0;

    const standard_byte_codes = standard_instructions
        .map(({ instructions, type, ids }) => {

            const instr = createInstructionSequence(instructions, grammar, tok_id, skip_id);

            //@ts-expect-error
            instr.pointer = instruction_field_byte_size / 4;

            instruction_field_byte_size += instr.byte_length;

            return instr;
        });

    const scanner_key_index_pairs = standard_instructions
        //@ts-expect-error
        .flatMap(({ ids }, instr_idx) => ids.map(id => [id, standard_byte_codes[instr_idx].pointer]))
        .sort(([a], [b]) => a - b);

    if (
        scanner_key_index_pairs.length > 512
        ||
        scanner_key_index_pairs.slice(-1)[0][0] > 2048
        ||
        (instruction_field_byte_size / 4) > 2048
    ) {
        return null;
    }

    const scan_field_length = scanner_key_index_pairs.length;

    const sequence_entries = [];

    for (const code of standard_byte_codes)
        sequence_entries.push(code.byte_sequence);

    const { use_peek_for_assert_or_consume, consume_peek }
        = getPeekConsumptionFlags(attributes, state_ast);

    let base_byte_size = 12;

    const instruction_sequence = [];

    if (state_ast.fail) {
        base_byte_size += 4;
        instruction_sequence
            .push(["set fail", state_ast.fail.id]);
    }

    instruction_sequence.push(
        ["scanner",
            input_type,
            lexer_type,
            use_peek_for_assert_or_consume,
            consume_peek,
            skip_id,
            tok_id,
            scan_field_length,
            instruction_field_byte_size / 4,
            scanner_key_index_pairs,
            sequence_entries
        ]
    );


    if (default_instruction) {

        const default_data = createInstructionSequence(default_instruction.instructions, grammar, tok_id, skip_id);

        instruction_sequence.push(default_data.byte_sequence);

        return {
            number_of_elements: scanner_key_index_pairs.length,
            instruction_sequence,
            total_size: get8AlignedOffset(base_byte_size + default_data.byte_length + instruction_field_byte_size + scan_field_length * 4)
        };
    }

    instruction_sequence.push(["fail"]);

    base_byte_size += 4;

    return {
        number_of_elements: scanner_key_index_pairs.length,
        instruction_sequence,
        total_size: get8AlignedOffset(base_byte_size + instruction_field_byte_size + scan_field_length * 4)
    };
}
function buildBasicInstructionBlock(state_ast: Resolved_IR_State, tok_id = 0, skip_id = 0, grammar: GrammarObject): BlockData {

    const increment_stack_pointer_for_failure = !!state_ast.fail;

    let { byte_length, byte_sequence } = createInstructionSequence(state_ast.instructions, grammar, tok_id, skip_id);


    const instruction_sequence = [byte_sequence];
    if (state_ast.fail) {

        byte_length += 4;

        instruction_sequence
            .unshift(["set fail", state_ast.fail.id]);
    }

    return { number_of_elements: 1, instruction_sequence: instruction_sequence, total_size: byte_length };
}

function getPeekConsumptionFlags(attributes: StateAttrib, state_ast: Resolved_IR_State) {

    const use_peek_for_assert_or_consume = (!(attributes & (StateAttrib.MULTI_BRANCH)))
        &&
        !(attributes & (StateAttrib.PEEK_BRANCH))
        &&
        (state_ast.instructions[0].type == InstructionType.assert);


    const consume_peek = (!(attributes & (StateAttrib.MULTI_BRANCH)))
        &&
        (!(attributes & (StateAttrib.ASSERT_BRANCH)))
        &&
        state_ast.instructions[0].type == InstructionType.consume;

    return { use_peek_for_assert_or_consume, consume_peek };
}

