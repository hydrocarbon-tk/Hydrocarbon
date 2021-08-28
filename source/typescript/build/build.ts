import spark from "@candlelib/spark";
import { Lexer } from '@candlelib/wind';
import { createRunner, Helper } from "../build/helper.js";
import { WorkerRunner } from "../build/workers/worker_runner.js";
import { getProductionByName } from '../grammar/nodes/common.js';
import { HCG3Grammar } from "../types/grammar_nodes.js";
import { RDProductionFunction } from "../types/rd_production_function.js";
import { getSymbolMapFromIds } from '../utilities/code_generating.js';
import parser_loader from "./table_code.js";

const parse_table_code = await parser_loader;

export async function buildRecognizer(
    grammar: HCG3Grammar,
    number_of_workers: number = 1,
    ADD_ANNOTATIONS: boolean = false
): Promise<{
    recognizer_functions: RDProductionFunction[];
    meta: Helper;
}> {

    const
        runner: Helper = createRunner(ADD_ANNOTATIONS, false),

        mt_code_compiler = new WorkerRunner(grammar, runner, number_of_workers);

    for (const updates of mt_code_compiler.run())
        await spark.sleep(1);

    const states = [...mt_code_compiler.tables.values()];

    const state_asts: Map<string, any> = new Map();

    //convert states to code

    for (const state_string of states) {

        const state_ast = parse_table_code(state_string).result[0];

        state_ast.__source__ = state_string;

        state_asts.set(state_ast.id, { string: state_string, state_ast });
    }

    buildStatesOutputs(state_asts, grammar);

    console.log({ states: states.length });
    throw "AAAAA";

    //Go through the build pass


    return {
        recognizer_functions: mt_code_compiler.functions,
        meta: runner
    };
}

const numeric_sort = (a: number, b: number): number => a - b;

interface State {
    type: "state";
    id: string;
    instructions: Instruction[];
    symbol_meta?: {
        type: "symbols",
        expected: number[],
        skipped: number[],
    };
    fail?: {
        type: "on-fail-state",
        id: string,
        instructions: Instruction[];
        symbol_meta?: {
            type: "symbols",
            expected: number[],
            skipped: number[],
        };
    };
}

enum InstructionType {
    prod = "prod",
    consume = "consume",
    peek = "peek",
    assert = "assert",
    goto = "goto",
    reduce = "reduce",
    set_prod = "set-prod",
    fork_to = "fork-to",
    scan_until = "scan-until",
    pop = "pop",
    on_fail = "on-fail",
    token_length = "token-length",
    pass = "pass",
    fail = "fail"
}

interface Instruction {
    type: InstructionType;
    ids?: number[];
    state?: string;
    states?: string[];
    id?: number;
    instructions?: Instruction[];
}

type bit = number;
type u32 = number;
type u16 = number;
type u8 = number;
type u2 = number;
type u3 = number;
type u10 = number;

interface StateTableEntryHeader {

    //32bytes
    table_or_sequence_size: u16;
    increment_stack_pointer_for_failure: bit,
    have_default_action: bit,
    undefined2: u2;
    undefined3: u2;
    undefined1: u2;
    state_type: u2;
    undefined4: u2;
    undefined5: u2;
    undefined6: u2;


    //32 Bytes
    failure_state_data: u32,

    //32Bytes
    skip_table_row: u16;
    token_table_row: u16;

    //32 Bytes
    row_size: u16;
    prod_or_tok_basis: u16;
}

function statesOutputsInitialPass(StatesOutputs: Map<string, {
    string: string, state_ast: State;
}>, grammar: HCG3Grammar) {
}

function statesOutputsOptimizationPass(StatesOutputs: Map<string, {
    string: string, state_ast: State;
}>, grammar: HCG3Grammar) {
}

function statesOutputsBuildPass(StatesOutputs: Map<string, {
    string: string, state_ast: State;
}>, grammar: HCG3Grammar) {
}

type StateMap = Map<string, {
    string: string;
    state_ast: State;
    pointer: number,
    block_offset: number,
    block: BlockData;
}>;

