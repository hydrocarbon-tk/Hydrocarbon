/*
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty
 * disclaimer notice.
 */

import { Lexer, init_table, compare } from "./lexer.js";
import { i32, u32 } from "../types/ir_types";
import { Logger } from './logger.js';

export { init_table, compare };

//Global Constants
const state_index_mask = (1 << 16) - 1;

const acc_sym_mask = ((1 << 27) - 1) ^ ((1 << 16) - 1);
export const fail_state_mask = 1 << 27;
export const alpha_increment_stack_pointer_mask = 1 << 0;
export const alpha_have_default_action_mask = 1 << 1;
export const alpha_auto_accept_with_peek_mask = 1 << 16;
export const alpha_auto_consume_with_peek_mask = 1 << 17;

type ScannerFunction = (l: Lexer, i: u32, j: u32) => void;

export interface KernelStateType {
    lexer_pointer: u32;
    readonly lexer_stack: Lexer[];
    stack_pointer: u32;
    state_stack: Uint32Array;
    tk_scan: ScannerFunction;
    readonly instruction_buffer: Uint32Array;
}

type state_pointer = number;
type lexer_type = number;
type lexer_token_offset = number;
type lexer_token_length = number;
type production_id = number;


/////////////////////////////////////////////
// Kernel State 
/////////////////////////////////////////////
export class KernelState implements KernelStateType {
    lexer_pointer: u32;
    readonly lexer_stack: Lexer[];
    stack_pointer: u32;
    state_stack: Uint32Array;
    tk_scan: ScannerFunction;
    readonly instruction_buffer: Uint32Array;
    // 8 byte +
    rules: number[];
    origin: KernelState;
    symbol_accumulator: number;

    // 4 byte
    state: number;
    origin_fork: number;
    input_len: number;

    // 1 byte
    VALID: boolean;
    COMPLETED: boolean;

    FORKED: boolean;
    refs: number;
    state_history: [state_pointer, lexer_type, lexer_token_offset, lexer_token_length, production_id][];
    constructor(
        state_buffer: Uint32Array,
        input_buffer: Uint8Array,
        input_len_in: number,
        tk_scan: ScannerFunction,
    ) {
        this.lexer_stack = (new Array(16))
            .fill(0)
            .map(i => { const lexer = new Lexer(input_buffer, input_buffer.length); lexer.next(); return lexer; });

        this.state_stack = new Uint32Array(128);

        this.stack_pointer = 0;

        this.lexer_pointer = 0;

        this.tk_scan = tk_scan;

        this.instruction_buffer = state_buffer;

        this.rules = [];

        this.next = [];

        this.origin = null;

        this.state = 0xFFFFFFFF;

        this.origin_fork = 0;

        this.VALID = true;

        this.COMPLETED = false;

        this.FORKED = false;

        this.refs = 0;

        this.symbol_accumulator = 0; 1 << 16;

        this.state_history = [];
    }

    get_rules_len(): number {
        return this.rules.length;
    };

    /**
     * JS Only 
     */
    add_state_to_history(kernel_state: number, prod: number, enable_history: boolean = false) {

        if (enable_history) {
            const lexer = this.lexer_stack[this.lexer_pointer];

            this.state_history.push([kernel_state, lexer.previous_type, lexer.byte_offset, lexer.token_length, prod]);
        }

    }

    push_state(kernel_state: number, enable_history: boolean = false) {

        this.state_stack[++this.stack_pointer] = kernel_state;
    }

    replace_top_state(kernel_state: number) {
        this.state_stack[this.stack_pointer] = kernel_state;
    }

    pop_state(): number {
        return this.state_stack[this.stack_pointer--];
    }

    get_state(): number {
        return this.state_stack[this.stack_pointer];
    }

    copy_state_stack(destination_state: KernelState) {

        //for (let i = 0; i < 10; i++)
        //    destination_state.lexer_stack[i].peek_unroll_sync(this.lexer_stack[i]);

        for (let i = 0; i <= this.stack_pointer; i++)
            destination_state.state_stack[i] = this.state_stack[i];
    }

    copy_lexer_stack(destination_state: KernelState) {

        for (let i = 0; i < 10; i++)
            destination_state.lexer_stack[i].peek_unroll_sync(this.lexer_stack[i]);
    }

