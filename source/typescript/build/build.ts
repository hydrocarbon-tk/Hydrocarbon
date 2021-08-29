import spark from "@candlelib/spark";
import { createRunner, Helper } from "../build/helper.js";
import { WorkerRunner } from "../build/workers/worker_runner.js";
import { getProductionByName } from '../grammar/nodes/common.js';
import { createActiveTokenSK, extractAndReplaceTokenMapRefs } from '../render/render.js';
import { Lexer } from '../runtime/core_parser.js';
import { Token } from '../runtime/token.js';
import { skRenderAsJavaScript } from '../skribble/skribble.js';
import { HCG3Grammar } from "../types/grammar_nodes.js";
import { RDProductionFunction } from "../types/rd_production_function.js";
import { createSymbolScanFunctionNew, getSymbolMapFromIds, token_lu_bit_size } from '../utilities/code_generating.js';
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

    const states_map: StateMap = new Map();

    //convert states to code

    for (const state_string of states) {

        const state_ast = parse_table_code(state_string).result[0];

        state_ast.__source__ = state_string;

        const IS_PRODUCTION_ENTRY = getProductionByName(grammar, state_ast.id) != null;

        states_map.set(state_ast.id, {
            reference_count: 0,
            block_offset: 0,
            pointer: -1,
            attributes: IS_PRODUCTION_ENTRY ? StateAttrib.PRODUCTION_ENTRY : 0,
            string: state_string,
            state_ast,
            block: null,
        });

        //Extract and create failed states
        if (state_ast.fail) {

            const fail_state = state_ast.fail;

            states_map.set(fail_state.id, {
                reference_count: 1,
                block_offset: 0,
                pointer: 0,
                attributes: StateAttrib.FAIL_STATE,
                string: "[ FAILURE HANDLER ]\n\n" + state_string.slice(state_string.indexOf("on fail")),
                state_ast: fail_state,
                block: null,
            });
        }
    }

    //Process States -------------------------------------------------------------

    const sym_map: Map<string, number> = new Map();

    statesOutputsInitialPass(states_map, grammar);
    let prev_size = states_map.size;

    let ALLOW_OPTIMIZATIONS = true;

    let original_states = new Map(states_map);

    if (ALLOW_OPTIMIZATIONS)
        while (statesOutputsOptimizationPass(states_map, grammar, original_states)) {

            console.log(`reduction ratio ${Math.round((1 - (states_map.size / prev_size)) * 100)}% - prev size ${prev_size} - current size ${states_map.size}`);

            prev_size = states_map.size;
        }

    const state_buffer = new Uint32Array(statesOutputsBuildPass(states_map, grammar, sym_map));

    console.log(`Buffer size = ${state_buffer.length * 4}bytes`);

    //Build Recognizer Components -------------------------------------------------------------

    const token_lookup_array = new ({ 8: Uint8Array, 16: Uint8Array, 32: Uint32Array }[token_lu_bit_size])([...sym_map.keys()].flatMap(s => s.split("_")));
    const token_sequence_lookup = new Uint8Array(grammar.sequence_string.split("").map(s => s.charCodeAt(0)));
    const entry_pointers = grammar.productions.filter(p => p.IS_ENTRY).map(p => ({ name: p.name, pointer: states_map.get(p.name).pointer }));
    const reverse_state_lookup = new Map([...states_map.entries()].map(([key, val]) => [val.pointer, val.string]));
    //Attempt to parse input

    const token_lookup_functions = extractAndReplaceTokenMapRefs(createSymbolScanFunctionNew({
        grammar: grammar,
        helper: runner
    }).map(skRenderAsJavaScript).join("\n\n"), sym_map);

    let tk_scan = (Function("token_lookup", "token_sequence_lookup",
        `${skRenderAsJavaScript(createActiveTokenSK(grammar))}
         ${token_lookup_functions}
         return scan;
        `
    ))(token_lookup_array, token_sequence_lookup);
    //Go through the build pass

    const input_string = "aabbbb";
    const input_buffer = new Uint8Array(input_string.split("").map(c => c.charCodeAt(0)));

    const kernel_states: KernelState[] = [{
        lexer_pointer: 0,
        lexer_stack: (new Array(16)).fill(0).map(i => { const lexer = new Lexer(input_buffer, input_buffer.length); lexer.next(); return lexer; }),
        stack_pointer: 1,
        state_stack: new Uint32Array(128),
        reverse_state_lookup: reverse_state_lookup,
        state_buffer: state_buffer,
        tk_scan: tk_scan,
    }];

    kernel_states[0].state_stack[1] = [...entry_pointers.values()][0].pointer;

    let SUCCESSFUL_PARSE = false;

    while (kernel_states.length > 0) {

        for (let kernel_state of kernel_states) {

            const { FAILED, last_state } = kernel_executor(kernel_state, kernel_states);

            SUCCESSFUL_PARSE ||= (!FAILED && kernel_state.lexer_stack[0].END());

            if (FAILED || !kernel_state.lexer_stack[0].END()) {

                const token = new Token(input_string, "", kernel_state.lexer_stack[0].byte_length, kernel_state.lexer_stack[0].byte_offset + 1);

                if (kernel_state.lexer_stack[0].END())
                    console.warn(token.returnError("Unexpected End Of Input").toString());
                else
                    console.warn(token.returnError("Unexpected Token").toString());
            }

            console.log(`Last Good State => {\n${reverse_state_lookup.get(last_state)}\n}`);
        }

        kernel_states.length = 0;
    }

    console.log({ SUCCESSFUL_PARSE });

    return {
        recognizer_functions: mt_code_compiler.functions,
        meta: runner
    };
}

