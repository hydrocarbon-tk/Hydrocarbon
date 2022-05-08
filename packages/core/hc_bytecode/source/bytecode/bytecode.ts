/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    BlockData,
    BranchIRState,
    BranchIRStateData,
    fail_state_mask,
    getRootSym,
    goto_state_mask,
    GrammarObject,
    Instruction,
    InstructionType,
    InternalStateData as ISD,
    IRAssert,
    IRPeek,
    IR_Instruction,
    ir_reduce_numeric_len_id,
    normal_state_mask, numeric_sort,
    ProductionSymbol,
    Resolved_IR_State, scanner_state_mask, StateAttrib,
    StateMap,
    state_bytecode_byte_start,
    Sym_Is_A_Token,
    TokenSymbol, TokenTypes
} from '@hctoolkit/common';
import { getProductionByName } from '@hctoolkit/grammar';
import { createSymMapId } from "../ir/compile_scanner_states.js";
import { getStateName } from './get_state_name.js';
;

export function compileIRStatesIntoBytecode(
    StateMap: StateMap,
    grammar: GrammarObject,
    sym_map: Map<string, string>
): number[] {

    let total_instruction_byte_size = state_bytecode_byte_start; // Ensure the zero position is reserved for the "null" state

    for (const [, state_data] of StateMap) {

        const { ir_state_ast: state_ast, attributes, string } = state_data;

        let { expected_tokens, skipped_tokens } = state_data;

        let token_state: string = "";

        //@ts-ignore
        if (expected_tokens?.length > 0 || skipped_tokens?.length > 0) {
            //create a meta lookup instruction

            const id = createSymMapId(
                //@ts-ignore
                expected_tokens.setFilter(),
                //@ts-ignore
                skipped_tokens.setFilter(),
                grammar
            );
            //@ts-ignore
            token_state = sym_map.get(id);
        }

        state_data.block_offset = total_instruction_byte_size;

        if (false && (attributes & StateAttrib.REQUIRED_GOTO)
            && state_ast.instructions.length == 1
            && state_ast.instructions[0].type == InstructionType.pass
        ) {
            // Without a fail_state_mask or normal_state_mask this 
            // pointer is equivalent to a fallthrough instruction
            state_data.pointer = total_instruction_byte_size / 4;
        } else {

            state_data.pointer = (state_data.block_offset / 4);

            if ((attributes & StateAttrib.FAIL_STATE) > 0)
                state_data.pointer |= fail_state_mask;
            else
                state_data.pointer |= normal_state_mask;

            if (stateHasBranchIR(state_data)) {
                //sort branch instructions into groups
                const { ir_state_ast: state_ast, attributes } = state_data;
                let _default = null, modes = null;

                if (
                    state_ast.instructions.length > 1
                    &&
                    state_ast.instructions.some(g => g.mode != "PRODUCTION" && g.ids.some(i => i == TokenTypes.DEFAULT))) {
                    _default = state_ast.instructions.filter(g => g.mode != "PRODUCTION" && g.ids.some(i => i == TokenTypes.DEFAULT))[0]
                        ?.instructions;
                    modes = state_ast.instructions.filter(g => !(g.mode != "PRODUCTION" && g.ids.some(i => i == TokenTypes.DEFAULT)))
                        .group(s => s.mode);

                } else {
                    modes = modes = state_ast.instructions.group(s => s.mode);
                }

                if (_default)
                    state_data.block = buildBasicInstructionBlock(state_ast, _default, token_state, grammar, sym_map);

                modes.sort(([a], [b]) => {

                    const ids = ["PRODUCTION", "TOKEN", "CLASS", "CODEPOINT", "BYTE"];

                    return ids.indexOf(a.mode) - ids.indexOf(b.mode);
                });

                for (const mode of modes) {

                    const

                        jump_block_info = buildJumpTableBranchBlock(
                            state_ast, mode, attributes, token_state, grammar, sym_map,
                            state_data.block
                        ), hash_block_info = buildHashTableBranchBlock(
                            state_ast, mode, attributes, token_state, grammar, sym_map,
                            state_data.block
                        ), block = hash_block_info ? selectBestFitBlockType(jump_block_info, hash_block_info)
                            : jump_block_info;

                    state_data.block = block;
                }

                if (state_data.block) {

                    if (state_ast.fail) {
                        state_data.block.total_size += 4;
                        state_data.block.instruction_sequence.unshift(["set fail", <string>state_ast.fail.id]);
                    }

                    total_instruction_byte_size += state_data.block.total_size;
                }

            } else {

                const block_info = buildBasicInstructionBlock(
                    state_ast,
                    state_ast.instructions,
                    token_state,
                    grammar,
                    sym_map
                );

                total_instruction_byte_size += block_info.total_size;

                state_data.block = block_info;
            }
        }

        if (attributes & StateAttrib.SCANNER)
            state_data.pointer |= scanner_state_mask;


        if (attributes & StateAttrib.REQUIRED_GOTO) {
            state_data.pointer += 1;
            state_data.pointer |= goto_state_mask;
            total_instruction_byte_size += 4;
        }
    }

    const out_buffer = [
        (15 << 28) | 1,
        0 << 28,
        15 << 28,
        (8 << 28) | (1 << 24),
        0 | normal_state_mask,
        0,
    ]; // The pass, fail, scope pop, and pass through return instructions

    for (const [name, state_data] of StateMap) {

        if (state_data.attributes & StateAttrib.REQUIRED_GOTO) {
            const prod = getProductionByName(grammar, name.slice(0, -5));
            if (prod) {
                out_buffer.push(prod.id);
            } else {
                out_buffer.push(0xFFFFFFFF);
            }
        }
        if (state_data.block) {

            const buffer = convertBlockDataToBufferData(state_data, StateMap);

            out_buffer.push(...buffer);
        }
    }

    return out_buffer;
}
function insertInstructionSequences(
    instruction_sections: Instruction[],
    state_map: StateMap,
    block_info: BlockData,
    default_block_size: number = 0,
    instruction_offset = 0
): number[] {

    let buffer = [];

    let local_offset = instruction_offset;

    for (const instruction of instruction_sections) {

        let temp_buffer = [];

        local_offset = instruction_offset + buffer.length + temp_buffer.length;

        switch (instruction[0]) {

            case "end": case InstructionType.pass:
                temp_buffer.push(0 >>> 0); break;

            case InstructionType.left_most: {
                temp_buffer.push(13 << 28);
            } break;

            case InstructionType.consume: {
                temp_buffer.push(1 << 28);
            } break;

            case InstructionType.empty_consume: {
                temp_buffer.push((1 << 28) | 1);
            } break;

            case InstructionType.goto: {
                temp_buffer.push((2 << 28)
                    | normal_state_mask
                    | (<ISD>state_map.get(getStateName(instruction[1]))).pointer);
            } break;

            case InstructionType.set_prod: {
                temp_buffer.push(3 << 28 | instruction[1]);
            } break;

            case InstructionType.reduce: {
                let [, sym_len, id] = instruction;

                if (id == 685)
                    console.error({ instruction });

                if (sym_len == ir_reduce_numeric_len_id) {
                    let reduce_fn_id = id;

                    temp_buffer.push(4 << 28 | reduce_fn_id << 16 | 0xFFFF);
                } else {

                    let reduce_fn_id = id;

                    temp_buffer.push(4 << 28 | sym_len << 16 | reduce_fn_id);
                }

            } break;

            case InstructionType.assert_consume: {

                let mode = ((["CLASS", "CODEPOINT", "BYTE"].indexOf(instruction[1])) << 24);

                temp_buffer.push(14 << 28 | mode | (instruction[2] & 0xFFFFFF));
            } break;

            case InstructionType.token_length: {

                let length = instruction[1];

                temp_buffer.push(5 << 28 | 0x04000000 | (length & 0xFFFFFF));
            } break;

            case InstructionType.token_assign: {

                let ids = instruction[1];

                let val = ids[0];

                temp_buffer.push(5 << 28 | 0x08000000 | (val & 0xFFFFFF));
            } break;

            case InstructionType.token_consume_assign: {
                let ids = instruction[1];
                let val = ids[0];
                temp_buffer.push(5 << 28 | 0x09000000 | (val & 0xFFFFFF));
            } break;

            case InstructionType.fork_to: {

                const [, length, gotos] = instruction;

                temp_buffer.push(6 << 28 | length);

                for (const gt of gotos)
                    temp_buffer.push((<ISD>state_map.get(getStateName(gt))).pointer);

            } break;

            case InstructionType.scan_back_until: {
                const [, token_state, length, ids] = instruction;
                temp_buffer.push(7 << 28 | 0x00100000 | (length & 0xFFFF), state_map.get(token_state)?.pointer ?? 0, ...ids);
            } break;

            case InstructionType.scan_until: {
                const [, token_state, length, ids] = instruction;

                temp_buffer.push(7 << 28 | (length & 0xFFFF), state_map.get(token_state)?.pointer ?? 0, ...ids);
            } break;

            case "table": {

                const [, input_type, lexer_type, token_state = "", token_basis, number_of_rows, row_size, table_entries
                ] = instruction;

                const
                    table_header = (9 << 28) |
                        ((["PRODUCTION", "TOKEN", "CLASS", "CODEPOINT", "BYTE"].indexOf(input_type)) << 22)
                        |
                        ((["peek", "assert"].indexOf(lexer_type) + 1) << 26)
                        |
                        (token_basis & 0xFFFF), token_info = state_map.get(token_state)?.pointer ?? 0, table_info = ((number_of_rows & 0xFFFF) << 16)
                            |
                            (row_size & 0xFFFF);

                temp_buffer.push(table_header >>> 0, token_info >>> 0, table_info >>> 0);


                for (const table_entry of table_entries) {
                    temp_buffer.push(...insertInstructionSequences(
                        table_entry, state_map, block_info, row_size,
                        local_offset + temp_buffer.length
                    ));
                };
            } break;

            case "scanner": {

                const
                    [, input_type, lexer_type, token_state, scan_field_length, instruction_field_size, scanner_key_index_pairs, sequence_entries
                    ] = instruction;

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
                    table_header = (10 << 28) |
                        ((["PRODUCTION", "TOKEN", "CLASS", "CODEPOINT", "BYTE"].indexOf(input_type)) << 22)
                        |
                        ((["peek", "assert"].indexOf(lexer_type) + 1) << 26)
                        |
                        (instruction_field_size & 0xFFFF), token_info = (state_map.get(token_state)?.pointer ?? 0), table_info = ((mod_base & 0xFFFF) << 16)
                            |
                            (scanner_key_index_pairs.length & 0xFFFF);

                temp_buffer.push(table_header, token_info, table_info);

                temp_buffer.push(...hash_entries);

                for (const sequence of sequence_entries) {
                    temp_buffer.push(...insertInstructionSequences(
                        sequence, state_map, block_info, 0,
                        local_offset + temp_buffer.length
                    ));
                };

            } break;

            case "set fail": {
                temp_buffer.push(11 << 28 | fail_state_mask | (<ISD>state_map.get(getStateName(instruction[1]))).pointer);
            } break;

            case InstructionType.repeat: {
                const origin = local_offset + 1;
                temp_buffer.push(12 << 28 | origin);
            } break;

            case InstructionType.fail: temp_buffer.push((15 << 28) >>> 0); break;

            case InstructionType.fall_through: temp_buffer.push((15 << 28) | 1); break;

        }

        buffer.push(...temp_buffer);

        local_offset = instruction_offset + buffer.length;
    }

    while (buffer.length < default_block_size)
        buffer.push(0);

    return buffer;
}
function createInstructionSequence(
    active_instructions: IR_Instruction[],
    grammar: GrammarObject,
    token_state: string,
    token_id_to_state: Map<string, string>
): { byte_length: number; byte_sequence: Instruction[]; } {

    const instruction_sequence: Instruction[] = [];

    // The order of the goto instructions are reversed to change 
    // their execution order from FIFO to FILO, conforming to 
    // behavior observed on a stack.
    const goto_instructions = active_instructions.filter(i => i.type == InstructionType.goto || i.type == InstructionType.repeat).reverse();
    const standard_instructions = active_instructions.filter(i => !(i.type == InstructionType.goto || i.type == InstructionType.repeat));

    let byte_length = 0;
    const combined = [...standard_instructions, ...goto_instructions];

    for (let i = 0; i < combined.length; i++) {

        const instr = combined[i];

        switch (instr.type) {
            case InstructionType.inline_assert: {

                let token_state: string = "";

                if (instr.mode == "TOKEN") {

                    const id = createSymMapId(
                        [...instr.token_ids, ...instr.ids].setFilter(),
                        instr.skipped_ids.setFilter(),
                        grammar
                    );

                    if (id)
                        token_state = <string>token_id_to_state.get(id);

                } else if (instr.mode != "PRODUCTION" && instr.ids.length == 1) {
                    if (combined[i + 1] && combined[i + 1].type == InstructionType.consume) {
                        i++; byte_length += 4;
                        instruction_sequence.push([
                            InstructionType.assert_consume,
                            instr.mode,
                            instr.ids[0]
                        ]);

                    }
                    continue;
                }

                if (instr.ids.length > 1) {
                    byte_length += 12 + instr.ids.length * 4 + 4;
                    let instruction: Instruction = [
                        "scanner",
                        instr.mode,
                        InstructionType.assert,
                        token_state,
                        instr.ids.length,
                        0,
                        <[number, number][]>instr.ids.map(i => [i, 1]),
                        []
                    ];
                    instruction_sequence.push(instruction, [InstructionType.fail]);
                } else {
                    byte_length += 16;
                    const basis = instr.ids[0];
                    let instruction: Instruction = createTableInstruction(
                        instr.mode,
                        InstructionType.assert,
                        token_state,
                        basis,
                        1,
                        1,
                        [[[InstructionType.fail]]]
                    );
                    instruction_sequence.push(instruction);
                }

            } break;

            case InstructionType.token_assign:
                byte_length += 4;
                instruction_sequence.push([InstructionType.token_assign, instr.ids]);
                break;

            case InstructionType.token_length:
                byte_length += 4;
                instruction_sequence.push([InstructionType.token_length, instr.len]);
                break;

            case InstructionType.pass:
                byte_length += 4;
                instruction_sequence.push([InstructionType.pass]);
                break;

            case InstructionType.fall_through:
                byte_length += 4;
                instruction_sequence.push([InstructionType.fall_through]);
                break;

            case InstructionType.consume:
                const next = combined[i + 1];

                if (next && next.type == InstructionType.token_assign && !instr.EMPTY) {
                    instruction_sequence.push([InstructionType.token_consume_assign, next.ids]);
                    byte_length += 4;
                    i++;
                } else {
                    byte_length += 4;

                    if (instr.EMPTY)
                        instruction_sequence.push([InstructionType.empty_consume]);

                    else
                        instruction_sequence.push([InstructionType.consume]);
                }

                break;

            case InstructionType.fail:
                byte_length += 4;
                instruction_sequence.push([InstructionType.fail]);
                break;

            case InstructionType.goto:
                byte_length += 4;
                instruction_sequence.push([InstructionType.goto, <string>instr.state]);
                break;

            case InstructionType.set_prod:
                byte_length += 4;
                instruction_sequence.push([
                    InstructionType.set_prod,
                    <number>convertTokenIDsToSymbolIds([<any>instr.id], grammar)[0]
                ]);
                break;

            case InstructionType.fork_to:
                byte_length += 4 + 4 * (instr.states.length);
                instruction_sequence.push([InstructionType.fork_to, instr.states.length, <string[]>instr.states]);
                break;

            case InstructionType.scan_back_until:
                byte_length += 8 + 4 * instr.ids.length;
                instruction_sequence.push([
                    InstructionType.scan_back_until,
                    token_state,
                    instr.ids.length,
                    <number[]>convertTokenIDsToSymbolIds(instr.ids, grammar)
                ]);
                break;

            case InstructionType.scan_until:
                console.error(active_instructions);
                byte_length += 8 + 4 * instr.ids.length;
                instruction_sequence.push([
                    InstructionType.scan_until,
                    token_state,
                    instr.ids.length,
                    convertTokenIDsToSymbolIds(instr.ids, grammar)
                ]);
                break;

            case InstructionType.reduce:
                byte_length += 4;
                let fn_id = 0;

                if (typeof instr.reduce_fn == "object") {
                    fn_id = instr.reduce_fn.reduce_id;
                    instr.len = ir_reduce_numeric_len_id;
                } else {
                    fn_id = instr.reduce_fn;
                }

                instruction_sequence.push([InstructionType.reduce, instr.len, fn_id]);
                break;

            case InstructionType.repeat:
                byte_length += 4;
                instruction_sequence.push([InstructionType.repeat]);
                break;
        }
    }

    const last = <Instruction>instruction_sequence.slice().pop();

    if (last[0] != InstructionType.pass && last[0] != InstructionType.fail) {
        instruction_sequence.push(["end"]);
        byte_length += 4;
    }


    return { byte_length, byte_sequence: instruction_sequence };
}
export function assignStateAttributeInformation(StateMap: StateMap, grammar: GrammarObject) {


    for (const [state_name, state_data] of StateMap) {

        let attributes = state_data.attributes;

        //Construct base state attributes 
        // Get all initial states. if branch function,
        // assert all top level instructions are of the
        // the same class [prod or token]
        if (state_name.match(/_goto$/))
            attributes |= StateAttrib.REQUIRED_GOTO;

        const token_instr_types = {
            [InstructionType.assert]: StateAttrib.ASSERT_BRANCH,
            [InstructionType.peek]: StateAttrib.PEEK_BRANCH,
        };
        //@ts-ignore
        attributes |= state_data.ir_state_ast.instructions.reduce(
            //@ts-ignore
            (r, v) => ((r) | (token_instr_types[v.type] ?? 0)),
            0);

        if ((attributes & (StateAttrib.TOKEN_BRANCH)) > 0
            &&
            state_data.ir_state_ast.instructions.length > 1)
            attributes |= StateAttrib.MULTI_BRANCH;

        if ((attributes & StateAttrib.TOKEN_BRANCH) > 0
            &&
            (attributes & StateAttrib.PROD_BRANCH) > 0)
            new Error(`Unsupported mixture of token branch (assert | peek) and production branch ( on prod ) instructions`);

        if ((attributes & (StateAttrib.ASSERT_BRANCH)) > 0
            &&
            (attributes & StateAttrib.PEEK_BRANCH) > 0)
            new Error(`Unsupported mixture of assertion branch ( assert ) and peek branch ( peek ) instructions`);

        state_data.attributes = attributes;
    }
}
function convertTokenIDsToSymbolIds(ids: (number | string | TokenSymbol | ProductionSymbol)[], grammar: GrammarObject): number[] {
    let out_ids: number[] = [];

    for (const id of ids) {

        if (typeof id == "number" || typeof id == "string")
            out_ids.push(<number>id);

        else if (Sym_Is_A_Token(id))
            out_ids.push(<number>getRootSym(id, grammar).id);

        else {
            out_ids.push(grammar.productions[id.val].id);
        }
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

                if (instruction.mode == "TOKEN") {
                    //@ts-ignore
                    expected_symbols.push(...convertTokenIDsToSymbolIds(instruction.ids, grammar));
                    processInstructionTokens(instruction.instructions, expected_symbols, grammar);
                }

                break;
            case InstructionType.scan_until:
                //@ts-ignore
                expected_symbols.push(...convertTokenIDsToSymbolIds(instruction.ids, grammar));
                break;

        }
    }
}
export function extractTokenSymbols(state_data: ISD, grammar: GrammarObject) {

    const expected_symbols: number[] = [];

    const skipped_symbols: number[] = [];

    processInstructionTokens(
        state_data.ir_state_ast.instructions,
        expected_symbols,
        grammar
    );

    if (state_data.ir_state_ast.symbol_meta) {
        const { expected, skipped } = state_data.ir_state_ast.symbol_meta;
        expected_symbols.push(...<number[]>expected);
        skipped_symbols.push(...<number[]>skipped);
    }

    state_data.expected_tokens = expected_symbols.filter(s => s != TokenTypes.DEFAULT); // <- remove default value
    state_data.skipped_tokens = skipped_symbols.filter(s => s != TokenTypes.DEFAULT); // <- remove default value
}
function convertBlockDataToBufferData(state_data: ISD, state_map: StateMap): number[] {

    const block_info = state_data.block;

    const buffer = [];

    if (block_info) {

        buffer.push(...insertInstructionSequences(
            block_info.instruction_sequence,
            state_map,
            block_info,
            (block_info.total_size / 4)
        ));

        if (buffer.length != (block_info.total_size / 4)) {
            throw new Error(
                `Buffer data length does not match length calculated in BlockData. 
                Expected a block size of ${block_info.total_size / 4} words;
                Got a block size of ${buffer.length} words;
                Original state [ ${state_data.ir_state_ast.id} ]: \n\n${state_data.string}\n\n
                `);
        }
    }

    return buffer;
}

