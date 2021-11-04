
import { ByteReader } from '../common/byte_reader.js';
import { KernelToken } from '../token.js';
import { KernelStack } from './stack.js';

const state_index_mask = (1 << 24) - 1;
export const fail_state_mask = 1 << 27;
export const normal_state_mask = 1 << 26;
export const goto_state_mask = 1 << 25;
export const alpha_increment_stack_pointer_mask = 1 << 0;
export const alpha_have_default_action_mask = 1 << 1;
export const production_scope_pop_pointer = 2;
export const instruction_pointer_mask = 0xFFFFFF;

let peek = null;

export function assign_peek(fn) {
    peek = fn;
}

export interface ParseAction {

    [ParseActionType.REDUCE]: {
        type: ParseActionType.REDUCE;
        body: number,
        length: number,
        production: number;
    };

    [ParseActionType.ACCEPT]: {
        type: ParseActionType.ACCEPT;
    };

    [ParseActionType.ERROR]: {
        type: ParseActionType.ERROR;
        production: number;
    };

    [ParseActionType.SHIFT]: {
        type: ParseActionType.SHIFT;
        length: number;
        line: number;
        token_type: number;
    };

    [ParseActionType.SKIP]: {
        type: ParseActionType.SKIP;
        length: number;
        line: number;
        token_type: number;
    };

    [ParseActionType.TOKEN]: {
        type: ParseActionType.TOKEN;
        token: KernelToken;

    };

    [ParseActionType.FORK]: {
        type: ParseActionType.FORK;
    };
}

export const enum ParseActionType {
    REDUCE,

    SHIFT,

    SKIP,

    ACCEPT,

    ERROR,

    FORK,

    TOKEN
}


/**
 * This is the core class that drives the recognizer system.
 *
 * It yields Tokens and reduce information that can be consumed
 * by completers to apply reduce actions on the token values
 */
export class StateIterator {

    stack: KernelStack;

    reader: ByteReader;

    /**
     * Used if the rate of rule creation exceeds rule output
     */
    buffer: ParseAction[ParseActionType][];

    tokens: KernelToken[];

    bytecode: Uint32Array;

    symbol_accumulator: number;

    ACTION_BUFFER_EMPTY: boolean;

    production_id: number;

    SCANNER: boolean;

    forks: Uint32Array[];

    constructor(
        base_byte_reader: ByteReader,
        bytecode_buffer: Uint32Array,
        entry_pointer: number,
        SCANNER: boolean
    ) {

        this.reader = base_byte_reader;

        this.bytecode = bytecode_buffer;

        this.stack = new KernelStack();

        this.stack.reset(entry_pointer);

        this.ACTION_BUFFER_EMPTY = true;

        this.SCANNER = SCANNER;

        this.production_id = -1;

        this.buffer = [];

        this.tokens = [
            KernelToken.new(),
            KernelToken.new()
        ];
    }


    private emitShift() {

        this.ACTION_BUFFER_EMPTY = false;

        const token = this.tokens[1];

        const prev_token = this.tokens[0];

        if (prev_token.byte_offset + prev_token.byte_length != token.byte_offset) {
            this.buffer.push({
                type: ParseActionType.SKIP,
                length: token.codepoint_offset - prev_token.codepoint_length + prev_token.codepoint_offset,
                line: prev_token.line,
                token_type: 0
            });
        }

        this.buffer.push({
            type: ParseActionType.SHIFT,
            length: token.codepoint_length,
            line: prev_token.line,
            token_type: token.type
        });
    }



    private consume(instruction: number) {

        const token = this.tokens[1];
        const prev = this.tokens[0];

        if (instruction & 1) { //Consume nothing

            token.codepoint_length = 0;

            token.byte_length = 0;
        }

        if (this.SCANNER) {

            this.reader.next(token.byte_length);

            token.codepoint_offset += token.codepoint_length;

            token.byte_offset += token.byte_length;

            token.codepoint_length = 0;

            token.byte_length = 0;

            token.type = 0;

        } else {

            this.emitShift();

            this.reader.next(token.byte_offset - prev.byte_offset + token.byte_length);

            token.codepoint_offset += token.codepoint_length;

            token.byte_offset += token.byte_length;

            token.codepoint_length = 0;

            token.byte_length = 0;

            token.type = 0;

            this.tokens[0].clone(token);
        }
    }