    transfer_state_stack(new_state: KernelState) {

        this.copy_state_stack(new_state);

        for (let i = 0; i <= this.state_stack.length; i++)
            this.state_stack[i] = 0;

        new_state.stack_pointer = this.stack_pointer;

        this.stack_pointer = 0;
    }

    fork(process_buffer: KernelStateBuffer, copy_stack: boolean): KernelState {

        let forked_state: KernelState = process_buffer.get_recycled_KernelState(this);

        this.copy_lexer_stack(forked_state);
        //Increment the refs count to prevent the
        //KernelState from being recycled.
        forked_state.origin = this;
        forked_state.next = [];
        forked_state.stack_pointer = this.stack_pointer;
        forked_state.lexer_pointer = this.lexer_pointer;
        forked_state.origin_fork = this.get_rules_len();
        forked_state.state = this.state;
        forked_state.symbol_accumulator = this.symbol_accumulator;
        forked_state.VALID = true;
        forked_state.state_history = this.state_history.slice();

        this.refs++;

        process_buffer.add_state_pointer(forked_state);

        return forked_state;
    }
    add_rule(val: number): void {
        this.rules.push(val);
    }

    add_reduce(sym_len: number, fn_id: number): void {

        if (0 != (this.state & 2)) {

            // Sym len -1 is important because something is always
            // added to the stack, even if there where zero symbols
            // consumed. 
            this.symbol_accumulator -= ((sym_len - 1) << 16);

            let total = fn_id + sym_len;
            if ((total) == 0)
                return;

            if (fn_id > 0xFF || sym_len > 0x1F) {
                let low = (1 << 2) | (fn_id << 3);
                let high = sym_len;
                this.add_rule(low);
                this.add_rule(high);
            }
            else {
                let low = ((sym_len & 0x1F) << 3) | ((fn_id & 0xFF) << 8);
                this.add_rule(low);
            };
        };
    }
    add_shift(tok_len: number) {
        if (tok_len < 0)
            return;

        if (tok_len > 0x1FFF) {
            let low = 1 | (1 << 2) | ((tok_len >> 13) & 0xFFF8);
            let high = (tok_len & 0xFFFF);
            this.add_rule(low);
            this.add_rule(high);
        }
        else {
            let low = 1 | ((tok_len << 3) & 0xFFF8);
            this.add_rule(low);
        };
    }
    add_skip(skip_delta: number) {
        if (skip_delta < 1)
            return;
        ;
        if (skip_delta > 0x1FFF) {
            let low = 2 | (1 << 2) | ((skip_delta >> 13) & 0xFFF8);
            let high = (skip_delta & 0xFFFF);
            this.add_rule(low);
            this.add_rule(high);
        }
        else {
            let low = 2 | ((skip_delta << 3) & 0xFFF8);
            this.add_rule(low);
        };
    }

    consume(lexer_pointer: number): boolean {

        const l = this.lexer_stack[lexer_pointer];

        if (0 != (this.state & 2)) {

            let skip_delta = l.token_offset - l.prev_token_offset;

            this.add_skip(skip_delta);

            this.add_shift(l.token_length);

            this.symbol_accumulator += 1 << 16;
        }

        l.prev_byte_offset = l.byte_offset + l.byte_length;
        l.prev_token_offset = l.token_offset + l.token_length;

        l.next();

        return true;
    }

    /**
     * Return a reference to the main parsing lexer. 
     * ( the zero indexed lexer )
     */

    get_root_lexer() {
        return this.lexer_stack[0];
    }
}

/////////////////////////////////////////////
// Kernel State Buffer
/////////////////////////////////////////////
export class KernelStateBuffer {

    data: KernelState[];

    constructor() {
        this.data = [];
    }
    remove_state_at_index(index: number): KernelState {
        let temp_location = this.data[index];
        this.data.splice(index, 1);
        return temp_location;
    }
    len(): number {
        return this.data.length;
    };
    create_state(
        state_buffer: Uint32Array,
        input_buffer: Uint8Array,
        input_len_in: number,
        tk_scan: ScannerFunction
    ): KernelState {

        let state: KernelState = new KernelState(
            state_buffer,
            input_buffer,
            input_len_in,
            tk_scan
        );

        this.data.push(state);

        return state;
    };
    add_state_pointer(state: KernelState): void {
        this.data.push(state);
    }
    add_state_pointer_and_sort(state: KernelState): number {

        let index = -1;

        while (++index < this.data.length) {

            let exist_ref = this.data[index];

            if (exist_ref.VALID && !state.VALID)
                continue;

            if (exist_ref.lexer_stack[0].byte_offset < state.lexer_stack[0].byte_offset)
                break;
        }

        this.data.splice(index, 0, state);

        return this.data.length;
    };
    have_valid(): boolean {
        return this.data.length > 0 && this.data[0].VALID;
    };
    remove_valid_parser_state(): KernelState {
        if (this.have_valid()) {
            return this.remove_state_at_index(0);
        }
        return null;
    };
    get_mut_state(index: number): KernelState {
        return this.data[index];
    };
    get_ref_state(index: number): KernelState {
        return this.data[index];
    };