function buildStatesOutputs(StateMap: StateMap, grammar: HCG3Grammar) {

    const sequence_table: Map<string, number[]> = new Map();

    const blocks = [];

    const sym_map: Map<string, number> = new Map();

    let total_instruction_byte_size = 0;

    for (const [state_name, state_data] of StateMap) {
        //Extract and create failed states
        if (state_data.state_ast.fail) {

            const fail_state = state_data.state_ast.fail;

            StateMap.set(fail_state.id, {
                block: null,
                block_offset: 0,
                pointer: 0,
                state_ast: fail_state,
                string: state_data.string
            });
        }
    }

    for (const [state_name, state_data] of StateMap) {
        const { state_ast } = state_data;
        const { instructions, symbol_meta, fail } = state_data.state_ast;

        // Get all initial states. if branch function,
        // assert all top level instructions are of the 
        // the same class [prod or token]

        let IS_TOKEN_BRANCH = false;
        let IS_PROD_BRANCH = false;

        const token_instr_types = ["assert", "consume", "peek"];

        if (token_instr_types.includes(instructions[0].type)) {
            IS_TOKEN_BRANCH = instructions.reduce((val, { type }) => val && token_instr_types.includes(type), true);

            if (!IS_TOKEN_BRANCH) {
                throw new Error(`Expected state [${state_name}] to be comprised of top level token instructions`);
            }
        }

        const prod_instr_types = ["prod"];

        if (prod_instr_types.includes(instructions[0].type)) {
            IS_PROD_BRANCH = instructions.reduce((val, { type }) => val && prod_instr_types.includes(type), true);

            if (!IS_PROD_BRANCH) {
                throw new Error(`Expected state [${state_name}] to be comprised of top level prod instructions`);
            }
        }

        let STATE_IS_TRIVIAL = !(IS_TOKEN_BRANCH || IS_PROD_BRANCH) && instructions.length <= 1 && !getProductionByName(grammar, state_name);

        let skip_id = 0, tok_id = 0;

        if (symbol_meta) {
            //create a meta lookup instruction 
            let { expected, skipped } = symbol_meta;

            expected = expected.concat(skipped).setFilter().sort(numeric_sort);
            skipped = skipped.setFilter().sort(numeric_sort);

            if (expected.length > 0) {
                const id_string = getSymbolMapFromIds(expected, grammar).join('_');
                if (!sym_map.has(id_string))
                    sym_map.set(id_string, sym_map.size);

                tok_id = sym_map.get(id_string);
            }

            if (skipped.length > 0) {
                const id_string = getSymbolMapFromIds(skipped, grammar).join('_');

                if (!sym_map.has(id_string))
                    sym_map.set(id_string, sym_map.size);

                skip_id = sym_map.get(id_string);
            }
        }

        state_data.block_offset = total_instruction_byte_size;

        if (IS_PROD_BRANCH) {
            const block_info = buildBranchTableBlock(state_ast, tok_id, skip_id);
            total_instruction_byte_size += block_info.total_size;
            state_data.block = block_info;

        } else if (IS_TOKEN_BRANCH) {
            const block_info = buildBranchTableBlock(state_ast, tok_id, skip_id);
            total_instruction_byte_size += block_info.total_size;
            state_data.block = block_info;

        } else {
            const block_info = buildBasicInstructionBlock(state_ast, tok_id, skip_id);
            total_instruction_byte_size += block_info.total_size;
            state_data.block = block_info;
        }

        state_data.pointer = state_data.block_offset;
    }

    const out_buffer = [];


    for (const [state_name, { string, block, pointer }] of StateMap) {
        console.log("----------------------------------------------------");

        console.log(string);

        const buffer = convertBlockDataToBufferData(block, StateMap);

        console.log(state_name, block, buffer, buffer.length * 4, block.total_size, buffer.length * 4 == block.total_size, pointer);

        out_buffer.push(...buffer);
    }

    console.log("total table size: " + total_instruction_byte_size);
}

interface BlockData {
    table_header: {
        increment_stack_pointer_for_failure: boolean;
        table_or_sequence_size: number;
        have_default_action: boolean;
        skip_table_row: number;
        token_table_row: number;
        row_size: number;
        prod_or_tok_basis: number;
        failure_state_data: string;
        state_type: string;
    };
    table_entries: string[][];
    default_entry: string[];
    total_size: number;
}
interface StateTableEntryHeader {

    //32bytes
    table_or_sequence_size: u16;
    increment_stack_pointer_for_failure: bit,
    have_default_action: bit,
    undefined2: u2;
    undefined3: u2;
    undefined1: u2;
    state_type: u2;
    undefined4: u2;
    undefined5: u2;
    undefined6: u2;


    //32 Bytes
    failure_state_data: u32,

    //32Bytes
    skip_table_row: u16;
    token_table_row: u16;

    //32 Bytes
    row_size: u16;
    prod_or_tok_basis: u16;
}

