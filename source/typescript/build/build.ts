/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import spark from "@candlelib/spark";
import { WorkerRunner } from "../build/workers/worker_runner.js";
import parser_loader from "../grammar/hcg_parser.js";
import { getProductionByName } from '../grammar/nodes/common.js';
import { getRootSym, Sym_Is_A_Token } from '../grammar/nodes/symbol.js';
import { BuildPack } from "../render/render.js";
import { fail_state_mask } from '../runtime/kernel.js';
import { GrammarObject, ProductionImportSymbol, ProductionSymbol, TokenSymbol } from "../types/grammar_nodes";
import { IRStateData, StateAttrib, StateMap } from '../types/ir_state_data';
import { BlockData, InstructionType, IR_Instruction, ResolvedIRBranch, Resolved_IR_State } from '../types/ir_types';
import { getSymbolMapFromIds } from '../utilities/code_generating.js';

const ir_parser = await parser_loader;

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
                    const ir_state = ir_parser(str, {}, ir_parser.ir_state)
                        .result[0];
                    return [str, ir_state];
                } catch (e) {
                    console.log(hash, str);
                    throw e;
                }
            }
        ),
        ...grammar.ir_states
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

    //Process States -------------------------------------------------------------

    const sym_map: Map<string, number> = new Map();

    statesOutputsInitialPass(states_map, grammar);

    let prev_size = states_map.size;

    let ALLOW_OPTIMIZATIONS = false;

    let original_states = new Map(states_map);

    if (ALLOW_OPTIMIZATIONS)
        while (statesOutputsOptimizationPass(states_map, grammar, original_states)) {

            console.log(`reduction ratio ${Math.round((1 - (states_map.size / prev_size)) * 100)}% - prev size ${prev_size} - current size ${states_map.size}`);

            prev_size = states_map.size;
        }

    const state_buffer = new Uint32Array(statesOutputsBuildPass(states_map, grammar, sym_map));

    //Compile Recognizer Components -------------------------------------------------------------

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
        debugger;

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

                    if (sym_len == 0x90FA0102) {
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

                case InstructionType.scan_until: {
                    let length = +data[++i];
                    temp_buffer.push(7 << 28 | length, ...data.slice(i + 1, i + 1 + length));
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

                    const
                        table_header =
                            (10 << 28) |
                            ((["production", "token"].indexOf(input_type) + 1) << 24)
                            |
                            ((["peek", "assert"].indexOf(lexer_type) + 1) << 26)
                            |
                            (+use_peek_for_assert_or_consume << 2)
                            |
                            (+consume_peek << 3)
                            |
                            (0 & 0xFFFF),

                        token_info =
                            (skip_table_row & 0xFFFF)
                            |
                            ((token_table_row & 0xFFFF) << 16),

                        table_info =
                            ((scan_field_length & 0xFFFF) << 16)
                            |
                            (instruction_field_size & 0xFFFF);

                    temp_buffer.push(table_header, token_info, table_info);

                    for (const [key, val] of scanner_key_index_pairs) {
                        temp_buffer.push(key, val);
                    }



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
                byte_sequence.push(InstructionType.set_prod, ...convertTokenIDsToSymbolIds([instr.id], grammar));
                break;

            case InstructionType.fork_to:
                byte_length += 4 + 4 * (instr.states.length);
                byte_sequence.push(InstructionType.fork_to, instr.states.length, ...instr.states);
                break;

            case InstructionType.scan_until:
                byte_length += 8 + 4 * instr.ids.length;
                byte_sequence.push(InstructionType.scan_until, token_id, instr.ids.length, ...convertTokenIDsToSymbolIds(instr.ids, grammar));
                break;

            case InstructionType.pop:
                byte_length += 4;
                byte_sequence.push(InstructionType.pop, instr.len);
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

function statesOutputsInitialPass(StateMap: StateMap, grammar: GrammarObject) {


    for (const [state_name, state_data] of StateMap) {


        //Build reference counts
        const instructions = [...state_data.ir_state_ast.instructions];

        let attributes = state_data.attributes;

        for (const instruction of instructions) {
            switch (instruction.type) {

                case InstructionType.goto: {

                    attributes |= StateAttrib.HAS_GOTOS;

                    const state = getStateName(instruction.state);

                    StateMap.get(state).reference_count++;

                } break;

                case InstructionType.fork_to: {
                    for (const state of instruction.states) {

                        StateMap
                            .get(getStateName(state))
                            .reference_count++;
                    }
                } break;

                case InstructionType.prod:
                case InstructionType.peek:
                case InstructionType.consume:
                case InstructionType.no_consume:
                case InstructionType.assert:
                    {
                        instructions.push(...instruction.instructions);
                    } break;
            }
        }

        //Construct base state attributes 

        // Get all initial states. if branch function,
        // assert all top level instructions are of the
        // the same class [prod or token]

        const token_instr_types = {
            [InstructionType.assert]: StateAttrib.ASSERT_BRANCH,
            [InstructionType.consume]: StateAttrib.CONSUME_BRANCH,
            [InstructionType.no_consume]: StateAttrib.CONSUME_BRANCH,
            [InstructionType.peek]: StateAttrib.PEEK_BRANCH,
            [InstructionType.prod]: StateAttrib.PROD_BRANCH
        };

        attributes |= state_data.ir_state_ast.instructions.reduce((r, v) =>
            r | (token_instr_types[v.type] ?? 0), 0);

        if ((attributes & (StateAttrib.TOKEN_BRANCH | StateAttrib.CONSUME_BRANCH)) > 0
            &&
            state_data.ir_state_ast.instructions.length > 1
        ) attributes |= StateAttrib.MULTI_BRANCH;

        if (
            (attributes & StateAttrib.TOKEN_BRANCH) > 0
            &&
            (attributes & StateAttrib.PROD_BRANCH) > 0
        ) new Error(`Unsupported mixture of token branch (assert | consume | peek) and production branch ( on prod ) instructions`);

        if (
            (attributes & (StateAttrib.ASSERT_BRANCH | StateAttrib.CONSUME_BRANCH)) > 0
            &&
            (attributes & StateAttrib.PEEK_BRANCH) > 0
        ) new Error(`Unsupported mixture of assertion branch (assert | consume ) and peek branch ( peek ) instructions`);

        state_data.attributes = attributes;


        //Collect all symbols that this state references

        extractTokenSymbols(state_data, grammar);
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
            case InstructionType.consume:
            case InstructionType.no_consume:
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

    state_data.expected_tokens = expected_symbols.filter(s => s != 9999); // <- remove default value
    state_data.skipped_tokens = skipped_symbols.filter(s => s != 9999);// <- remove default value
}

function statesOutputsOptimizationPass(StateMap: StateMap, grammar: GrammarObject, StateMap_: StateMap): boolean {

    let MUTATION_OCCURRED = false;

    const to_remove = [];

    for (const [state_name, state_data] of StateMap) {

        const { ir_state_ast: state_ast, attributes, string } = state_data;

        const { instructions, symbol_meta } = state_ast;

        if ((
            attributes & StateAttrib.ASSERT_BRANCH
            ||
            attributes & StateAttrib.CONSUME_BRANCH)
        ) {

            const state_name = getStateName(instructions[0].instructions[0].state);

            if (
                !(attributes & StateAttrib.MULTI_BRANCH)
                &&
                instructions[0].type == InstructionType.assert
                &&
                instructions[0].instructions[0].type == InstructionType.goto
                &&
                (StateMap.get(state_name).attributes & StateAttrib.PRODUCTION_ENTRY)
            ) {
                //Replace the state with contents of the production state
                const prod_state = StateMap.get(state_name);


                state_data.attributes = prod_state.attributes ^ StateAttrib.PRODUCTION_ENTRY;
                // Flatten the state since the assert is now superfluous.
                // The production state will make the same assertion

                state_ast.instructions = state_ast.instructions[0].instructions;


                state_ast.instructions.splice(0, 1, ...prod_state.ir_state_ast.instructions);

                prod_state.ir_state_ast.instructions.forEach((instr) => {
                    if (instr.type == InstructionType.goto) {

                        const state = getStateName(instr.state);

                        StateMap.get(state).reference_count++;
                    }
                });


                MUTATION_OCCURRED = true;
                continue;
            }

            for (let i = 0; i < instructions.length; i++) {

                const instruction = instructions[i];

                if (

                    instruction.type == InstructionType.assert
                    &&
                    instruction.instructions[0].type == InstructionType.goto
                ) {
                    //Reduce asserts with consumes form single branch productions

                    const state = getStateName(instruction.instructions[0].state);

                    const goto_state = StateMap.get(state);

                    const { ir_state_ast: state_ast, attributes, string: goto_string } = goto_state;

                    if (
                        (attributes & StateAttrib.CONSUME_BRANCH)
                        &&
                        !(attributes & StateAttrib.MULTI_BRANCH)
                    ) {

                        instruction.type = InstructionType.consume;

                        instruction.instructions.splice(0, 1, ...state_ast.instructions[0].instructions);

                        incrementGotoReferenceCounts(state_ast.instructions[0].instructions, grammar, StateMap);

                        decreaseReference(goto_state, to_remove);

                        MUTATION_OCCURRED = true;

                        continue;
                    }
                }

                if (
                    (
                        (
                            instruction.type == InstructionType.assert
                            ||
                            instruction.type == InstructionType.no_consume
                            ||
                            instruction.type == InstructionType.consume
                            ||
                            instruction.type == InstructionType.prod)
                    )
                ) {

                    const instructions = instruction.instructions;

                    for (let j = 0; j < instructions.length; j++) {
                        const instruction = instructions[j];
                        if (
                            instruction.type == InstructionType.goto
                        ) {
                            //Reduce asserts with consumes form single branch productions

                            const goto_state = StateMap.get(getStateName(instruction.state));

                            const { ir_state_ast: state_ast, attributes, string: goto_string } = goto_state;

                            if (
                                !(attributes & (StateAttrib.TOKEN_BRANCH | StateAttrib.PROD_BRANCH))
                                &&
                                (
                                    !(attributes & StateAttrib.HAS_GOTOS) /*|| (
                                        ((instructions.length == 1)
                                            ||
                                            (j == instructions.length - 1)
                                            ||
                                            (
                                                (
                                                    instructions[j + 1].type == InstructionType.goto
                                                    ||
                                                    instructions[j + 1].type == InstructionType.repeat
                                                )
                                                &&
                                                (
                                                    j == 0 || !(
                                                        instructions[j - 1].type == InstructionType.goto
                                                        ||
                                                        instructions[j - 1].type == InstructionType.repeat
                                                    )
                                                )
                                            )) && state_ast.instructions.slice(-1)[0].type != InstructionType.repeat
                                    )*/
                                )
                            ) {
                                instructions.splice(j, 1, ...state_ast.instructions);

                                incrementGotoReferenceCounts(state_ast.instructions, grammar, StateMap);

                                decreaseReference(goto_state, to_remove);

                                MUTATION_OCCURRED = true;

                                continue;
                            }
                        }
                    }
                    continue;
                }

                if (
                    instruction.type == InstructionType.goto
                ) {
                    //Reduce asserts with consumes form single branch productions

                    const goto_state = StateMap.get(getStateName(instruction.state));

                    const { ir_state_ast: state_ast, attributes, string: goto_string } = goto_state;

                    if (
                        !(attributes & (StateAttrib.TOKEN_BRANCH | StateAttrib.PROD_BRANCH))
                        &&
                        (!(attributes & StateAttrib.HAS_GOTOS) || (
                            (instructions.length == 1)
                            ||
                            (i == instructions.length - 1)
                            ||
                            (
                                (
                                    instructions[i + 1].type == InstructionType.goto
                                    ||
                                    instructions[i + 1].type == InstructionType.repeat
                                )
                                &&
                                (
                                    i == 0 || !(
                                        instructions[i - 1].type == InstructionType.goto
                                        ||
                                        instructions[i - 1].type == InstructionType.repeat
                                    )
                                )
                            )
                        ))
                    ) {

                        instructions.splice(i, 1, ...state_ast.instructions);

                        incrementGotoReferenceCounts(state_ast.instructions, grammar, StateMap);

                        decreaseReference(goto_state, to_remove);

                        MUTATION_OCCURRED = true;

                        continue;
                    }
                }
            }
        }
    }

    for (const state_name of to_remove)
        StateMap.delete(state_name);


    return MUTATION_OCCURRED;
}

function incrementGotoReferenceCounts(instructions: IR_Instruction[], grammar: GrammarObject, StateMap: StateMap) {
    instructions.forEach((instr) => {
        if (instr.type == InstructionType.goto) {

            const state = getStateName(instr.state);

            StateMap.get(state).reference_count++;
        }
    });
}

function decreaseReference(goto_state: IRStateData, to_remove: string[]) {

    goto_state.reference_count--;

    if (
        goto_state.reference_count <= 0
        &&
        !(goto_state.attributes & StateAttrib.PRODUCTION_ENTRY)
    ) {
        to_remove.push(getStateName(goto_state.ir_state_ast.id));
    }
}

function statesOutputsBuildPass(StateMap: StateMap, grammar: GrammarObject, sym_map: Map<string, number> = new Map(),) {

    let total_instruction_byte_size = 8; // Ensure the zero position is reserved for the "null" state

    for (const [state_name, state_data] of StateMap) {

        const { ir_state_ast: state_ast, attributes, string } = state_data;

        const { instructions, symbol_meta } = state_ast;

        let skip_id = 0, tok_id = 0;

        if (symbol_meta) {
            //create a meta lookup instruction
            let { expected_tokens, skipped_tokens } = state_data;

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

                table_block_info = buildBranchTableBlock(
                    state_ast, attributes, tok_id, skip_id, "production", "peek", grammar
                ),

                scan_block_info = buildScanningBranchBlock(
                    state_ast, attributes, tok_id, skip_id, "production", "peek", grammar
                ),

                block = selectBestFitBlockType(table_block_info, scan_block_info);

            total_instruction_byte_size += block.total_size;

            state_data.block = block;

        } else if ((attributes & (StateAttrib.TOKEN_BRANCH)) > 0) {

            const
                lexer_state = (attributes & (StateAttrib.PEEK_BRANCH)) ? "peek" : "assert",

                table_block_info = buildBranchTableBlock(
                    state_ast, attributes, tok_id, skip_id, "token", lexer_state, grammar
                ),

                scan_block_info = buildScanningBranchBlock(
                    state_ast, attributes, tok_id, skip_id, "token", lexer_state, grammar
                ),

                block = selectBestFitBlockType(table_block_info, scan_block_info);

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
function selectBestFitBlockType(table_block_info: BlockData, scan_block_info: BlockData) {
    const block_size_ratio = table_block_info.total_size / scan_block_info.total_size;
    //Ratio between
    const sparse_table_fill_ratio = table_block_info.number_of_entries
        / (scan_block_info.number_of_entries);

    const block = (
        (!isNaN(sparse_table_fill_ratio) && !isNaN(block_size_ratio)) &&
        (sparse_table_fill_ratio > 1.8 || block_size_ratio > 1.5)) ? scan_block_info : table_block_info;


    return block;
}

function get8AlignedOffset(request_size: number) {
    return Math.ceil(request_size / 8) * 8;
}

function get32AlignedOffset(request_size: number) {
    return Math.ceil(request_size / 32) * 32;
}

function buildBranchTableBlock(
    state_ast: Resolved_IR_State,
    attributes: StateAttrib,
    tok_id = 0,
    skip_id = 0,
    input_type: "production" | "token" = "production",
    lexer_type: "assert" | "peek" = "assert",
    grammar: GrammarObject
): BlockData {

    const instructions = state_ast.instructions as ResolvedIRBranch[];

    const default_instruction = instructions.filter(i => i.ids.some(i => i == 9999))[0];

    const standard_instructions = instructions.filter(i => !i.ids.some(i => i == 9999));

    if (standard_instructions.length == 0 && default_instruction) {
        const new_state = Object.assign({}, state_ast, { instructions: default_instruction.instructions });

        return buildBasicInstructionBlock(new_state, tok_id, skip_id, grammar);
    }
    const ids = standard_instructions.flatMap(i => i.ids).sort(numeric_sort);

    const standard_byte_codes = standard_instructions
        .flatMap(({ ids, instructions, type }) => {

            const instr = createInstructionSequence(instructions, grammar, tok_id, skip_id);

            addAdditionalInstructions(type, ids, grammar, instr);
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
            number_of_entries: number_of_rows,
            instruction_sequence,
            total_size: get8AlignedOffset(base_size + default_data.byte_length + max_instruction_byte_size * number_of_rows + 1)
        };
    }

    instruction_sequence.push(["fail"]);

    base_size += 4;

    return {
        number_of_entries: number_of_rows,
        instruction_sequence,
        total_size: get8AlignedOffset(base_size + max_instruction_byte_size * number_of_rows + 1)
    };
}

function buildScanningBranchBlock(
    state_ast: Resolved_IR_State,
    attributes: StateAttrib,
    tok_id = 0,
    skip_id = 0,
    input_type: "production" | "token" = "production",
    lexer_type: "assert" | "peek" = "assert",
    grammar: GrammarObject
): BlockData {

    const instructions = state_ast.instructions as ResolvedIRBranch[];

    const default_instruction = instructions.filter(i => i.ids.some(i => i == 9999))[0];
    const standard_instructions = instructions.filter(i => !i.ids.some(i => i == 9999));

    if (standard_instructions.length == 0 && default_instruction) {
        const new_state = Object.assign({}, state_ast, { instructions: default_instruction.instructions });
        return buildBasicInstructionBlock(new_state, tok_id, skip_id, grammar);
    }

    let instruction_field_size = 0;

    const standard_byte_codes = standard_instructions
        .map(({ instructions, type, ids }) => {

            const instr = createInstructionSequence(instructions, grammar, tok_id, skip_id);

            addAdditionalInstructions(type, ids, grammar, instr);

            //@ts-expect-error
            instr.pointer = instruction_field_size / 4;

            instruction_field_size += instr.byte_length;

            return instr;
        });

    const scanner_key_index_pairs = standard_instructions
        //@ts-expect-error
        .flatMap(({ ids }, instr_idx) => ids.map(id => [id, standard_byte_codes[instr_idx].pointer]))
        .sort(([a], [b]) => a - b);

    const scan_field_length = scanner_key_index_pairs.length * 2;

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
            instruction_field_size / 4,
            scanner_key_index_pairs,
            sequence_entries]
    );


    if (default_instruction) {

        const default_data = createInstructionSequence(default_instruction.instructions, grammar, tok_id, skip_id);

        instruction_sequence.push(default_data.byte_sequence);

        return {
            number_of_entries: standard_instructions.length,
            instruction_sequence,
            total_size: get8AlignedOffset(base_byte_size + default_data.byte_length + instruction_field_size + scan_field_length * 4)
        };
    }

    instruction_sequence.push(["fail"]);

    base_byte_size += 4;

    return {
        number_of_entries: standard_instructions.length,
        instruction_sequence,
        total_size: get8AlignedOffset(base_byte_size + instruction_field_size + scan_field_length * 4)
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

    return { number_of_entries: 1, instruction_sequence: instruction_sequence, total_size: byte_length };
}

function addAdditionalInstructions(
    type: InstructionType,
    ids: number[],
    grammar: GrammarObject,
    instr: { byte_length: number; byte_sequence: any; }
) {
    if (type == InstructionType.consume) {
        instr.byte_sequence.unshift(InstructionType.consume);
        instr.byte_length += 4;
    } else if (type == InstructionType.no_consume) {
        instr.byte_sequence.unshift(InstructionType.token_length, InstructionType.consume);
        instr.byte_length += 8;
    }
}

function getPeekConsumptionFlags(attributes: StateAttrib, state_ast: Resolved_IR_State) {
    const use_peek_for_assert_or_consume = (!(attributes & (StateAttrib.MULTI_BRANCH)))
        &&
        !(attributes & (StateAttrib.PEEK_BRANCH))
        &&
        (state_ast.instructions[0].type == InstructionType.consume
            ||
            state_ast.instructions[0].type == InstructionType.assert);

    const consume_peek = (!(attributes & (StateAttrib.MULTI_BRANCH)))
        &&
        (!(attributes & (StateAttrib.ASSERT_BRANCH)))
        &&
        state_ast.instructions[0].type == InstructionType.consume;
    return { use_peek_for_assert_or_consume, consume_peek };
}

function getInstructionComplexity(instr) {
    return 1 + (instr?.then?.length ?? 0);
}