interface KernelState {
    lexer_pointer: u32,
    readonly lexer_stack: Lexer[],
    stack_pointer: u32,
    state_stack: Uint32Array,
    tk_scan: (l: Lexer, i: u32, j: u32) => void,
    readonly state_buffer: Uint32Array;
    reverse_state_lookup: Map<number, string>;
};

//Global Constants
const state_index_mask = (1 << 24) - 1;
const fail_state_mask = 1 << 26;

function kernel_executor(
    kernel_state: KernelState,
    kernel_states: KernelState[]
) {

    const {
        state_stack,
        reverse_state_lookup,
    } = kernel_state;
    //Kernel

    //Input
    let fail_mode = false;
    let prod = 0;

    let last_good_state = 0, previous_good_state = 0;

    while (true) {

        let i = 0;

        while (i++ < 4) {
            // Hint to the compiler to inline this section 4 times

            const state = state_stack[kernel_state.stack_pointer];

            kernel_state.stack_pointer -= 1;

            if (state > 0) {

                if (fail_mode)
                    console.log("\n [IN FAILURE MODE] \n at state: \n", reverse_state_lookup.get(state & 0xFFFFFFF), "\n");
                else
                    console.log("\n at state: \n", reverse_state_lookup.get(state & 0xFFFFFFF), "\n");

                /**
                 * A state pointer is divided into three data segments
                 *   Meta ______ State info     Array Index  
                 *   _|  _|_ ___________________|___
                 *  |  ||  ||                       |
                 * [31 .28 .24 . . .16 . . .8. . . .0]
                 * 
                 * Meta data relates to found within the meta
                 * executor and is within state pointers
                 * that are stored in state buffers. An example
                 * usage of this section is for goto instruction,
                 * which is simply copied to the state_stack as
                 * the instruction already contains the goto state
                 * pointer information
                 * 
                 * 
                 * State info segment store the information
                 * necessary to handle kernel switching tasks,
                 * namely, whether to use the state for failure
                 * recovery or to use it for normal parser 
                 * duties. 
                 * 
                 */

                const state_pointer = state & state_index_mask;

                if (!fail_mode) {
                    ({ fail_mode, prod } = state_executor(
                        state_pointer,
                        prod,
                        kernel_state,
                        kernel_states,
                    ));

                    last_good_state = state_pointer;

                } else if ((state & fail_state_mask) != 0) {
                    ({ fail_mode, prod } = state_executor(
                        state_pointer,
                        prod,
                        kernel_state,
                        kernel_states,
                    ));
                }
            }
        }

        if (kernel_state.stack_pointer < 1)
            break;
    }

    return { FAILED: fail_mode, last_state: last_good_state };

}