function convertBlockDataToBufferData(block_info: BlockData, state_map: StateMap): number[] {
    const buffer = [];

    //First 32 bits

    buffer.push(
        (block_info.table_header.table_or_sequence_size & 0xFFFF)
        |
        (+block_info.table_header.have_default_action << 16)
        |
        (+block_info.table_header.increment_stack_pointer_for_failure << 17)
        |
        ((["table", "basic"].indexOf(block_info.table_header.state_type) + 1) << 24)
    );

    //Second 32 bits

    buffer.push(
        block_info.table_header.failure_state_data ?
            state_map.get(block_info.table_header.failure_state_data).pointer
            : 0
    );

    //Third 32bits
    buffer.push(
        (block_info.table_header.skip_table_row & 0xFFFFF)
        |
        ((block_info.table_header.token_table_row & 0xFFFFF) << 16)
    );

    //Forth 32bits
    buffer.push(
        (block_info.table_header.row_size & 0xFFFFF)
        |
        ((block_info.table_header.prod_or_tok_basis & 0xFFFFF) << 16)
    );

    for (const data of [...block_info.table_entries, block_info.default_entry].filter(n => !!n)) {
        let i = 0;
        let temp_buffer = [];
        for (; i < data.length; i++) {
            switch (data[i]) {

                case InstructionType.fail: temp_buffer.push(0xFFFFFFFF >>> 0); break;

                case InstructionType.pass: temp_buffer.push(1 >>> 0); break;

                case "end": temp_buffer.push(0); break;

                case InstructionType.consume:
                    temp_buffer.push(1 << 28);
                    break;

                case InstructionType.goto:

                    temp_buffer.push(1 << 28 | state_map.get(data[++i]).pointer);
                    break;

                case InstructionType.set_prod:
                    let prod = +data[++i];
                    temp_buffer.push(3 << 28 | prod);
                    break;

                case InstructionType.fork_to: {

                    let length = +data[++i];

                    temp_buffer.push(3 << 28 | length);

                    while (length-- > 0)
                        temp_buffer.push(state_map.get(data[++i]).pointer);

                } break;

                case InstructionType.token_length:
                    //byte_length += 4 + 4 * instr.token_ids.length;
                    //byte_sequence.push("scan_until", ...instr.token_ids);
                    break;

                case InstructionType.scan_until:
                    //byte_length += 4 + 4 * instr.token_ids.length;
                    //byte_sequence.push("scan_until", ...instr.token_ids);
                    break;

                case InstructionType.pop: {
                    let length = +data[++i];
                    temp_buffer.push(3 << 28 | length);
                } break;

                case InstructionType.reduce: {
                    let length = +data[++i];
                    let reduce_fn_id = +data[++i];
                    temp_buffer.push(3 << 28 | length << 16 | reduce_fn_id);
                }
                    break;
            }
        }

        if (block_info.table_header.state_type != "scan") {
            while (temp_buffer.length < (block_info.table_header.row_size / 4))
                temp_buffer.push(0);
        }


        buffer.push(...temp_buffer);
    }
    while (buffer.length < (block_info.total_size >> 2))
        buffer.push(0);

    return buffer;
}

function createInstructionSequence(active_instructions: Instruction[]): { byte_length: number, byte_sequence: any; } {

    const byte_sequence = [];

    const goto_instructions = active_instructions.filter(i => i.type == InstructionType.goto).reverse();
    const standard_instructions = active_instructions.filter(i => i.type != InstructionType.goto);

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
                byte_sequence.push(InstructionType.set_prod, instr.id);
                break;

            case InstructionType.fork_to:
                byte_length += 4 + 4 * (instr.states.length - 1);
                byte_sequence.push(InstructionType.fork_to, instr.states.length, ...instr.states);
                break;

            case InstructionType.scan_until:
                byte_length += 4 + 4 * instr.token_ids.length;
                byte_sequence.push(InstructionType.scan_until, ...instr.token_ids);
                break;

            case InstructionType.pop:
                byte_length += 4;
                byte_sequence.push(InstructionType.pop, instr.len);
                break;

            case InstructionType.reduce:
                byte_length += 4;
                byte_sequence.push(InstructionType.reduce, instr.len, instr.reduce_fn);
                break;
        }
    }

    byte_sequence.push("end");
    byte_length += 4;

    return { byte_length, byte_sequence };
}

function get8AlignedOffset(request_size: number) {
    return Math.ceil(request_size / 8) * 8;
}

function get32AlignedOffset(request_size: number) {
    return Math.ceil(request_size / 32) * 32;
}