function stateHasBranchIR(state_data: ISD): state_data is BranchIRStateData {
    return (
        state_data.ir_state_ast.instructions[0].type == InstructionType.assert
        ||
        state_data.ir_state_ast.instructions[0].type == InstructionType.peek
    );
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
        (sparse_table_fill_ratio < 4 && block_size_ratio < 4)) ? jump_table_block : hash_table_block;


    return block;
}
function get8AlignedOffset(request_size: number) {
    return Math.ceil(request_size / 4) * 4;
}
function get32AlignedOffset(request_size: number) {
    return Math.ceil(request_size / 32) * 32;
}
function createTableInstruction(
    input_type: "PRODUCTION" | "TOKEN" | "BYTE" | "CODEPOINT" | "CLASS",
    lexer_type: InstructionType.peek | InstructionType.assert = InstructionType.assert,
    token_state: string,
    basis: number,
    number_of_rows: number,
    row_32bit_size: number,
    table_entries: Instruction[][]
): Instruction {
    return ["table",
        input_type,
        lexer_type,
        token_state,
        basis,
        number_of_rows,
        row_32bit_size,
        table_entries,];
}
function buildJumpTableBranchBlock(
    state_ast: BranchIRState,
    instructions: (IRPeek | IRAssert)[],
    attributes: StateAttrib,
    token_state: string,
    grammar: GrammarObject,
    token_id_to_state: Map<string, string>,
    default_block: BlockData | null = null
): BlockData {


    let standard_instructions = instructions;


    const input_type = instructions[0].mode;
    const lexer_type = instructions[0].type;

    const ids: number[] = <number[]>standard_instructions.flatMap(i => <number[]>i.ids).sort(numeric_sort);

    const standard_byte_codes = standard_instructions
        .flatMap(({ ids, instructions, type }) => {

            const instr = createInstructionSequence(instructions, grammar, token_state, token_id_to_state);
            return ids.filter(i => i != TokenTypes.DEFAULT).map(i => ({ id: i, code: instr }));
        });


    const number_of_rows = 1 + ids[ids.length - 1] - ids[0];

    const basis = ids[0];

    const table_entries: Instruction[][] = [];

    let last_offset = basis;

    let max_instruction_byte_size = 4;
    for (const { id, code } of standard_byte_codes.sort((a, b) => <number>a.id - <number>b.id)) {


        while (++last_offset <= id) {
            if (default_block) {
                table_entries.push(default_block.instruction_sequence);
                max_instruction_byte_size = Math.max(max_instruction_byte_size, default_block.total_size);
            } else {
                table_entries.push([[InstructionType.fail]]);
                max_instruction_byte_size = Math.max(max_instruction_byte_size, 4);
            }
        }
        max_instruction_byte_size = Math.max(max_instruction_byte_size, code.byte_length);
        table_entries.push(code.byte_sequence);
    }

    let base_size = 12;

    const instruction_sequence: Instruction[] = [];

    if (default_block) {

        max_instruction_byte_size = Math.max(max_instruction_byte_size, default_block.total_size);

        table_entries.unshift(default_block.instruction_sequence);

    } else {
        table_entries.unshift([[InstructionType.fail]]);
    }

    const row_size = max_instruction_byte_size / 4;

    instruction_sequence.push(
        createTableInstruction(
            input_type,
            lexer_type,
            token_state,
            basis,
            number_of_rows,
            row_size,
            table_entries
        )
    );

    return {
        number_of_elements: number_of_rows,
        instruction_sequence,
        total_size: get8AlignedOffset(base_size + max_instruction_byte_size * (number_of_rows + 1))
    };
}
function buildHashTableBranchBlock(
    state_ast: BranchIRState,
    instructions: (IRPeek | IRAssert)[],
    attributes: StateAttrib,
    token_state: string,
    grammar: GrammarObject,
    token_ids_to_state: Map<string, string>,
    default_block: BlockData | null = null
): BlockData | null {


    let standard_instructions = instructions;

    const input_type = instructions[0].mode;
    const lexer_type = instructions[0].type;

    let instruction_field_byte_size = 0;

    const standard_byte_codes = standard_instructions
        .map(({ instructions, type, ids }) => {

            const instr = createInstructionSequence(instructions, grammar, token_state, token_ids_to_state);

            //@ts-expect-error
            instr.pointer = instruction_field_byte_size / 4;

            instruction_field_byte_size += instr.byte_length;

            return instr;
        });

    const scanner_key_index_pairs = standard_instructions
        //@ts-expect-error
        .flatMap(({ ids }, instr_idx) => ids.map(id => [id, standard_byte_codes[instr_idx].pointer]))
        .sort(([a], [b]) => a - b);

    if (scanner_key_index_pairs.length > 512
        ||
        scanner_key_index_pairs.slice(-1)[0][0] > 2048
        ||
        (instruction_field_byte_size / 4) > 2048) {

        return null;
    }

    const scan_field_length = scanner_key_index_pairs.length;

    const sequence_entries: Instruction[][] = [];

    for (const code of standard_byte_codes)
        sequence_entries.push(code.byte_sequence);

    let base_byte_size = 12;

    const instruction_sequence: Instruction[] = [];

    instruction_sequence.push(
        <Instruction>["scanner",
            input_type,
            lexer_type,
            token_state,
            scan_field_length,
            instruction_field_byte_size / 4,
            scanner_key_index_pairs,
            sequence_entries
        ]
    );


    if (default_block) {

        instruction_sequence.push(...default_block.instruction_sequence);

        return {
            number_of_elements: scanner_key_index_pairs.length,
            instruction_sequence,
            total_size: get8AlignedOffset(base_byte_size + default_block.total_size + instruction_field_byte_size + scan_field_length * 4)
        };
    }

    instruction_sequence.push([InstructionType.fail]);

    base_byte_size += 4;

    return {
        number_of_elements: scanner_key_index_pairs.length,
        instruction_sequence,
        total_size: get8AlignedOffset(base_byte_size + instruction_field_byte_size + scan_field_length * 4)
    };
}
function buildBasicInstructionBlock(
    state_ast: Resolved_IR_State,
    instructions: IR_Instruction[],
    token_state: string,
    grammar: GrammarObject,
    sym_map: Map<string, string>
): BlockData {

    let { byte_length, byte_sequence } = createInstructionSequence(instructions, grammar, token_state, sym_map);


    const instruction_sequence = [...byte_sequence];

    if (state_ast.fail) {

        byte_length += 4;

        instruction_sequence
            .unshift(["set fail", <string>state_ast.fail.id]);
    }

    return { number_of_elements: 1, instruction_sequence: instruction_sequence, total_size: byte_length };
}