function state_executor(
    state_pointer: u32,
    prod,
    kernel_state: KernelState,
    kernel_states: KernelState[]
): ({ prod: u32, fail_mode: boolean, }) {

    let fail_mode = false;

    // Decode state information and proceed run either the basic
    // state executor or the table executor (scanner executor is 
    // not yet implemented )

    const Alpha_u32 = kernel_state.state_buffer[state_pointer];
    const Beta__u32 = kernel_state.state_buffer[state_pointer + 1];
    const Gamma_u32 = kernel_state.state_buffer[state_pointer + 2];
    const Delta_u32 = kernel_state.state_buffer[state_pointer + 3];

    // If the state value is true then increment stack pointer
    // after setting the stack pointer with the fail state value.
    // However, if the previous state is the same as the failure state,
    // do not increment. This prevents the stack from needlessly growing
    // from repeating states that are linked to failures states. 

    const increment_stack_pointer_mask = 1;

    const previous_state = kernel_state.state_stack[kernel_state.stack_pointer];

    kernel_state.state_stack[kernel_state.stack_pointer + 1] = Beta__u32;

    const failure_bit = (Alpha_u32 & increment_stack_pointer_mask) & +((previous_state ^ Beta__u32) > 0);

    kernel_state.stack_pointer += failure_bit;

    // Main instruction process ----------------------

    const process_type = (Alpha_u32 >> 8) & 0xF;

    let lexer = kernel_state.lexer_stack[kernel_state.lexer_pointer];

    switch (process_type) {
        case 1: //basic 
            {
                // The instructions start at the 16 byte offset and 
                // is directly handled by the instruction executor

                ({ fail_mode, prod } = instruction_executor(
                    state_pointer + 4,
                    prod,
                    lexer,
                    kernel_state,
                    kernel_states
                ));

            } break;
        case 2: //table 
            {
                let input_value: i32 = 0;

                const number_of_rows = Alpha_u32 >> 16;
                const row_size = Delta_u32 & 0xFFFF;
                const basis__ = (Delta_u32 >> 16) & 0xFFFF;

                const input_type = ((Alpha_u32 >> 12) & 0xF);


                if (input_type == 2) { // Lexer token id input

                    const tk_row = Gamma_u32 >> 16;
                    const skip_row = Gamma_u32 & 0xFFFF;

                    const token_transition = ((Alpha_u32 >> 4) & 0xF);

                    switch (token_transition & 0xF) {
                        case 0: /* do nothing */
                            break;
                        case 1: /* set next peek lexer */{

                            const prev_lexer = kernel_state.lexer_stack[kernel_state.lexer_pointer];

                            kernel_state.lexer_pointer += 1;

                            lexer = kernel_state.lexer_stack[kernel_state.lexer_pointer];

                            lexer.sync(prev_lexer);

                            kernel_state.tk_scan(lexer, tk_row, skip_row);

                        } break;
                        case 2: /* set primary lexer */
                            kernel_state.lexer_pointer = 0;
                            lexer = kernel_state.lexer_stack[kernel_state.lexer_pointer];
                            kernel_state.tk_scan(lexer, tk_row, skip_row);
                            break;
                        case 3: /* force evaluation of primary lexer */ break;
                            break;
                    }

                    input_value = lexer._type - basis__;

                } else {
                    // Production id input
                    input_value = prod - basis__;
                }

                if (input_value >= 0 && input_value < number_of_rows) {
                    ({ fail_mode, prod } = instruction_executor(
                        state_pointer + 4 + input_value * row_size,
                        prod,
                        lexer,
                        kernel_state,
                        kernel_states
                    ));
                } else {

                    // Use default behavior found at the end of the 
                    // state table
                    ({ fail_mode, prod } = instruction_executor(
                        state_pointer + 4 + number_of_rows * row_size,
                        prod,
                        lexer,
                        kernel_state,
                        kernel_states
                    ));

                }

            } break;
        case 3: //scanner 
            {
                /* NOT IMPLEMENTED */
            } break;
    }

    return { prod, fail_mode };
};