function buildBranchTableBlock(state_ast: State, tok_id = 0, skip_id = 0): BlockData {

    const instructions = state_ast.instructions;

    const default_instruction = instructions.filter(i => i.ids.some(i => i == 9999))[0];

    const standard_instructions = instructions.filter(i => !i.ids.some(i => i == 9999));

    if (standard_instructions.length == 0 && default_instruction) {
        const new_state = Object.assign({}, state_ast, { instructions: default_instruction.instructions });

        return buildBasicInstructionBlock(state_ast, tok_id, skip_id);
    }
    const ids = standard_instructions.flatMap(i => i.ids).sort(numeric_sort);

    const standard_byte_codes = standard_instructions
        .flatMap(({ ids, instructions, type }) => {

            const instr = createInstructionSequence(instructions);

            if (type == "consume") {
                instr.byte_sequence.unshift("consume");
                instr.byte_length++;
            }
            return ids.map(i => ({ id: i, code: instr }));
        });

    const max_instruction_size = get8AlignedOffset(standard_byte_codes.map(i => i.code.byte_length).sort(numeric_sort).pop());

    const increment_stack_pointer_for_failure = !!state_ast.fail;

    const span = 1 + ids[ids.length - 1] - ids[0];

    const basis = ids[0];

    const table_entries = [];

    let last_offset = basis;
    for (const { id, code } of standard_byte_codes.sort((a, b) => a.id - b.id)) {

        while (++last_offset < id) {
            table_entries.push(["fail"]);
        }

        table_entries.push(code.byte_sequence);
    }

    const table_header = {
        increment_stack_pointer_for_failure,
        table_or_sequence_size: span,
        have_default_action: !!default_instruction,
        skip_table_row: skip_id,
        token_table_row: tok_id,
        row_size: max_instruction_size,
        prod_or_tok_basis: basis,
        failure_state_data: state_ast.fail ? state_ast.fail.id : "",
        state_type: "table"
    };

    if (default_instruction) {

        const default_data = createInstructionSequence(default_instruction.instructions);

        const default_block_size = get8AlignedOffset(default_data.byte_length);

        return {
            table_header,
            table_entries,
            default_entry: default_data.byte_sequence,
            total_size: get32AlignedOffset(16 + default_block_size + max_instruction_size * span)
        };
    }

    return {
        table_header,
        table_entries,
        default_entry: ["fail", "end"],
        total_size: get32AlignedOffset(16 + max_instruction_size * span + 1)
    };
}


function buildBasicInstructionBlock(state_ast: State, tok_id = 0, skip_id = 0): BlockData {


    const increment_stack_pointer_for_failure = !!state_ast.fail;


    const { byte_length, byte_sequence } = createInstructionSequence(state_ast.instructions);

    const table_entries = [];

    const instruction_size = get8AlignedOffset(byte_length);

    const table_header = {
        increment_stack_pointer_for_failure,
        table_or_sequence_size: 0,
        have_default_action: true,
        skip_table_row: skip_id,
        token_table_row: tok_id,
        row_size: instruction_size,
        prod_or_tok_basis: 0,
        failure_state_data: state_ast.fail ? state_ast.fail.id : "",
        state_type: "basic"
    };

    return { table_header, table_entries, default_entry: byte_sequence, total_size: instruction_size + 16 };
}

function getInstructionComplexity(instr) {
    return 1 + (instr?.then?.length ?? 0);
}

/**
 * State [ have_failure_executor_bit, instruction_ptr_bits, peek_level ]
**/

function state_machine(initial_state: number = 0) {

    let state_stack_ptr = 0;

    let state_stack = new Uint16Array[512];

    let peek_level = 0;

    let peek_stack = ["Lexer, Lexer, Lexer, Lexer, Lexer, Lexer, Lexer"];

    state_stack[state_stack_ptr] = initial_state;

    while (state_stack_ptr >= 0) {

        const state = state_stack[state_stack_ptr];

        state_stack_ptr--;

        const active_lexer = peek_stack[peek_level];

        if (!"InFailureMode")
            state_stack_ptr = state_executor(state, state_stack, state_stack_ptr, active_lexer);
        else if ("state_has_failure_handler")
            state_stack_ptr = state_failure_executor(state, state_stack, state_stack_ptr, active_lexer);
    }

    if ("InFailureMode")
        return "Failed";

    return "Not Failed";
}

function execute_prod_table(active_prod, table_pointer, table_length, row_size, table_zero_basis) {
    const index = (active_prod - table_zero_basis) * row_size;

    if (index < table_length && index > -1) {
        if (instruction_executor(row_size, table_pointer[index]))
            return true;
    }
    return false;
}

function execute_prod_scan(active_prod, table_offset, table_length, row_size, table_zero_basis) {
    const value = active_prod - table_zero_basis;

    if (value < table_length && value > -1) {
        if (instruction_executor(row_size, table_ptr))
            return true;
    }
    return false;
}

function instruction_executor(row_size, instruction_sequence) {
    let i = 0;

    while (i < row_size) {
        const instruction = instruction_sequence[i];

        switch (instruction) {
            case 0: //Failed
                return false;
            case "push state": break; //adds new state and sets stack pointer to that state.
            case "pop state": break; //sets stack pointer to stack_pointer-val


        }

        i += 1;
    }

    return true;
}



function state_failure_executor(state: number, state_stack: Uint32Array, state_stack_ptr: number, active_lexer): number {
    return state_stack_ptr;
}

function state_executor(state: number, state_stack: Uint32Array, state_stack_ptr: number, active_lexer): number {
    switch (state) {

        case GOTO:
        //get_list of gotos
    }

    return state_stack_ptr;
}