    get_recycled_KernelState(state: KernelState): KernelState {

        if (this.len() > 0) {

            let i = 0;

            while (i < this.len()) {
                let ref = this.data[i];

                if (!ref.VALID && ref.refs < 1) {
                    let invalid_state = this.remove_state_at_index(i);

                    invalid_state.rules.length = 0;

                    return invalid_state;
                }

                i++;
            }
        }

        return new KernelState(
            state.instruction_buffer,
            state.lexer_stack[0].input,
            state.lexer_stack[0].input.length,
            state.tk_scan
        );
    };
}

/////////////////////////////////////////////
// Kernel State Iterator
/////////////////////////////////////////////

export class KernelStateIterator {
    private current: KernelState;
    private refs: KernelState[];
    private index: number;
    private final_index: number;
    private valid: boolean;

    constructor(state: KernelState) {
        let active = state;

        this.refs = [];

        this.refs.push(active);

        while (active.origin) {
            active = active.origin;
            this.refs.push(active);
        }

        let last = this.refs.pop();

        this.current = last;
        this.final_index = this.refs.length > 0 ? this.refs[this.refs.length - 1].origin_fork : last.get_rules_len();
        this.index = 0;
        this.valid = true;
    }

    is_valid(): boolean {
        return this.valid;
    }

    next(): number {
        if (this.index >= this.final_index) {
            if (this.refs.length > 0) {
                let last = this.refs.pop();
                this.index = 0;
                this.final_index = this.refs.length > 0 ? this.refs[this.refs.length - 1].origin_fork : last.get_rules_len();
                this.current = last;
            }
            else {
                this.valid = false;
                return 0;
            }
        }

        return this.current.rules[this.index++];
    }
}

function instruction_executor(
    state_pointer: u32,
    prod: u32,
    kernel_state: KernelState,
    kernel_state_repo: KernelStateBuffer,
): ({ fail_mode: boolean; prod: u32; }) {

    let index = state_pointer & state_index_mask;

    let repeat_offset = 0;

    while (true) {

        const instruction = kernel_state.instruction_buffer[index];

        index += 1;

        switch ((instruction >> 28) & 0xF) {
            //Default

            case 0: default: return ({ fail_mode: false, prod });

            case 1: consume(kernel_state); break;

            case 2: goto(instruction, kernel_state); break;

            case 3: prod = set_production(instruction, prod, kernel_state); break;

            case 4: reduce(instruction, kernel_state, state_pointer); break;

            case 5: set_token_length(instruction, kernel_state); break;

            case 6: index = fork(instruction, state_pointer, index, kernel_state, kernel_state_repo); break;

            case 7: index = scan_to(kernel_state, index, instruction); break;

            case 8: index = increment(index, instruction); break;

            case 9: index = index_jump(kernel_state, index, instruction, prod); break;

            case 10: index = hash_jump(kernel_state, index, instruction, prod); break;

            case 11: repeat_offset++; push_fail_state(instruction, state_pointer, kernel_state); break;

            case 12: index = repeat(index, state_pointer, repeat_offset); break;

            case 13: index = assert_leftmost(kernel_state, index); break;

            case 14: /*NOOP*/;

            case 15: return fail(prod);
        }
    }
}

function increment(instruction: number, index: number) {
    {
        Logger.get("HC-Kernel-Debug")
            .log(`INSTRUCTION: Increment instruction pointer ${(instruction & 0xFFFFFFF)} `);
    }
    return index + (instruction & 0xFFFFFFF);
}

function assert_leftmost(kernel_state: KernelState, index: number) {

    if (kernel_state.symbol_accumulator > 1 << 16)
        index = 1;

    return index;
}