    private emitReduce(symbol_length: number, body_id: number) {

        this.ACTION_BUFFER_EMPTY = false;

        this.buffer.push({
            type: ParseActionType.REDUCE,
            body: body_id,
            length: symbol_length,
            production: this.production_id
        });
    }


    private reduce(instruction: number, index: number, recover_data: number) {
        let body_id = (instruction) & 0xFFFF;
        let length = ((instruction >> 16) & 0xFFF);

        if ((body_id & 0xFFFF) == 0xFFFF) {

            let accumulated_symbols = this.symbol_accumulator
                -
                (recover_data & 0xFFFF0000);

            let len = (accumulated_symbols >> 16);

            let fn_id = (instruction >> 16) & 0x0FFF;

            //Extract accumulated symbols inform
            this.emitReduce(len, fn_id);
        } else {
            this.emitReduce(length, body_id);
        }

        //TODO: ASSERT the production is ALWAYS set after a reduction
        if ((this.bytecode[index] & 0xF0000000) == 0x30000000) {
            this.set_production(this.bytecode[index]);
            return index + 1;
        }

        return index;
    }


    peek(state: number) {
        if (peek) peek(state, this);
    }

    nextAction(): ParseAction[ParseActionType] {

        if (this.buffer.length > 0)
            return this.buffer.shift();
        this.ACTION_BUFFER_EMPTY = true;

        //Kernel
        //Input
        let fail_mode = false;

        while (this.ACTION_BUFFER_EMPTY) {

            if (this.stack.pointer < 1) {
                const token = this.tokens[0];
                const advanced = this.tokens[1];

                token.byte_length = advanced.codepoint_offset;
                token.codepoint_length = advanced.codepoint_offset;


                if (this.SCANNER) {
                    return {
                        type: ParseActionType.TOKEN,
                        token: token
                    };
                }

                if (this.reader.END())
                    return {
                        type: ParseActionType.ACCEPT
                    };

                else return {
                    type: ParseActionType.ERROR,
                    production: this.production_id
                };

                return this.nextAction();
            }

            // Hint to the compiler to inline this section 4 times
            const state = this.stack.pop_state();

            if (state > 0) {
                const mask_gate = normal_state_mask << +fail_mode;

                if (state & mask_gate) {

                    this.peek(state);

                    fail_mode = this.instruction_executor(
                        state,
                        fail_mode
                    );

                }
            }
        }

        return this.nextAction();
    }

    private instruction_executor(
        state_pointer: number,
        fail_mode: boolean,
    ): boolean {

        let index = state_pointer & state_index_mask;

        let recover_data = this.stack.meta_stack[this.stack.pointer + 1];

        while (true) {

            const instruction = this.bytecode[index];

            index += 1;

            switch ((instruction >> 28) & 0xF) {

                case 0: default: return this.pass();

                case 1: this.consume(instruction); break;

                case 2: index = this.goto(instruction, index); break;

                case 3: this.set_production(instruction); break;

                case 4: index = this.reduce(instruction, index, recover_data); break;

                case 5: index = this.set_token(instruction, index); break;

                case 6: index = this.fork(instruction, index); break;

                case 7: index = this.scan_to(index, instruction); break;

                case 8:/*NOOP*/;

                case 9: index = this.index_jump(index, instruction); break;

                case 10: index = this.hash_jump(index, instruction); break;

                case 11: this.push_fail_state(instruction); break;

                case 12: index = this.repeat(index, instruction); break;

                case 13:/*NOOP*/;

                case 14: index = this.assert_consume(index, instruction); break;

                case 15: return this.advanced_return(instruction, fail_mode);
            }
        }
    }

    private assert_consume(index, instruction) {

        const mode = instruction & 0x0F000000;
        let val = instruction & 0x00FFFFFF;

        let token = this.tokens[1];

        switch (mode) {
            case 0x00000000: //CLASS
                token.byte_length = this.reader.codepoint_byte_length();
                token.codepoint_length = this.reader.codepoint_length();
                if (val != this.reader.class())
                    return 2;
                break;
            case 0x01000000://CODEPOINT
                token.byte_length = this.reader.codepoint_byte_length();
                token.codepoint_length = this.reader.codepoint_length();
                if (val != this.reader.codepoint())
                    return 2;
                break;
            case 0x02000000://BYTE
                token.byte_length = 1;
                token.codepoint_length = 1;
                if (val != this.reader.byte())
                    return 2;
                break;
        }

        this.consume(0);

        return index;

    }