function consume_temp(lexer: Lexer) {

    console.log(`consuming: ${String.fromCharCode(...lexer.input.slice(lexer.byte_offset, lexer.byte_offset + lexer.byte_length))
        } from offset ${lexer.byte_offset}`);

    lexer.next();
}
function fork(fork_to_state, kernel_state: KernelState, kernel_states: KernelState[]) {

    const new_state: KernelState = {

        lexer_pointer: kernel_state.lexer_pointer,
        lexer_stack: kernel_state.lexer_stack.map(l => l.copy_in_place()),

        reverse_state_lookup: kernel_state.reverse_state_lookup,

        stack_pointer: kernel_state.stack_pointer,

        state_buffer: kernel_state.state_buffer,

        state_stack: new Uint32Array(kernel_state.state_stack),

        tk_scan: kernel_state.tk_scan,
    };

    new_state.state_stack[new_state.stack_pointer + 1] = fork_to_state;

    new_state.stack_pointer += 1;

    kernel_states.push(new_state);
}

function instruction_executor(
    index: u32,
    prod: u32,
    lexer: Lexer,
    kernel_state: KernelState,
    kernel_states: KernelState[]
): ({ fail_mode: boolean, prod: u32; }) {
    while (true) {
        const instruction = kernel_state.state_buffer[index];
        index += 1;

        switch ((instruction >> 28) & 0xF) {
            //Both "pass" and "end";
            case 0: return ({ fail_mode: false, prod }); //
            case 1: //InstructionType.consume:
                //consume(state)
                consume_temp(lexer);
                break;
            case 2: //InstructionType.goto:
                kernel_state.state_stack[kernel_state.stack_pointer + 1] = instruction;
                kernel_state.stack_pointer += 1;
                break;
            case 3://InstructionType.set_prod:
                prod = instruction & 0xFFFFFFF;
                break;
            case 4://InstructionType.fork_to: 
                {
                    // the first state goes to 
                    // the current process
                    let length = (instruction & 0xFFFFFFF) - 1;

                    kernel_state.state_stack[kernel_state.stack_pointer + 1] = kernel_state.state_buffer[index];
                    index += 1;

                    while (length-- > 0) {

                        fork(kernel_state.state_buffer[index], kernel_state, kernel_states);
                        //fork
                        index += 1;
                    }

                    kernel_state.stack_pointer += 1;
                } break;
            case 5:// InstructionType.token_length:
                //byte_length += 4 + 4 * instr.token_ids.length;
                //byte_sequence.push("scan_until", ...instr.token_ids);
                break;
            case 6://InstructionType.scan_until:
                //byte_length += 4 + 4 * instr.token_ids.length;
                //byte_sequence.push("scan_until", ...instr.token_ids);
                break;
            case 7://InstructionType.pop: 
                kernel_state.stack_pointer -= (instruction & 0xFFFFFFF);
                break;
            case 8://InstructionType.reduce: 
                const high = (instruction >> 16) & 0xFFFF;
                const low = (instruction) & 0xFFFF;

                // /state.add_rule(low);
                // /
                // /if ((low & 0x4) == 0x4)
                // /    state.add_rule(high & 0xFFF);
                break;
            case 9://InstructionType.repeat: 
                kernel_state.stack_pointer += 1;
                break;;
            //Fail instructions
            case 10: return ({ fail_mode: true, prod });
            case 11: return ({ fail_mode: true, prod });
            case 12: return ({ fail_mode: true, prod });
            case 13: return ({ fail_mode: true, prod });
            case 14: return ({ fail_mode: true, prod });
            case 15: return ({ fail_mode: true, prod }); //
        }
    }

    return ({ fail_mode: false, prod });
}