function scan_to(kernel_state: KernelState, index: number, instruction: number): number {

    let length = instruction & 0xFFFF;

    const gamma = kernel_state.instruction_buffer[index];

    index += 1;

    const tk_row = gamma >> 16;

    const skip_row = gamma & 0xFFFF;

    const scan_back = (instruction & 0x00100000) > 0;

    const lexer_pointer = kernel_state.lexer_pointer;

    let lexer = kernel_state.lexer_stack[lexer_pointer];

    let synced_lexer = kernel_state.lexer_stack[(lexer_pointer + 1) % 10];

    let start_byte_offset = lexer.prev_byte_offset;

    let start_token_offset = lexer.prev_token_offset;

    synced_lexer.sync(lexer);

    lexer.byte_length = 1;

    let RUN = true;

    let start = index;

    let end = index + length;

    let end_offset = lexer.input_len;

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
        temp_lexer.token_length = 0;
        temp_lexer.next();
    }

    while (RUN) {

        kernel_state.tk_scan(temp_lexer, tk_row, skip_row);

        for (let i = start; i < end; i++) {

            if (temp_lexer._type == kernel_state.instruction_buffer[i]) {
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
        kernel_state.lexer_pointer = 0;
        kernel_state.lexer_stack[0].peek_unroll_sync(temp_lexer);
        kernel_state.lexer_stack[0].prev_byte_offset = start_byte_offset;
        kernel_state.lexer_stack[0].prev_token_offset = start_token_offset;
    }

    return index;
}
function hash_jump(kernel_state: KernelState, index: number, instruction: number, prod: number): number {

    {
        Logger.get("HC-Kernel-Debug")
            .log(`INSTRUCTION: Hash Table Lookup `);
    }

    const input_type = ((instruction >> 24) & 0x3);

    const token_transition = ((instruction >> 26) & 0x3);

    let auto_accept_with_peek = (instruction & alpha_auto_accept_with_peek_mask) > 0;

    let auto_consume_with_peek = (instruction & alpha_auto_consume_with_peek_mask) > 0;

    let token_row_switches = kernel_state.instruction_buffer[index];

    let table_data = kernel_state.instruction_buffer[index + 1];

    index += 2;

    const mod = (1 << ((table_data >>> 16) & 0xFFFF)) - 1;

    const table_size = (table_data) & 0xFFFF;

    const hash_table_start = index;

    const instruction_field_start = hash_table_start + table_size;

    const instruction_field_size = instruction & 0xFFFF;

    let { input_value, lexer_pointer: lp } =
        get_token_info(
            kernel_state,
            input_type,
            token_transition,
            token_row_switches,
            auto_accept_with_peek,
            auto_consume_with_peek,
            0,
            prod
        );
    let hash_index = input_value & mod;

    kernel_state.lexer_pointer = lp;

    if (Logger.get("HC-Kernel-Debug").ACTIVE) {//Reference Debug
        const data =
            Array.from(
                kernel_state.instruction_buffer.slice(hash_table_start, hash_table_start + table_size)
            ).map((cell, i) => ({
                index: i,
                stored_value: cell & 0x7FF,
                next: (((cell >>> 0) >>> 22) & 0x3FF) - 512,
                instr_offset: (cell >> 11) & 0x7FF
            }));

        Logger.get("HC-Kernel-Debug")
            .log(`INSTRUCTION: Table Data`, data);
    }

    while (true) {

        const cell = kernel_state.instruction_buffer[hash_table_start + hash_index];

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
function index_jump(kernel_state: KernelState, index: number, instruction: number, prod: number) {

    { //Reference Debug
        Logger.get("HC-Kernel-Debug")
            .log(`INSTRUCTION: Jump Table Lookup `);
    }

    let token_row_switches = kernel_state.instruction_buffer[index];

    let table_data = kernel_state.instruction_buffer[index + 1];

    index += 2;

    let auto_accept_with_peek = (instruction & alpha_auto_accept_with_peek_mask) > 0;

    let auto_consume_with_peek = (instruction & alpha_auto_consume_with_peek_mask) > 0;

    let basis__ = instruction & 0xFFFF;

    const input_type = ((instruction >> 24) & 0x3);

    const token_transition = ((instruction >> 26) & 0x3);

    let { input_value, lexer_pointer: lp } = get_token_info(
        kernel_state,
        input_type,
        token_transition,
        token_row_switches,
        auto_accept_with_peek,
        auto_consume_with_peek,
        basis__,
        prod
    );

    kernel_state.lexer_pointer = lp;

    let number_of_rows = table_data >> 16;
    let row_size = table_data & 0xFFFF;

    {
        Logger.get("HC-Kernel-Debug")
            .log(`INSTRUCTION: Jump table: from ${basis__} to ${basis__ + number_of_rows - 1} on value ${input_value + basis__}`);
    }
    if (input_value >= 0 && input_value < number_of_rows) {

        return index + input_value * row_size + row_size;

    } else {
        // Use default behavior found at the beginning of the 
        // jump table
        return index;
    }
}
}

function set_token_length(instruction: number, kernel_state: KernelState) {

    let length = instruction & 0xFFFFFFF;

    let lexer_pointer = kernel_state.lexer_pointer;

    kernel_state.lexer_stack[lexer_pointer].token_length = length;
    kernel_state.lexer_stack[lexer_pointer].byte_length = length;
    kernel_state.lexer_stack[0].token_length = length;
    kernel_state.lexer_stack[0].byte_length = length;

}

function reduce(instruction: number, kernel_state: KernelState, state_pointer: number) {
    let low = (instruction) & 0xFFFF;

    if ((low & 0xFFFF) == 0xFFFF) {

        let accumulated_symbols = kernel_state.symbol_accumulator
            -
            ((state_pointer & acc_sym_mask));

        let len = accumulated_symbols >> 16;

        let fn_id = (instruction >> 16) & 0x0FFF;

        {
            Logger.get("HC-Kernel-Debug")
                .log(`INSTRUCTION: Reduce: ${accumulated_symbols}`);
        }
        //Extract accumulated symbols inform
        kernel_state.add_reduce(len, fn_id);
    } else {

        kernel_state.add_rule(low);

        if ((low & 0x4) == 0x4) {
            let high_len = (instruction >> 16) & 0xFFFF;
            {
                Logger.get("HC-Kernel-Debug")
                    .log(`INSTRUCTION: Reduce: ${high_len}`);
            }
            kernel_state.symbol_accumulator -= (high_len - 1) << 16;
            kernel_state.add_rule(high_len & 0xFFF);
        } else {
            {
                Logger.get("HC-Kernel-Debug")
                    .log(`INSTRUCTION: Reduce: ${(((low >> 3) & 0x1F))}`);
            }
            kernel_state.symbol_accumulator -= (((low >> 3) & 0x1F) - 1) << 16;
        }
    }
}

function set_production(instruction: number, prod: number, kernel_state: KernelState) {
    {
        Logger.get("HC-Kernel-Debug")
            .log(`INSTRUCTION: Set Production: ${instruction & 0xFFFFFFF}`);
    }
    prod = instruction & 0xFFFFFFF;
    kernel_state.prod = instruction & 0xFFFFFFF;
    return prod;
}

function goto(instruction: number, kernel_state: KernelState) {
    {
        Logger.get("HC-Kernel-Debug")
            .log(`INSTRUCTION: Goto: ${instruction & 0xFFFF}`);
    }

    kernel_state.push_state(
        instruction | ((kernel_state.symbol_accumulator) & acc_sym_mask)
    );
}

function consume(kernel_state: KernelState) {


    if (Logger.get("HC-Kernel-Debug").ACTIVE) { //Reference Debug

        let lexer = kernel_state.lexer_stack[kernel_state.lexer_pointer];

        const slice = Array.from(
            lexer.input.slice(lexer.byte_offset, lexer.byte_offset + lexer.byte_length)).map(i => String.fromCharCode(i)).join("");
        Logger.get("HC-Kernel-Debug")
            .log(`INSTRUCTION: Consume: ${slice}`);
    }

    kernel_state.consume(kernel_state.lexer_pointer);
}

function fail(prod: number): { fail_mode: boolean; prod: u32; } {
    {
        Logger.get("HC-Kernel-Debug")
            .log(`INSTRUCTION: Fail State `);
    }
    return ({ fail_mode: true, prod });
}

function repeat(index: number, state_pointer: number, repeat_offset: number = 0) {
    Logger.get("HC-Kernel-Debug")
        .log(`INSTRUCTION: Repeat`);
    index = (state_pointer & state_index_mask) + repeat_offset;
    return index;
}

function push_fail_state(instruction: number, state_pointer: number, kernel_state: KernelState) {

    let fail_state_pointer = (instruction) >>> 0;

    if ((state_pointer & fail_state_mask) > 0) {
        fail_state_pointer |= acc_sym_mask & state_pointer;
    } else {
        fail_state_pointer |= kernel_state.symbol_accumulator & acc_sym_mask;
    }

    if ((kernel_state.get_state() & 0xFFFF) != ((fail_state_pointer >>> 0) & 0xFFFF)) {
        {
            Logger.get("HC-Kernel-Debug")
                .log(`INSTRUCTION: Set Failure state ${instruction & 0xFFFFFF}`);
        }
        kernel_state.push_state(fail_state_pointer >>> 0);
    } else {
        kernel_state.replace_top_state(fail_state_pointer);
    }
}

function get_token_info(
    kernel_state: KernelState,
    input_type: number,
    token_transition: number,
    token_row_switches: number,
    auto_accept_with_peek: boolean,
    auto_consume_with_peek: boolean,
    basis__: number,
    prod: any
): { input_value: number; lexer_pointer: number; } {

    let input_value: i32 = 0;

    let lexer = kernel_state.lexer_stack[kernel_state.lexer_pointer];

    let lexer_pointer = kernel_state.lexer_pointer;

    if (input_type == 2) { // Lexer token id input

        const tk_row = token_row_switches >> 16;

        const skip_row = token_row_switches & 0xFFFF;

        switch (token_transition) {

            case 0: /* do nothing */
                break;

            case 1: /* set next peek lexer */ {

                const prev_lexer = kernel_state.lexer_stack[(kernel_state.lexer_pointer)];

                kernel_state.lexer_pointer += 1;

                lexer = kernel_state.lexer_stack[(kernel_state.lexer_pointer)];

                lexer.sync(prev_lexer);

                lexer.next();

                lexer.sync_offsets();

                kernel_state.tk_scan(lexer, tk_row, skip_row);

                lexer_pointer = kernel_state.lexer_pointer;

            } break;

            case 2: /* set primary lexer */

                let consume_index = kernel_state.lexer_pointer >> 16;

                let peek_level = kernel_state.lexer_pointer & 0xFFFF;

                if (
                    (peek_level - consume_index) > 0
                    &&
                    auto_accept_with_peek
                ) {


                    /* consume peek stack */

                    /*  lexer = kernel_state.lexer_stack[consume_index];
 
                     lexer_pointer = consume_index;
 
                     if (auto_consume_with_peek) {
                         kernel_state.lexer_pointer += 1 << 16;
                         if (consume_index > 0)
                             kernel_state.lexer_stack[0].peek_unroll_sync(kernel_state.lexer_stack[consume_index + 1]);
                     } else {
                         kernel_state.lexer_stack[0].peek_unroll_sync(kernel_state.lexer_stack[consume_index]);
                         lexer_pointer = 0;
                         kernel_state.lexer_pointer = 0;
                     } */

                    //lexer._type = basis__;

                    lexer = kernel_state.lexer_stack[0];

                    lexer._type = 0;

                } {

                    kernel_state.lexer_pointer = 0;

                    lexer = kernel_state.lexer_stack[0];

                    kernel_state.tk_scan(lexer, tk_row, skip_row);

                    lexer_pointer = 0;

                }
                break;
            case 3: /*do nothing */ break;
        }

        Logger.get("HC-Kernel-Debug")
            .log(`INSTRUCTION: Lexer type: [${lexer._type}] | value: ` +
                Array.from(lexer.input.slice(lexer.byte_offset - 5, lexer.byte_offset)).map(i => String.fromCodePoint(i)).join("") + "| "
                + Array.from(lexer.input.slice(lexer.byte_offset, lexer.byte_offset + lexer.byte_length)).map(i => String.fromCodePoint(i)).join("") + " |"
                + Array.from(lexer.input.slice(lexer.byte_offset + lexer.byte_length, lexer.byte_offset + lexer.byte_length + 5)).map(i => String.fromCodePoint(i)).join("")
            );

        input_value = lexer._type - basis__;

    } else {
        // Production id input
        input_value = prod - basis__;
    }
    return { input_value, lexer_pointer };
}


export function kernel_executor(
    kernel_state: KernelState,
    kernel_states_repo: KernelStateBuffer,
    enable_history: boolean
) {

    //Kernel
    //Input
    let fail_mode = false;
    let prod = 0;

    while (true) {

        let i = 0;

        while (i++ < 4) {
            // Hint to the compiler to inline this section 4 times
            const state = kernel_state.pop_state();

            if (state > 0) {



                /**
                 * A state pointer is divided into three data segments
                 *        __Is fail state bit
                 *   Meta|  __ Accumulator Delta  _ Pointer 
                 *   _|_ | _|_______ _____________|_
                 *  |   |||         |               |
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
                Logger.get("HC-Kernel-Debug")
                    .log(`PARSER: << On state ${state & 0xFFFF} >>`);


                if ((!fail_mode && ((state & fail_state_mask) == 0))
                    || (fail_mode && (state & fail_state_mask) != 0)) {

                    ({ fail_mode, prod } = instruction_executor(
                        state,
                        prod,
                        kernel_state,
                        kernel_states_repo
                    ));

                    kernel_state.add_state_to_history(state, prod, enable_history);
                }
            }
        }

        if (kernel_state.stack_pointer < 1)
            break;
    }

    return fail_mode;
}

export function token_production(
    lexer: Lexer,
    production_state_pointer: u32,
    pid: number,
    _type: number,
    tk_flag: number,
    state_buffer: Uint32Array,
    tk_scan: ScannerFunction,
    enable_history: boolean = false
): boolean {

    if (lexer._type == _type) {
        return true;
    }

    if ((lexer.active_token_productions & tk_flag) > 0) {
        return false;
    }


    let data_buffer: KernelStateBuffer = new KernelStateBuffer();

    let state: KernelState = new KernelState(
        state_buffer,
        lexer.input,
        lexer.input.length,
        tk_scan

    );

    state.lexer_stack[0].sync(lexer);
    state.lexer_stack[0].active_token_productions |= tk_flag;
    state.state_stack[1] = production_state_pointer;
    state.state_stack[0] = 0;
    state.stack_pointer = 1;
    state.state = 0;


    if (!kernel_executor(state, data_buffer, enable_history)) {

        if (enable_history)
            Logger
                .get("HC-Kernel-Debug").log("\n-----------------END TOKEN PRODUCTION------------------------\n");

        lexer.set_token_span_to(state.lexer_stack[0]);

        lexer._type = _type;

        return true;
    }


    if (enable_history)
        Logger
            .get("HC-Kernel-Debug").log("\n-----------------END TOKEN PRODUCTION------------------------\n");

    return false;
}

function fork(
    instruction: number,
    origin_state: number,
    index: number,
    origin_kernel_state: KernelState,
    origin_kernel_state_repo: KernelStateBuffer,
) {

    Logger.get("HC-Kernel-Debug")
        .log(`INSTRUCTION: Fork: `);

    let valid = new KernelStateBuffer;
    let invalid = new KernelStateBuffer;
    let process_buffer = new KernelStateBuffer;

    let length = (instruction & 0xFFFFFFF);

    origin_kernel_state.FORKED = true;

    while (length-- > 0) {

        let kernel_state = origin_kernel_state.fork(process_buffer, false);

        const new_state = origin_kernel_state.instruction_buffer[index];

        Logger.get("HC-Kernel-Debug")
            .log(`INSTRUCTION: fork to State ${origin_kernel_state.instruction_buffer[index]}`);

        kernel_state.push_state(new_state);

        index += 1;
    }

    while (process_buffer.len() > 0) {

        let i = 0;

        for (; i < process_buffer.len();) {

            let kernel_state: KernelState = process_buffer.data[i];

            const FAILED = kernel_executor(kernel_state, invalid, false);

            kernel_state.COMPLETED = true;

            kernel_state.VALID = !FAILED;

            if (kernel_state.FORKED)
                process_buffer.remove_state_at_index(i);

            else if (kernel_state.VALID) {
                Logger.get("HC-Kernel-Debug").log("PARSER: Complete valid sub-parser run");
                valid
                    .add_state_pointer_and_sort(process_buffer.remove_state_at_index(i));
            } else {
                Logger.get("HC-Kernel-Debug").log("PARSER: Invalid sub-parser run exited");
                invalid
                    .add_state_pointer_and_sort(process_buffer.remove_state_at_index(i));
            }
        }

        while (invalid.have_valid())
            process_buffer.add_state_pointer(invalid.remove_valid_parser_state());
    }

    if (valid.len() > 0) {

        if (valid.len() == 1) {

            //Continue Parsing from the end of the previous KernelState
            const tip = valid.data[0];

            origin_kernel_state.next.push(tip);

            //Synch tip with the origin_kernel_state
            origin_kernel_state.transfer_state_stack(tip);

            //Set the tip to point to the next set of instructions
            //after the fork.
            tip.push_state(index);

            origin_kernel_state_repo.add_state_pointer(tip);

            //Set index so that it points to the pass instruction block;
            index = 0;

            tip.lexer_pointer = 0;

        } else {

            Logger.get("HC-Kernel-Debug").log("PARSER: Multiple valid parse paths exist");

            let furthest_byte = valid.data[0].lexer_stack[0].byte_offset;

            let furthest_index = 0;

            let furthest_matching_count = 1;

            for (let i = 1; i < valid.len(); i++)

                if (valid.data[i].lexer_stack[0].byte_offset != furthest_byte) {
                    // Extract the longest parsers
                    for (let i = 1; i < valid.len(); i++) {
                        let len = valid.data[i].lexer_stack[0].byte_offset;

                        if (len > furthest_byte) {
                            furthest_byte = len;
                            furthest_index = i;
                            furthest_matching_count = 1;
                        } else if (len == furthest_byte)
                            furthest_matching_count += 1;
                    }

                    if (furthest_matching_count == 1) {
                        Logger.get("HC-Kernel-Debug").log("PARSER: Selecting the single longest parse path");
                        //Continue Parsing from the end of the previous KernelState
                        //Continue Parsing from the end of the previous KernelState
                        const tip = valid.data[furthest_index];

                        origin_kernel_state.next.push(tip);

                        //Synch tip with the origin_kernel_state
                        origin_kernel_state.transfer_state_stack(tip);

                        //Set the tip to point to the next set of instructions
                        //after the fork.
                        tip.push_state(index);

                        origin_kernel_state_repo.add_state_pointer(tip);

                        //Set index so that it points to the null instruction block;
                        index = 0;

                        tip.lexer_pointer = 0;

                    } else {
                        throw new Error("Multiple uneven parse paths exist, no resolution mechanism has been implemented for this situation. Exiting");
                    }
                    break;
                } else if (i == valid.len() - 1) {

                    throw new Error("Multiple even parse paths exist, no resolution mechanism has been implemented for this situation. Exiting");
                }

        }
    } else {
        throw new Error("All parse paths exhausted");
    }

    // Link valid states to the origin state
    // Then create a new forward state the linked states reference.

    return index;
}

export function run(
    state_buffer: Uint32Array,
    input_buffer: Uint8Array,
    input_byte_length: number,
    state_pointer: number,
    scanner_function: ScannerFunction,
    enable_history: boolean = false
): { invalid: KernelStateBuffer, valid: KernelStateBuffer; } {

    let valid = new KernelStateBuffer;
    let invalid = new KernelStateBuffer;
    let process_buffer = new KernelStateBuffer;

    let state = process_buffer.create_state(
        state_buffer,
        input_buffer,
        input_byte_length,
        scanner_function
    );

    Logger.get("HC-Kernel-Debug").deactivate();

    state.state_stack[0] = 0;
    state.push_state(state_pointer);

    while (process_buffer.len() > 0) {

        let i = 0;

        for (; i < process_buffer.len();) {

            let kernel_state: KernelState = process_buffer.data[i];

            const FAILED = kernel_executor(kernel_state, invalid, enable_history);

            kernel_state.COMPLETED = true;

            kernel_state.VALID = !FAILED;

            if (kernel_state.FORKED)
                // Remove state. It is now only
                // referenced by its leaf states
                process_buffer.remove_state_at_index(i);
            else if (kernel_state.VALID) {
                Logger.get("HC-Kernel-Debug").log("PARSER: Complete valid parser run");
                valid
                    .add_state_pointer_and_sort(process_buffer.remove_state_at_index(i));

            }
            else {
                Logger.get("HC-Kernel-Debug").log("PARSER: Invalid parser run exited");
                invalid
                    .add_state_pointer_and_sort(process_buffer.remove_state_at_index(i));

            }
        }

        while (invalid.have_valid())
            process_buffer.add_state_pointer(invalid.remove_valid_parser_state());

    }

    return { invalid, valid };
}