    private pass() {
        return false;
    }

    private advanced_return(instruction: number, fail_mode: boolean): boolean {

        if (instruction & 1)
            return fail_mode;

        if (!this.reader.END()) {
            //kernel_state.lexer.token_type = 0;
            //kernel_state.lexer.codepoint_length = 1;
            //kernel_state.lexer.byte_length = 1;
        }

        return true;
    }

    private set_production(instruction: number) {
        this.production_id = instruction & 0xFFFFFFF;
    }


    private scan_to(index: number, instruction: number): number {

        let length = instruction & 0xFFFF;

        const gamma = this.bytecode[index];

        index += 1;

        const scan_back = (instruction & 0x00100000) > 0;

        let lexer = kernel_state.lexer;

        let start_byte_offset = lexer.prev_byte_offset;

        let start_token_offset = lexer.prev_token_offset;

        lexer.byte_length = 1;

        let RUN = true;

        let start = index;

        let end = index + length;

        let end_offset = lexer.input.length;

        index += length;

        const temp_lexer = lexer.copy_in_place();

        if (scan_back) {
            // scan "backwards" towards the previously accepted token.
            // really we just set the scan start position to 
            // lexer.previous_byte and end to the current position of 
            // the lexer and rescan forward.
            end_offset = temp_lexer.byte_offset;
            temp_lexer.byte_offset = temp_lexer.prev_byte_offset;
            temp_lexer.token_offset = temp_lexer.prev_token_offset;
            temp_lexer.byte_length = 0;
            temp_lexer.codepoint_length = 0;
            temp_lexer.next();
        }

        while (RUN) {

            this.scanner(kernel_state, temp_lexer, gamma);

            for (let i = start; i < end; i++) {

                if (temp_lexer.token_type == kernel_state.instructions[i]) {
                    RUN = false;
                    break;
                }
            }

            if (!RUN) break;

            if (temp_lexer.byte_offset >= end_offset)
                return 1;

            temp_lexer.next();
        }

        if (!scan_back) {

            //Reset peek stack;
            kernel_state.lexer.peek_unroll_sync(temp_lexer);
            kernel_state.lexer.prev_byte_offset = start_byte_offset;
            kernel_state.lexer.prev_token_offset = start_token_offset;
        }

        return index;
    }

    private error() {
        this.ACTION_BUFFER_EMPTY = false;
    }

