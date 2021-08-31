/////////////////////////////////////////////
// PARSER STATE
/////////////////////////////////////////////

import { Lexer, init_table, char_lu_table } from './lexer.js';

export { init_table, char_lu_table };

type StackFunction = (arg1: ParserState, arg2: ParserStateBuffer, arg3: number) => number;

export function set_production(arg1: ParserState, arg2: ParserStateBuffer, arg3: number) {
    return arg3;
};

export class ParserState {
    lexer: Lexer;
    // 8 byte +
    rules: number[];
    stash: number[];
    stack: StackFunction[];
    origin: ParserState;

    // 4 byte
    state: number;
    origin_fork: number;
    input_len: number;
    prod: number;
    // 1 byte
    VALID: boolean;
    COMPLETED: boolean;
    refs: number;

    constructor(input_buffer: Uint8Array, input_len_in: number) {
        this.lexer = new Lexer(input_buffer, input_len_in);
        this.stack = [];
        this.stash = [];
        this.rules = [];

        this.origin = null;


        this.state = createState(1);
        this.origin_fork = 0;
        this.prod = -1;

        this.VALID = true;
        this.COMPLETED = false;
        this.refs = 0;
    }
    sync(ptr: ParserState) {
        if (ptr == this)
            return;
    };
    get_stack_len(): number {
        return this.stack.length;
    };
    get_rules_len(): number {
        return this.rules.length;
    };
    push_fn(stack_val: StackFunction, stash_val: number) {
        this.stack.push(stack_val);
        this.stash.push(stash_val);
    };
    reset(origin: Lexer, stack_ptr: number, rules_ptr: number) {
        this.rules.length = rules_ptr;
        this.stack.length = stack_ptr;
        this.stash.length = stack_ptr;
        this.lexer.sync(origin);
    };

    fork(process_buffer: ParserStateBuffer): ParserState {
        let forked_state: ParserState = process_buffer.get_recycled_ParserState(this);

        const len = this.get_stack_len();
        for (let i: number = 0; i < len; i++) {
            forked_state.stash.push(this.stash[i]);
            forked_state.stack.push(this.stack[i]);
        };

        //Increment the refs count to prevent the
        //ParserState from being recycled.
        this.refs++;
        forked_state.origin = this;
        forked_state.origin_fork = this.get_rules_len();
        forked_state.lexer.sync(this.lexer);
        forked_state.state = this.state;
        forked_state.prod = this.prod;
        forked_state.VALID = true;

        process_buffer.add_state_pointer(forked_state);

        return forked_state;
    }
    add_rule(val: number): void {
        this.rules.push(val);
    }
}

/////////////////////////////////////////////
// PARSER STATE Iterator
/////////////////////////////////////////////

export class ParserStateIterator {
    private current: ParserState;
    private refs: ParserState[];
    private index: number;
    private final_index: number;
    private valid: boolean;

    constructor(state: ParserState) {
        let active = state;

        this.refs = [];

        this.refs.push(active);

        while (active.origin) {
            active = active.origin;
            this.refs.push(active);
        }

        let last = this.refs.pop();

        this.current = last;
        this.final_index = this.refs.length > 0 ? this.refs[this.refs.length - 1].origin_fork : last.get_rules_len() - 1;
        this.index = 0;
        this.valid = true;
    }

    is_valid(): boolean {
        return this.valid;
    }