const numeric_sort = (a: number, b: number): number => a - b;

function convertBlockDataToBufferData(block_info: BlockData, state_map: StateMap): number[] {
    const buffer = [];

    //Alpha 32 bits

    buffer.push(
        ((block_info.table_header.number_of_rows & 0xFFFF) << 16)
        |
        (+block_info.table_header.have_default_action << 1)
        |
        (+block_info.table_header.increment_stack_pointer_for_failure << 0)
        |
        ((["peek", "assert"].indexOf(block_info.table_header.lexer_type) + 1) << 4)
        |
        ((["basic", "table", "scanner"].indexOf(block_info.table_header.state_type) + 1) << 8)
        |
        ((["production", "token"].indexOf(block_info.table_header.input_type) + 1) << 12)
    );

    //Beta 32 bits

    buffer.push(
        block_info.table_header.failure_state_data ?
            state_map.get(block_info.table_header.failure_state_data).pointer
            : 0
    );

    //Gamma 32bits
    buffer.push(
        (block_info.table_header.skip_table_row & 0xFFFF)
        |
        ((block_info.table_header.token_table_row & 0xFFFF) << 16)
    );

    //Delta 32bits
    buffer.push(
        (block_info.table_header.row_size & 0xFFFF)
        |
        ((block_info.table_header.prod_or_tok_basis & 0xFFFF) << 16)
    );

    for (const data of [...block_info.table_entries, block_info.default_entry].filter(n => !!n)) {
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

                case InstructionType.fork_to: {

                    let length = +data[++i];

                    temp_buffer.push(4 << 28 | length);

                    while (length-- > 0)
                        temp_buffer.push(state_map.get(data[++i]).pointer);

                } break;

                case InstructionType.token_length: {
                    let length = +data[++i];
                    temp_buffer.push(5 << 28 | length);
                } break;

                case InstructionType.scan_until: {
                    //temp_buffer.push(6 << 28 | length);
                    //byte_length += 4 + 4 * instr.token_ids.length;
                    //byte_sequence.push("scan_until", ...instr.token_ids);
                } break;

                case InstructionType.pop: {
                    let length = +data[++i];
                    temp_buffer.push(7 << 28 | length);
                } break;

                case InstructionType.reduce: {

                    let low = 0;
                    let high = 0;

                    let sym_len = +data[++i];
                    let reduce_fn_id = +data[++i];

                    if (reduce_fn_id > 0xFF || sym_len > 0x1F) {
                        low = 4 | (reduce_fn_id << 3);
                        high = sym_len;
                    } else {
                        low = ((sym_len & 0x1F) << 3) | ((reduce_fn_id & 0xFF) << 8);
                    };

                    temp_buffer.push(8 << 28 | high << 16 | low);

                } break;

                case InstructionType.repeat: {
                    temp_buffer.push(9 << 28);
                } break;

                case InstructionType.fail: temp_buffer.push((15 << 28) >>> 0); break;
            }
        }

        if (block_info.table_header.state_type != "scanner") {
            while (temp_buffer.length < (block_info.table_header.row_size))
                temp_buffer.push(0);
        }

        buffer.push(...temp_buffer);
    }

    while (buffer.length < (block_info.total_size / 4))
        buffer.push(0);

    if (buffer.length > (block_info.total_size / 4))
        debugger;

    return buffer;
}

interface StateData {
    string: string;
    state_ast: State;
    pointer: number;
    block_offset: number;
    block: BlockData;
    reference_count: number;
    attributes: StateAttrib;
}

type StateMap = Map<string, StateData>;

const enum StateAttrib {
    HAS_GOTOS = 1 << 0,
    PROD_BRANCH = 1 << 1,
    PEEK_BRANCH = 1 << 2,
    ASSERT_BRANCH = 1 << 3,
    CONSUME_BRANCH = 1 << 4,
    MULTI_BRANCH = 1 << 5,
    FAIL_STATE = 1 << 6,
    PRODUCTION_ENTRY = 1 << 7,
    TOKEN_BRANCH = ASSERT_BRANCH | CONSUME_BRANCH | PEEK_BRANCH
}