    private get_input_value(
        input_type: number,
        token_transition: number,
        token_row_switches: number,
    ): number {

        if (input_type > 0) { // Lexer token id input

            switch (token_transition) {
                case 1: /* set next peek lexer */ {

                    const token = this.tokens[this.tokens.length - 1];

                    this.reader.next(token.byte_length);

                    if (this.reader.END())
                        return 0;

                    switch (input_type) {

                        case 1:

                            let new_token = token.copy();

                            new_token.type = 0;

                            new_token = this.scanner(new_token, token_row_switches);

                            this.tokens.push(new_token);

                            return new_token.type;

                        case 2:
                            token.byte_length = this.reader.codepoint_byte_length();
                            token.codepoint_length = this.reader.codepoint_length();
                            return this.reader.class();
                        case 3:
                            token.byte_length = this.reader.codepoint_byte_length();
                            token.codepoint_length = this.reader.codepoint_length();
                            return this.reader.codepoint();
                        case 4:
                            token.byte_length = 1;
                            token.codepoint_length = 1;
                            return this.reader.byte();
                    }

                } break;

                default: {/* set primary lexer */

                    const token = this.tokens[1];

                    if (this.tokens.length > 2) {

                        this.tokens.length = 2;

                        if (!this.reader.setTo(token.byte_offset)) {

                            this.error();

                            return 0;
                        };
                    }

                    if (this.reader.END())
                        return 0;

                    switch (input_type) {
                        case 1:

                            this.tokens[1] = this.scanner(token, token_row_switches);

                            return this.tokens[1].type;

                        case 2:
                            token.byte_length = this.reader.codepoint_byte_length();
                            token.codepoint_length = this.reader.codepoint_length();
                            return this.reader.class();
                        case 3:
                            token.byte_length = this.reader.codepoint_byte_length();
                            token.codepoint_length = this.reader.codepoint_length();
                            return this.reader.codepoint();
                        case 4:
                            token.byte_length = 1;
                            token.codepoint_length = 1;
                            return this.reader.byte();
                    }
                    break;
                }
            }

        } else {
            // Production id input
            return this.production_id;
        }

        return 0;
    }
    private hash_jump(index: number, instruction: number): number {

        const input_type = ((instruction >> 22) & 0x7);

        const token_transition = ((instruction >> 26) & 0x3);

        let token_row_switches = this.bytecode[index];

        let table_data = this.bytecode[index + 1];

        index += 2;

        const mod = (1 << ((table_data >>> 16) & 0xFFFF)) - 1;

        const table_size = (table_data) & 0xFFFF;

        const hash_table_start = index;

        const instruction_field_start = hash_table_start + table_size;

        const instruction_field_size = instruction & 0xFFFF;

        let input_value =
            this.get_input_value(
                input_type,
                token_transition,
                token_row_switches,
            );
        let hash_index = input_value & mod;


        while (true) {

            const cell = this.bytecode[hash_table_start + hash_index];

            const value = cell & 0x7FF;

            const next = ((cell >>> 22) & 0x3FF) - 512;

            if (value == input_value) {

                const instruction_start = (cell >> 11) & 0x7FF;

                return instruction_field_start + instruction_start;
            }

            if (next == 0) {
                //Failure
                return instruction_field_size + instruction_field_start;
            }

            hash_index += next;
        }

        return index;
    }
    private index_jump(index: number, instruction: number) {

        let token_row_switches = this.bytecode[index];

        let table_data = this.bytecode[index + 1];

        index += 2;

        let basis__ = instruction & 0xFFFF;

        const input_type = ((instruction >> 22) & 0x7);

        const token_transition = ((instruction >> 26) & 0x3);

        let input_value = this.get_input_value(
            input_type,
            token_transition,
            token_row_switches,
        ) - basis__;

        let number_of_rows = table_data >> 16;

        let row_size = table_data & 0xFFFF;

        if (input_value >= 0 && input_value < number_of_rows) {

            return index + input_value * row_size + row_size;

        } else {
            // Use default behavior found at the beginning of the 
            // jump table
            return index;
        }
    }

    private set_token(instruction: number, index: number) {

        const length = instruction & 0xFFFFFF;

        if (instruction & 0x08000000) {

            this.tokens[0].type = length;

        } else {
            const token = this.tokens[1];

            token.codepoint_length = length;

            token.byte_length = length;
        }
        return index;

    }

    private goto(instruction: number, index: number) {
        this.stack.push_state(instruction);
        while ((this.bytecode[index] & 0xF0000000) == 0x20000000) {
            this.stack.push_state(this.bytecode[index]);
            index++;
        }
        return index;
    }

    private repeat(index: number, instruction: number) {

        const origin_offset = 0xFFFFFFF & instruction;

        index -= (origin_offset);

        return index;
    }

    private push_fail_state(instruction: number) {

        let fail_state_pointer = (instruction) >>> 0;
        const current_state = (this.stack.read_state() & instruction_pointer_mask);
        //Only need to set new failure state if the previous state
        //Is not identical to the pending fail state.
        if (current_state != ((fail_state_pointer >>> 0) & instruction_pointer_mask)) {

            this.stack.push_state(fail_state_pointer >>> 0);

        } else {
            this.stack.swap_state(fail_state_pointer);
        }
    }



