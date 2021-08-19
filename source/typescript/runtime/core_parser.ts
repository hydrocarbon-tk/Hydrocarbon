/////////////////////////////////////////////
// PARSER STATE
/////////////////////////////////////////////

export const init_table = lu_table => {
    char_lu_table = lu_table;
};

let char_lu_table: Uint8Array = null;
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
    private limit: number;
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
        this.limit = this.refs.length > 0 ? this.refs[this.refs.length - 1].origin_fork : last.get_rules_len();
        this.index = 0;
        this.valid = true;
    }

    is_valid(): boolean {
        return this.valid;
    }

    next(): number {
        if (this.index >= this.limit) {
            if (this.refs.length > 0) {
                let last = this.refs.pop();
                this.index = 0;
                this.limit = this.refs.length > 0 ? this.refs[this.refs.length - 1].origin_fork : last.get_rules_len();
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

/////////////////////////////////////////////
// PARSER STATE BUFFER
/////////////////////////////////////////////

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

/////////////////////////////////////////////
// LEXER
/////////////////////////////////////////////

class Lexer {
    byte_offset: number;
    token_offset: number;
    token_length: number;
    byte_length: number;
    prev_byte_offset: number;
    prev_token_offset: number;
    line: number;
    _type: number;
    current_byte: number;
    input: Uint8Array;
    input_len: number;
    active_token_productions: number;
    constructor(input_buffer: Uint8Array, input_len_in: number) {
        this.input = input_buffer;
        this.input_len = input_len_in;
        this.byte_offset = 0;
        this.byte_length = 0;
        this.token_length = 0;
        this.token_offset = 0;
        this.prev_byte_offset = 0;
        this.prev_token_offset = 0;
        this.active_token_productions = 0;
        this._type = 0;
        this.line = 0;
        this.current_byte = 0;
    }
    setToken(type_in: number, byte_length_in: number, token_length_in: number): number {
        this._type = type_in;
        this.byte_length = byte_length_in;
        this.token_length = token_length_in;
        return type_in;
    }
    get_byte_at(index: number): number {
        return this.input[index];
    };
    getType(USE_UNICODE: boolean) {
        let t: number = this._type;

        if (this.END())
            return 1;

        if ((t) == 0) {
            if (!(USE_UNICODE) || this.current_byte < 128) {
                t = getTypeAt(this.current_byte);
            }
            else {
                let code_point: number = get_utf8_code_point_at(this.byte_offset, this.input);
                this.byte_length = get_ut8_byte_length_from_code_point(code_point);
                t = getTypeAt(code_point);
            };
        };
        return t;
    }
    isSym(USE_UNICODE: boolean): boolean {
        if (this._type == 0 && this.getType(USE_UNICODE) == 2) {
            this._type = 2;
        };
        return this._type == 2;
    }
    isNL(): boolean {
        if (this._type == 0 && (this.current_byte) == 10 || (this.current_byte) == 13) {
            this._type = 7;
        };
        return this._type == 7;
    }
    isSP(USE_UNICODE: boolean): boolean {
        if (this._type == 0 && (this.current_byte) == 32) {
            this._type = 8;
        };
        return this._type == 8;
    }
    isNum(): boolean {
        if (this._type == 0) {
            if (this.getType(false) == 5) {
                let l = this.input.length;
                let off = this.byte_offset;
                while ((off++ < l) && 47 < this.input[off] && this.input[off] < 58) {
                    this.byte_length += 1;
                    this.token_length += 1;
                };
                this._type = 5;
                return true;
            }
            else
                return false;
        }
        else
            return this._type == 5;
    }
    isUniID(): boolean {
        if (this._type == 0) {
            if (this.getType(true) == 3) {
                let l: number = this.input.length;
                let off: number = this.byte_offset;
                let prev_byte_len: number = this.byte_length;
                while ((off + this.byte_length) < l) {
                    let code_point = get_utf8_code_point_at(this.byte_offset + this.byte_length, this.input);
                    if ((96 & char_lu_table[code_point]) > 0) {
                        this.byte_length += get_ut8_byte_length_from_code_point(code_point);
                        prev_byte_len = this.byte_length;
                        this.token_length += 1;
                    }
                    else {
                        break;
                    };
                };
                this.byte_length = prev_byte_len;
                this._type = 3;
                return true;
            }
            else
                return false;
        }
        else
            return this._type == 3;
    }

    copy_in_place(): Lexer {
        const destination = new Lexer(this.input, this.input_len);
        destination.sync(this);
        return destination;
    }
    sync(source: Lexer) {
        this.byte_offset = source.byte_offset;
        this.byte_length = source.byte_length;
        this.token_length = source.token_length;
        this.token_offset = source.token_offset;
        this.prev_byte_offset = source.prev_byte_offset;
        this.prev_token_offset = source.prev_token_offset;
        this.line = source.line;
        this._type = source._type;
        this.current_byte = source.current_byte;
        this.active_token_productions = source.active_token_productions;
    }
    set_token_span_to(source: Lexer) {
        this.byte_length = source.prev_byte_offset - this.byte_offset;
        this.token_length = source.prev_token_offset - this.token_offset;
        this._type = source._type;
    };
    next() {
        this.byte_offset += this.byte_length;
        this.token_offset += this.token_length;
        if (this.input.length <= this.byte_offset) {
            this._type = 1;
            this.byte_length = 0;
            this.token_length = 0;
            this.current_byte = 0;
        }
        else {
            this.current_byte = this.input[this.byte_offset];
            if (this.current_byte == 10)
                this.line += 1;

            this._type = 0;
            this.byte_length = 1;
            this.token_length = 1;
        };
    }
    END(): boolean { return this.byte_offset >= this.input.length; };
}

/////////////////////////////////////////////
// OTHER FUNCTIONS
/////////////////////////////////////////////

function get_ut8_byte_length_from_code_point(code_point: number): number {
    if ((code_point) == 0) {
        return 1;
    }
    else if ((code_point & 0x7F) == code_point) {
        return 1;
    }
    else if ((code_point & 0x7FF) == code_point) {
        return 2;
    }
    else if ((code_point & 0xFFFF) == code_point) {
        return 3;
    }
    else {
        return 4;
    };
}
function get_utf8_code_point_at(index: number, buffer: Uint8Array): number {
    let a = buffer[index];
    let flag = 14;
    if (a & 0x80) {
        flag = a & 0xF0;
        let b = buffer[index + 1];
        if (flag & 0xE0) {
            flag = a & 0xF8;
            let c = buffer[index + 2];
            if ((flag) == 0xF0) {
                return ((a & 0x7) << 18) | ((b & 0x3F) << 12) | ((c & 0x3F) << 6) | (buffer[index + 3] & 0x3F);
            }
            else if ((flag) == 0xE0) {
                return ((a & 0xF) << 12) | ((b & 0x3F) << 6) | (c & 0x3F);
            };
        }
        else if ((flag) == 0xC) {
            return ((a & 0x1F) << 6) | b & 0x3F;
        };
    }
    else
        return a;
    return 0;
}

function getTypeAt(code_point: number): number { return (char_lu_table[code_point] & 0x1F); }

export function createState(ENABLE_STACK_OUTPUT: number): number { return 1 | (ENABLE_STACK_OUTPUT << 1); }

export function token_production(lexer: Lexer, production: StackFunction, pid: number, _type: number, tk_flag: number): boolean {
    if (lexer._type == _type) {
        return true;
    }

    if ((lexer.active_token_productions & tk_flag) > 0) {
        return false;
    }

    lexer.active_token_productions |= tk_flag;

    let data_buffer: ParserStateBuffer = new ParserStateBuffer();
    let state: ParserState = new ParserState(lexer.input, lexer.input.length);

    state.lexer.sync(lexer);
    state.push_fn(production, 0);
    state.state = 0;

    let ACTIVE: boolean = true;

    while (ACTIVE) {
        ACTIVE = step_kernel(state, data_buffer, 0);
    }

    lexer.active_token_productions ^= tk_flag;

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

export function add_reduce(state: ParserState, sym_len: number, body: number): void {
    if (is_output_enabled(state.state)) {
        let total = body + sym_len;
        if ((total) == 0)
            return;

        if (body > 0xFF || sym_len > 0x1F) {
            let low = (1 << 2) | (body << 3);
            let high = sym_len;
            state.add_rule(low);
            state.add_rule(high);
        }
        else {
            let low = ((sym_len & 0x1F) << 3) | ((body & 0xFF) << 8);
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
        let skip_delta = state.lexer.byte_offset - state.lexer.prev_byte_offset;
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

function run(process_buffer: ParserStateBuffer,
    invalid_buffer: ParserStateBuffer,
    valid_buffer: ParserStateBuffer,
    prod_id: number): number {
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