function statesOutputsInitialPass(StateMap: StateMap, grammar: HCG3Grammar) {

    for (const [state_name, state_data] of StateMap) {

        //Build reference counts
        const instructions = [...state_data.state_ast.instructions];

        let attributes = state_data.attributes;

        for (const instruction of instructions) {
            switch (instruction.type) {

                case InstructionType.goto: {

                    attributes |= StateAttrib.HAS_GOTOS;

                    const state = instruction.state;

                    StateMap.get(state).reference_count++;

                } break;

                case InstructionType.fork_to: {
                    for (const state of instruction.states)
                        StateMap.get(state).reference_count++;
                } break;

                case InstructionType.prod:
                case InstructionType.peek:
                case InstructionType.consume:
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
            [InstructionType.peek]: StateAttrib.PEEK_BRANCH,
            [InstructionType.prod]: StateAttrib.PROD_BRANCH
        };

        attributes |= state_data.state_ast.instructions.reduce((r, v) =>
            r | (token_instr_types[v.type] ?? 0), 0);

        if ((attributes & (StateAttrib.TOKEN_BRANCH | StateAttrib.CONSUME_BRANCH)) > 0
            &&
            state_data.state_ast.instructions.length > 1
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
    }
}

function statesOutputsOptimizationPass(StateMap: StateMap, grammar: HCG3Grammar, StateMap_: StateMap): boolean {

    let MUTATION_OCCURRED = false;

    const to_remove = [];

    for (const [state_name, state_data] of StateMap) {

        const { state_ast, attributes, string } = state_data;

        const { instructions, symbol_meta } = state_ast;

        if (attributes & StateAttrib.ASSERT_BRANCH
            ||
            attributes & StateAttrib.CONSUME_BRANCH
        ) {
            if (
                !(attributes & StateAttrib.MULTI_BRANCH)
                &&
                instructions[0].type == InstructionType.assert
                &&
                instructions[0].instructions[0].type == InstructionType.goto
                &&
                (StateMap.get(instructions[0].instructions[0].state).attributes & StateAttrib.PRODUCTION_ENTRY)
            ) {
                //Replace the state with contents of the production state
                const prod_state = StateMap.get(instructions[0].instructions[0].state);

                //console.log("woopah", instructions[0].instructions[0].state);
                //console.log(string);
                //console.log(prod_state.string);

                state_data.attributes = prod_state.attributes ^ StateAttrib.PRODUCTION_ENTRY;
                // Flatten the state since the assert is now superfluous.
                // The production state will make the same assertion
                state_ast.instructions = state_ast.instructions[0].instructions;
                state_ast.instructions.splice(0, 1, ...prod_state.state_ast.instructions);
                prod_state.state_ast.instructions.forEach(({ type, state }) => {
                    if (type == InstructionType.goto) {
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
                    const goto_state = StateMap.get(instruction.instructions[0].state);

                    const { state_ast, attributes, string: goto_string } = goto_state;

                    if (
                        (attributes & StateAttrib.CONSUME_BRANCH)
                        &&
                        !(attributes & StateAttrib.MULTI_BRANCH)
                    ) {

                        instruction.type = InstructionType.consume;

                        instruction.instructions.splice(0, 1, ...state_ast.instructions[0].instructions);
                        state_ast.instructions[0].instructions.forEach(({ type, state }) => {
                            if (type == InstructionType.goto) {
                                StateMap.get(state).reference_count++;
                            }
                        });

                        decreaseReference(goto_state, to_remove);

                        MUTATION_OCCURRED = true;

                        continue;
                    }
                }

                if (
                    (
                        instruction.type == InstructionType.assert
                        ||
                        instruction.type == InstructionType.consume
                        ||
                        instruction.type == InstructionType.prod
                    )
                ) {

                    const instructions = instruction.instructions;

                    for (let j = 0; j < instructions.length; j++) {
                        const instruction = instructions[j];
                        if (
                            instruction.type == InstructionType.goto
                        ) {
                            //Reduce asserts with consumes form single branch productions
                            const goto_state = StateMap.get(instruction.state);

                            const { state_ast, attributes, string: goto_string } = goto_state;

                            if (
                                !(attributes & (StateAttrib.TOKEN_BRANCH | StateAttrib.PROD_BRANCH))
                                &&
                                (!(attributes & StateAttrib.HAS_GOTOS) || (
                                    (instructions.length == 1)
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
                                    )
                                ))
                            ) {
                                //console.log(string);
                                //console.log(goto_string);
                                instructions.splice(j, 1, ...state_ast.instructions);
                                state_ast.instructions.forEach(({ type, state }) => {
                                    if (type == InstructionType.goto) {
                                        StateMap.get(state).reference_count++;
                                    }
                                });

                                decreaseReference(goto_state, to_remove);

                                MUTATION_OCCURRED = true;

                                continue;
                            }
                        }
                    }
                }

                if (
                    instruction.type == InstructionType.goto
                ) {
                    //Reduce asserts with consumes form single branch productions
                    const goto_state = StateMap.get(instruction.state);

                    const { state_ast, attributes, string: goto_string } = goto_state;

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

function decreaseReference(goto_state: StateData, to_remove: string[]) {

    goto_state.reference_count--;

    if (
        goto_state.reference_count <= 0
        &&
        !(goto_state.attributes & StateAttrib.PRODUCTION_ENTRY)
    ) {
        to_remove.push(goto_state.state_ast.id);
    }
}

function statesOutputsBuildPass(StateMap: StateMap, grammar: HCG3Grammar, sym_map: Map<string, number> = new Map()) {

    let total_instruction_byte_size = 0;

    for (const [state_name, state_data] of StateMap) {

        const { state_ast, attributes, string } = state_data;

        const { instructions, symbol_meta } = state_ast;

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

        if ((attributes & (StateAttrib.PROD_BRANCH)) > 0) {
            const block_info = buildBranchTableBlock(state_ast, tok_id, skip_id, "production");
            total_instruction_byte_size += block_info.total_size;
            state_data.block = block_info;

        } else if ((attributes & (StateAttrib.TOKEN_BRANCH)) > 0) {
            const block_info = buildBranchTableBlock(
                state_ast,
                tok_id,
                skip_id,
                "token",
                (attributes & (StateAttrib.PEEK_BRANCH))
                    ? "peek"
                    : "assert"
            );
            total_instruction_byte_size += block_info.total_size;
            state_data.block = block_info;

        } else {
            const block_info = buildBasicInstructionBlock(state_ast, tok_id, skip_id);
            total_instruction_byte_size += block_info.total_size;
            state_data.block = block_info;
        }

        state_data.pointer = (state_data.block_offset / 4);

        if ((attributes & StateAttrib.FAIL_STATE) > 0)
            state_data.pointer |= fail_state_mask;

    }

    const out_buffer = [];

    for (const [_, { block }] of StateMap) {

        const buffer = convertBlockDataToBufferData(block, StateMap);

        out_buffer.push(...buffer);
    }

    return out_buffer;
}
function createInstructionSequence(active_instructions: Instruction[]): { byte_length: number, byte_sequence: any; } {

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
                byte_sequence.push(InstructionType.set_prod, instr.id);
                break;

            case InstructionType.fork_to:
                byte_length += 4 + 4 * (instr.states.length);
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

function get8AlignedOffset(request_size: number) {
    return Math.ceil(request_size / 8) * 8;
}

function get32AlignedOffset(request_size: number) {
    return Math.ceil(request_size / 32) * 32;
}

function buildBranchTableBlock(
    state_ast: State,
    tok_id = 0,
    skip_id = 0,
    input_type: BlockData["table_header"]["input_type"] = "production",
    lexer_type: BlockData["table_header"]["lexer_type"] = "assert"
): BlockData {

    const instructions = state_ast.instructions;

    const default_instruction = instructions.filter(i => i.ids.some(i => i == 9999))[0];

    const standard_instructions = instructions.filter(i => !i.ids.some(i => i == 9999));

    if (standard_instructions.length == 0 && default_instruction) {
        const new_state = Object.assign({}, state_ast, { instructions: default_instruction.instructions });

        return buildBasicInstructionBlock(new_state, tok_id, skip_id);
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

    const max_instruction_byte_size = get8AlignedOffset(standard_byte_codes.map(i => i.code.byte_length).sort(numeric_sort).pop());

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

    const table_header: BlockData["table_header"] = {
        increment_stack_pointer_for_failure,
        number_of_rows: span,
        have_default_action: !!default_instruction,
        skip_table_row: skip_id,
        token_table_row: tok_id,
        row_size: max_instruction_byte_size / 4,
        prod_or_tok_basis: basis,
        input_type,
        failure_state_data: state_ast.fail ? state_ast.fail.id : "",
        state_type: "table",
        lexer_type: lexer_type
    };

    if (default_instruction) {

        const default_data = createInstructionSequence(default_instruction.instructions);

        const default_block_size = get8AlignedOffset(default_data.byte_length);

        return {
            table_header,
            table_entries,
            default_entry: default_data.byte_sequence,
            total_size: get32AlignedOffset(16 + default_block_size + max_instruction_byte_size * span)
        };
    }

    return {
        table_header,
        table_entries,
        default_entry: ["fail", "end"],
        total_size: get32AlignedOffset(16 + max_instruction_byte_size * span + 1)
    };
}


function buildBasicInstructionBlock(state_ast: State, tok_id = 0, skip_id = 0): BlockData {

    const increment_stack_pointer_for_failure = !!state_ast.fail;

    const { byte_length, byte_sequence } = createInstructionSequence(state_ast.instructions);

    const table_entries = [];

    const instruction_byte_size = get8AlignedOffset(byte_length);

    const table_header: BlockData["table_header"] = {
        increment_stack_pointer_for_failure,
        number_of_rows: 0,
        have_default_action: true,
        skip_table_row: skip_id,
        token_table_row: tok_id,
        row_size: instruction_byte_size / 4,
        prod_or_tok_basis: 0,
        failure_state_data: state_ast.fail ? state_ast.fail.id : "",
        state_type: "basic",
        input_type: "token",
        lexer_type: "assert"
    };

    return { table_header, table_entries, default_entry: byte_sequence, total_size: get32AlignedOffset(instruction_byte_size + 16) };
}

function getInstructionComplexity(instr) {
    return 1 + (instr?.then?.length ?? 0);
}


interface State {
    type: "state" | "on-fail-state";
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

const enum InstructionType {
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
    fail = "fail",
    repeat = "repeat-state"
}

interface Instruction {
    type: InstructionType;
    ids?: number[];
    state?: string;
    states?: string[];
    id?: number;
    instructions?: Instruction[];
    token_ids: number[];
    len?: number,
    reduce_fn?: number,
}
type i32 = number;
type bit = number;
type u32 = number;
type u16 = number;
type u8 = number;
type u2 = number;
type u3 = number;
type u10 = number;

interface StateTableEntryHeader {

    //32bytes
    number_of_rows: u16;
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


interface BlockData {
    table_header: {
        increment_stack_pointer_for_failure: boolean;
        number_of_rows: number;
        have_default_action: boolean;
        input_type: "production" | "token",
        skip_table_row: number;
        token_table_row: number;
        row_size: number;
        prod_or_tok_basis: number;
        failure_state_data: string;
        state_type: "basic" | "table" | "scanner";
        lexer_type: "peek" | "assert";
    };
    table_entries: string[][];
    default_entry: string[];
    total_size: number;
}
interface StateTableEntryHeader {

    //32bytes
    number_of_rows: u16;
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