    private scanner(
        current_token: KernelToken,
        token_row_state: number
    ): KernelToken {

        if (current_token.type <= 0) {

            const scanner_iterator = new StateIterator(
                this.reader.clone(),
                this.bytecode,
                token_row_state,
                true
            );

            while (true) {

                const result = scanner_iterator.nextAction();

                switch (result.type) {

                    case ParseActionType.TOKEN: {

                        const token = result.token;

                        if (token.type == 9999) {

                            current_token.codepoint_offset += token.codepoint_length;

                            current_token.byte_offset += token.byte_length;

                            //Need to reset the state iterator 

                            scanner_iterator.stack.reset(token_row_state);

                            scanner_iterator.tokens[0].reset();
                            scanner_iterator.tokens[1].reset();

                            continue;
                        }

                        current_token.codepoint_length = token.codepoint_length;
                        current_token.byte_length = token.byte_length;
                        current_token.type = token.type;

                        return current_token;
                    } break;

                    case ParseActionType.FORK: {
                        throw new Error("Scanner Fork Not Implemented");
                    }

                    case ParseActionType.ACCEPT: {
                        return current_token;
                    }

                    default:
                        throw new Error("Scanner Yielded Invalid Action");
                }
            }
        }

        return current_token;
    }

    haveForks(): boolean {
        this.forks.length = 0;
    }

    getFork(): StateIterator {

    }

    private fork(
        instruction: number,
        index: number,
    ): number {

        return 0;

        // Push fork data up to the fork array and return 

        /* let valid = new KernelStateBuffer;
        let invalid = new KernelStateBuffer;
        let process_buffer = new KernelStateBuffer;
        let pointer = origin_kernel_state.stack_pointer;

        let length = (instruction & 0xFFFFFFF);
        let depth = 0;

        //Include the GOTO state and its fail state
        if (origin_kernel_state.state_stack[pointer] & goto_state_mask) {
            depth = 1;
            if (origin_kernel_state.state_stack[pointer - 1] & fail_state_mask) {
                depth = 2;
            }
        }

        while (length-- > 0) {

            let kernel_state = origin_kernel_state.fork(process_buffer, depth);

            kernel_state.push_state(origin_kernel_state.instructions[index]);

            index += 1;
        }

        executeParseProcess(process_buffer, invalid, valid, false);

        if (valid.len() > 0) {

            if (valid.len() == 1) {


                origin_kernel_state.FORKED = true;


                //Continue Parsing from the end of the previous KernelState
                const tip = valid.data[0];

                origin_kernel_state.next.push(tip);

                //Synch tip with the origin_kernel_state
                origin_kernel_state.transfer_state_stack(tip);

                //Set the tip to point to the next set of instructions
                //after the fork.
                tip.push_state(normal_state_mask | index);

                origin_kernel_state_repo.add_state_pointer_and_sort(tip);

                //Set index so that it points to the pass instruction block;
                index = 0;

            } else {

                let furthest_byte = valid.data[0].lexer.byte_offset;

                let furthest_index = 0;

                let furthest_matching_count = 1;

                for (let i = 1; i < valid.len(); i++)

                    if (valid.data[i].lexer.byte_offset != furthest_byte) {
                        // Extract the longest parsers
                        for (let i = 1; i < valid.len(); i++) {
                            let len = valid.data[i].lexer.byte_offset;

                            if (len > furthest_byte) {
                                furthest_byte = len;
                                furthest_index = i;
                                furthest_matching_count = 1;
                            } else if (len == furthest_byte)
                                furthest_matching_count += 1;
                        }

                        if (furthest_matching_count == 1) {

                            origin_kernel_state.FORKED = true;
                            //Continue Parsing from the end of the previous KernelState
                            const tip = valid.data[furthest_index];

                            origin_kernel_state.next.push(tip);

                            //Synch tip with the origin_kernel_state
                            origin_kernel_state.transfer_state_stack(tip);

                            //Set the tip to point to the next set of instructions
                            //after the fork.
                            tip.push_state(index);

                            origin_kernel_state_repo.add_state_pointer_and_sort(tip);

                            //Set index so that it points to the null instruction block;
                            index = 0;

                        } else {
                            throw new Error("Multiple uneven parse paths exist, no resolution mechanism has been implemented for this situation. Exiting");
                        }
                        break;
                    } else if (i == valid.len() - 1) {

                        throw new Error("Multiple even parse paths exist, no resolution mechanism has been implemented for this situation. Exiting");
                    }

            }
        } else {
            const tip = invalid.get_mut_state(0);

            origin_kernel_state.next.push(tip);

            origin_kernel_state.transfer_state_stack(tip);

            tip.push_state(normal_state_mask | fail_state_mask | 1);

            origin_kernel_state_repo.add_state(tip);

            return 0;
        }

        // Link valid states to the origin state
        // Then create a new forward state the linked states reference.

        return index;
    } */
    }
}