    next(): number {
        if (this.index > this.final_index) {
            if (this.refs.length > 0) {
                let last = this.refs.pop();
                this.index = 0;
                this.final_index = this.refs.length > 0 ? this.refs[this.refs.length - 1].origin_fork : last.get_rules_len() - 1;
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

// ///////////////////////////////////////////
// PARSER STATE BUFFER
// ///////////////////////////////////////////

export class ParserStateBuffer {

    data: ParserState[];

    constructor() {
        this.data = [];
    }
    remove_state_at_index(index: number): ParserState {
        let temp_location = this.data[index];
        this.data.splice(index, 1);
        return temp_location;
    }
    len(): number {
        return this.data.length;
    };
    create_state(input: Uint8Array, input_len: number): ParserState {

        let state: ParserState = new ParserState(input, input_len);

        this.data.push(state);

        return state;
    };
    add_state_pointer(state: ParserState): void {
        this.data.push(state);
    }
    add_state_pointer_and_sort(state: ParserState): number {

        let index = 0;

        while (index < this.data.length) {
            let exist_ref = this.data[index];

            if (state.VALID &&
                (!exist_ref.VALID)) {
                break;
            }
            else {
                if (exist_ref.lexer.byte_offset < state.lexer.byte_offset) {
                    break;
                }
            };
            index++;
        }

        this.data.splice(index, 0, state);

        return this.data.length;
    };
    have_valid(): boolean {
        return this.data.length > 0 && this.data[0].VALID;
    };
    remove_valid_parser_state(): ParserState {
        if (this.have_valid()) {
            return this.remove_state_at_index(0);
        }
        return null;
    };
    get_mut_state(index: number): ParserState {
        return this.data[index];
    };
    get_ref_state(index: number): ParserState {
        return this.data[index];
    };

    get_recycled_ParserState(state: ParserState): ParserState {
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

        return new ParserState(state.lexer.input, state.lexer.input.length);
    };
}

export function createState(ENABLE_STACK_OUTPUT: number): number { return 1 | (ENABLE_STACK_OUTPUT << 1); }

export function token_production(lexer: Lexer, production: StackFunction, pid: number, _type: number, tk_flag: number): boolean {
    if (lexer._type == _type) {
        return true;
    }

    if ((lexer.active_token_productions & tk_flag) > 0) {
        return false;
    }


    let data_buffer: ParserStateBuffer = new ParserStateBuffer();
    let state: ParserState = new ParserState(lexer.input, lexer.input.length);

    state.lexer.sync(lexer);
    state.lexer.active_token_productions |= tk_flag;
    state.push_fn(production, 0);
    state.state = 0;

    let ACTIVE: boolean = true;

    while (ACTIVE) {
        ACTIVE = step_kernel(state, data_buffer, 0);
    }

    if (state.prod == pid) {
        lexer.set_token_span_to(state.lexer);
        lexer._type = _type;
        return true;
    }

    return false;
}

export function compare(
    lexer: Lexer,
    data_offset: number,
    sequence_offset: number,
    byte_length: number,
    sequence: Uint8Array
): number {
    let i = data_offset;
    let j = sequence_offset;
    let len = j + byte_length;
    for (; j < len; i++, j++)
        if ((lexer.get_byte_at(i) != sequence[j]))
            return j - sequence_offset;
    ;
    return byte_length;
}

export function is_output_enabled(state: number): boolean { return 0 != (state & 2); }

export function add_reduce(state: ParserState, sym_len: number, fn_id: number): void {
    if (is_output_enabled(state.state)) {
        let total = fn_id + sym_len;
        if ((total) == 0)
            return;

        if (fn_id > 0xFF || sym_len > 0x1F) {
            let low = (1 << 2) | (fn_id << 3);
            let high = sym_len;
            state.add_rule(low);
            state.add_rule(high);
        }
        else {
            let low = ((sym_len & 0x1F) << 3) | ((fn_id & 0xFF) << 8);
            state.add_rule(low);
        };
    };
}
export function add_shift(state: ParserState, tok_len: number) {
    if (tok_len < 0)
        return;

    if (tok_len > 0x1FFF) {
        let low = 1 | (1 << 2) | ((tok_len >> 13) & 0xFFF8);
        let high = (tok_len & 0xFFFF);
        state.add_rule(low);
        state.add_rule(high);
    }
    else {
        let low = 1 | ((tok_len << 3) & 0xFFF8);
        state.add_rule(low);
    };
}
export function add_skip(state: ParserState, skip_delta: number) {
    if (skip_delta < 1)
        return;
    ;
    if (skip_delta > 0x1FFF) {
        let low = 2 | (1 << 2) | ((skip_delta >> 13) & 0xFFF8);
        let high = (skip_delta & 0xFFFF);
        state.add_rule(low);
        state.add_rule(high);
    }
    else {
        let low = 2 | ((skip_delta << 3) & 0xFFF8);
        state.add_rule(low);
    };
}

export function consume(state: ParserState): boolean {

    const l = state.lexer;

    if (is_output_enabled(state.state)) {
        let skip_delta = state.lexer.token_offset - state.lexer.prev_token_offset;
        add_skip(state, skip_delta);
        add_shift(state, l.token_length);
    }

    l.prev_byte_offset = l.byte_offset + l.byte_length;
    l.prev_token_offset = l.token_offset + l.token_length;

    l.next();

    return true;
}

function step_kernel(state: ParserState, data_buffer: ParserStateBuffer, base: number): boolean {
    if (state.get_stack_len() > base) {

        let _fn: StackFunction = state.stack.pop();
        let stash: number = state.stash.pop();

        state.prod = _fn(state, data_buffer, stash);

        if (state.prod < 0) {
            return false;
        };

        return true;
    }
    return false;
}

function run(
    process_buffer: ParserStateBuffer,
    invalid_buffer: ParserStateBuffer,
    valid_buffer: ParserStateBuffer,
    prod_id: number
): number {
    while (process_buffer.len() > 0) {
        let i = 0;
        for (; i < process_buffer.len();) {
            let state: ParserState = process_buffer.data[i];
            if (!step_kernel(state, invalid_buffer, 0)) {
                state.COMPLETED = true;

                state.VALID = (state.prod) == prod_id;

                if (state.VALID) {
                    valid_buffer
                        .add_state_pointer_and_sort(process_buffer.remove_state_at_index(i));
                }
                else {
                    invalid_buffer
                        .add_state_pointer_and_sort(process_buffer.remove_state_at_index(i));
                }
            }
            else {
                i++;
            }
        };

        while (invalid_buffer.have_valid())
            process_buffer.add_state_pointer(invalid_buffer.remove_valid_parser_state());
    };
    return valid_buffer.len();
}

export function recognize(
    input_buffer: Uint8Array,
    input_byte_length: number,
    production_id: number,
    state_function: StackFunction
): { invalid: ParserStateBuffer, valid: ParserStateBuffer; } {

    let process_buffer = new ParserStateBuffer;
    let valid = new ParserStateBuffer;
    let invalid = new ParserStateBuffer;

    let state = process_buffer.create_state(input_buffer, input_byte_length);

    state.push_fn(state_function, 0);

    state.lexer.next();

    run(
        process_buffer,
        invalid,
        valid,
        production_id);

    return { invalid, valid };
}
