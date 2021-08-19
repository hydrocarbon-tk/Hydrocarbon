use super::character_lookup_table::CHAR_LU_TABLE;

//*

use std::rc::Rc;

pub type StackFunction = fn(&mut ParserState, &mut ParserStateBuffer, i32) -> i32;

pub fn set_production(arg1: ParserState, arg2: ParserStateBuffer, arg3: i32) -> i32 {
    arg3
}

fn null_fn(a: &mut ParserState, b: &mut ParserStateBuffer, c: i32) -> i32 {
    -1
}

// ///////////////////////////////////////////
// PARSER STATE
// ///////////////////////////////////////////

pub struct ParserState {
    pub lexer: Lexer,
    // 8 byte +
    rules: Vec<u16>,
    stash: Vec<i32>,
    stack: Vec<StackFunction>,
    origin: *const ParserState,
    input: *const u8,
    // 4 byte
    pub state: u32,
    active_token_productions: u32,
    origin_fork: u32,
    input_len: u32,
    prod: i32,
    // 1 byte
    VALID: bool,
    COMPLETED: bool,
    refs: u8,
}

impl ParserState {
    pub fn new(input_buffer: *const u8, input_len_in: u32) -> ParserState {
        ParserState {
            lexer: Lexer::new(),

            stack: Vec::with_capacity(64),
            stash: Vec::with_capacity(64),
            rules: Vec::with_capacity(512),

            origin: std::ptr::null(),

            input: input_buffer,

            state: create_state(1),
            input_len: input_len_in,
            active_token_productions: 0,
            origin_fork: 0,
            VALID: true,
            COMPLETED: false, /*  */
            prod: -1,

            refs: 0,
        }
    }
    pub fn sync(&mut self, ptr: &ParserState) {
        return;
    }

    pub fn get_stack_len(&self) -> u32 {
        self.stack.len() as u32
    }

    pub fn get_rules_len(&self) -> u32 {
        self.rules.len() as u32
    }

    pub fn get_input_len(&self) -> u32 {
        self.input_len
    }

    pub fn push_fn(&mut self, stack_val: StackFunction, stash_val: i32) {
        self.stack.push(stack_val);
        self.stash.push(stash_val);
    }

    pub fn get_input_array<'a>(&self) -> &'a [u8] {
        use std::slice;

        let u8_slice: &'a [u8] =
            unsafe { slice::from_raw_parts(self.input, self.input_len as usize) };

        u8_slice
    }

    pub fn get_byte_from_input(&self, index: u32) -> u8 {
        unsafe { *self.input.offset(index as isize) as u8 }
    }

    pub fn reset(&mut self, origin: &Lexer, stack_ptr: u32, rules_ptr: u32) {
        unsafe {
            self.rules.set_len(rules_ptr as usize);
            self.stack.set_len(stack_ptr as usize);
            self.stash.set_len(stack_ptr as usize);
        }
        self.lexer.sync(origin);
    }

    pub fn fork<'A>(&mut self, process_buffer: &'A mut ParserStateBuffer) -> &'A mut ParserState {
        let mut state_pointer = process_buffer.get_recycled_ParserState(self);
        {
            let forked_state = state_pointer.as_mut();

            let mut i: usize = 0;

            if self.get_stack_len() > 0 {
                let len = self.get_stack_len() as usize;
                while i < len {
                    forked_state.stash.push(self.stash[i]);
                    forked_state.stack.push(self.stack[i]);
                    i += 1;
                }
            }

            //Increment the refs count to prevent the
            //ParserState from being recycled.
            self.refs += 1;
            forked_state.origin = &*self;
            forked_state.origin_fork = self.get_rules_len();
            forked_state.active_token_productions = self.active_token_productions;
            forked_state.lexer.sync(&self.lexer);
            forked_state.state = self.state;
            forked_state.prod = self.prod;
            forked_state.VALID = true;
        }

        process_buffer.add_state_pointer(state_pointer);

        let size = process_buffer.data.len();

        return process_buffer.data[(size - 1) as usize].as_mut();
    }

    pub fn add_rule(&mut self, val: u32) {
        self.rules.push(val as u16);
    }
}

// ///////////////////////////////////////////
// PARSER STATE BUFFER
// ///////////////////////////////////////////

pub struct ParserStateBuffer {
    data: Vec<Box<ParserState>>,
}

impl ParserStateBuffer {
    pub fn new() -> ParserStateBuffer {
        ParserStateBuffer { data: Vec::new() }
    }

    pub fn len(&self) -> usize {
        self.data.len()
    }

    pub fn create_data<'A>(
        &'A mut self,
        input_buffer: &[u8],
        input_len_in: u32,
    ) -> &'A mut ParserState {
        let data = Box::new(ParserState::new(input_buffer.as_ptr(), input_len_in));

        let index = self.data.len();

        self.data.push(data);

        return self.data[index].as_mut();
    }

    pub fn add_state_pointer(&mut self, data: Box<ParserState>) {
        self.data.push(data);
    }

    pub fn remove_state_at_index(&mut self, index: usize) -> Box<ParserState> {
        return self.data.remove(index);
    }

    pub fn add_state_pointer_and_sort(&mut self, pointer: Box<ParserState>) -> u32 {
        let mut index: usize = 0;

        let data = pointer.as_ref();

        while index < self.data.len() {
            let exist_ref: &mut ParserState = &mut self.data[index];

            if data.VALID && (!exist_ref.VALID) {
                break;
            } else {
                if exist_ref.lexer.byte_offset < data.lexer.byte_offset {
                    break;
                }
            };
            index += 1;
        }

        self.data.insert(index, pointer);

        return self.data.len() as u32;
    }

    pub fn have_valid(&self) -> bool {
        self.len() > 0 && self.data[0].as_ref().VALID
    }

    pub fn get_valid_parser_state(&mut self) -> Option<Box<ParserState>> {
        if self.have_valid() {
            return Some(self.remove_state_at_index(0));
        }

        return None;
    }

    pub fn get_mut_state(&mut self, index: usize) -> Option<&mut ParserState> {
        if self.len() > index {
            return Some(self.data[index].as_mut());
        }

        return None;
    }

    pub fn get_ref_state(&self, index: usize) -> Option<&ParserState> {
        if self.len() > index {
            return Some(self.data[index].as_ref());
        }

        return None;
    }

    pub fn get_recycled_ParserState(&mut self, state: &ParserState) -> Box<ParserState> {
        if self.len() > 0 {
            let mut i: usize = 0;

            while i < self.len() {
                let a = self.data[i].as_ref();
                if !a.VALID && a.refs < 1 {
                    let mut invalid_ptr = self.remove_state_at_index(i);

                    let mut invalid_state = invalid_ptr.as_mut();

                    invalid_state.rules.clear();

                    return invalid_ptr;
                }
                i += 1;
            }
        } else {
        }

        return Box::new(ParserState::new(state.input, state.input_len));
    }
}

/////////////////////////////////////////////
// PARSER STATE ITERATOR
/////////////////////////////////////////////

use std::iter::Iterator;

pub struct ParserStateIterator<'A> {
    current: Option<&'A ParserState>,
    refs: Vec<&'A ParserState>,
    index: usize,
    limit: usize,
}

impl ParserStateIterator<'_> {
    pub fn new<'A>(state: &'A ParserState) -> ParserStateIterator {
        let mut active = state;
        let mut vector: Vec<&'A ParserState> = Vec::new();

        vector.push(state);

        unsafe {
            while let Some(a) = active.origin.as_ref() {
                vector.push(a);
                active = a;
            }
        }

        let last = vector.pop();

        return ParserStateIterator {
            limit: if let Some(a) = vector.last() {
                a.origin_fork as usize
            } else if let Some(a) = last {
                a.get_rules_len() as usize
            } else {
                0
            },
            index: 0,
            refs: vector,
            current: last,
        };
    }
}

impl Iterator for ParserStateIterator<'_> {
    type Item = u16;

    fn next(&mut self) -> Option<Self::Item> {
        if let Some(current) = self.current {
            if self.index >= self.limit {
                if let Some(next) = self.refs.pop() {
                    self.index = 0;
                    self.limit = if let Some(a) = self.refs.last() {
                        a.origin_fork as usize
                    } else {
                        next.get_rules_len() as usize
                    };
                    self.current = Some(next);
                } else {
                    return None;
                }

                return Self::next(self);
            }

            let val = current.rules[self.index];

            self.index += 1;

            return Some(val);
        }

        None
    }
}

/////////////////////////////////////////////
// LEXER
/////////////////////////////////////////////

#[derive(Debug)]
pub struct Lexer {
    pub byte_offset: u32,
    pub token_offset: u32,
    pub token_length: u16,
    pub byte_length: u16,
    pub prev_byte_offset: u32,
    pub line: u16,
    pub _type: i32,
    pub current_byte: u8,
}

impl Lexer {
    pub fn new() -> Lexer {
        Lexer {
            byte_offset: 0,
            token_offset: 0,
            byte_length: 0,
            token_length: 0,
            prev_byte_offset: 0,
            _type: 0,
            line: 0,
            current_byte: 0,
        }
    }

    pub fn setToken(&mut self, type_in: i32, byte_length_in: u32, token_length_in: u32) -> i32 {
        self._type = type_in;
        self.byte_length = byte_length_in as u16;
        self.token_length = token_length_in as u16;
        return type_in;
    }
    pub fn getType(&mut self, input: &[u8], USE_UNICODE: bool) -> i32 {
        let mut _type: i32 = self._type;

        if self.END(input.len()) {
            return 1;
        }

        if (_type) == 0 {
            if !USE_UNICODE || self.current_byte < 128 {
                _type = get_type_at(self.current_byte as u32);
            } else {
                {
                    let code_point: u32 = utf8_to_code_point(self.byte_offset as usize, input);

                    self.byte_length = get_utf8_byte_length_from_code_point(code_point) as u16;

                    _type = get_type_at(code_point);
                }
            };
        }
        _type
    }

    pub fn isSym(&mut self, input: &[u8], USE_UNICODE: bool) -> bool {
        if (self._type) == 0 && self.getType(input, USE_UNICODE) == 2 {
            self._type = 2;
        };
        return (self._type) == 2;
    }

    pub fn isNL(&mut self) -> bool {
        if (self._type) == 0 && (self.current_byte) == 10 || (self.current_byte) == 13 {
            self._type = 7;
        };
        return (self._type) == 7;
    }

    pub fn isSP(&mut self, USE_UNICODE: bool) -> bool {
        if (self._type) == 0 && (self.current_byte) == 32 {
            self._type = 8;
        };
        return (self._type) == 8;
    }

    pub fn isNum(&mut self, input: &[u8]) -> bool {
        if (self._type) == 0 {
            if self.getType(input, false) == 5 {
                let l: usize = input.len() as usize;

                let mut off: usize = self.byte_offset as usize;

                while off < l {
                    off += 1;
                    if (48 > input[off]) || (input[off] > 57) {
                        break;
                    };
                    self.byte_length += 1;
                    self.token_length += 1;
                }
                self._type = 5;
                return true;
            } else {
                return false;
            };
        } else {
            return (self._type) == 5;
        };
    }

    pub fn isUniID(&mut self, input: &[u8]) -> bool {
        if (self._type) == 0 {
            if self.getType(input, true) == 3 {
                let l: usize = input.len() as usize;

                let off: usize = self.byte_offset as usize;

                let mut prev_byte_len: usize = self.byte_length as usize;

                while (off + self.byte_length as usize) < l {
                    let code_point = utf8_to_code_point(
                        (self.byte_offset as u32 + self.byte_length as u32) as usize,
                        input,
                    );

                    if ((96) & CHAR_LU_TABLE[code_point as usize]) > 0 {
                        self.byte_length += get_utf8_byte_length_from_code_point(code_point) as u16;
                        prev_byte_len = self.byte_length as usize;
                        self.token_length += 1;
                    } else {
                        {
                            break;
                        }
                    };
                }
                self.byte_length = prev_byte_len as u16;
                self._type = 3;
                return true;
            } else {
                return false;
            };
        } else {
            return (self._type) == 3;
        }
    }

    pub fn copyInPlace(&self) -> Lexer {
        let mut destination: Lexer = Lexer::new();
        destination._type = self._type;
        destination.byte_offset = self.byte_offset;
        destination.byte_length = self.byte_length;
        destination.token_length = self.token_length;
        destination.token_offset = self.token_offset;
        destination.prev_byte_offset = self.prev_byte_offset;
        destination.line = self.line;
        destination.byte_length = self.byte_length;
        destination.current_byte = self.current_byte;
        return destination;
    }
    pub fn sync(&mut self, source: &Lexer) -> &mut Lexer {
        self.byte_offset = source.byte_offset;
        self.byte_length = source.byte_length;
        self.token_length = source.token_length;
        self.token_offset = source.token_offset;
        self.prev_byte_offset = source.prev_byte_offset;
        self.line = source.line;
        self._type = source._type;
        self.current_byte = source.current_byte;
        return self;
    }
    pub fn slice(&mut self, source: &Lexer) -> &mut Lexer {
        self.byte_length = (self.byte_offset - source.byte_offset) as u16;
        self.token_length = (self.token_offset - source.token_offset) as u16;
        self.byte_offset = source.byte_offset;
        self.token_offset = source.token_offset;
        self.current_byte = source.current_byte;
        self.line = source.line;
        self._type = source._type;
        return self;
    }
    pub fn next(&mut self, input: &[u8]) -> &mut Lexer {
        self.byte_offset += self.byte_length as u32;
        self.token_offset += self.token_length as u32;
        if input.len() <= self.byte_offset as usize {
            self._type = 1;
            self.byte_length = 0;
            self.token_length = 0;
            self.current_byte = 0;
        } else {
            {
                self.current_byte = input[self.byte_offset as usize];
                if (self.current_byte) == 10 {
                    self.line += 1
                };
                self._type = 0;
                self.byte_length = 1;
                self.token_length = 1;
            }
        };
        return self;
    }
    pub fn END(&mut self, input_len: usize) -> bool {
        return self.byte_offset as usize >= input_len;
    }
}

/////////////////////////////////////////////
// OTHER FUNCTIONS
/////////////////////////////////////////////

fn get_utf8_byte_length_from_code_point(code_point: u32) -> u8 {
    if (code_point) == 0 {
        return 1;
    } else if (code_point & 0x7F) == code_point {
        return 1;
    } else if (code_point & 0x7FF) == code_point {
        return 2;
    } else if (code_point & 0xFFFF) == code_point {
        return 3;
    } else {
        return 4;
    }
}

fn utf8_to_code_point(index: usize, buffer: &[u8]) -> u32 {
    let a: u32 = buffer[index] as u32;

    if a & 0x80 > 0 {
        let flag = a & 0xF0;

        let b: u32 = buffer[index + 1] as u32;

        if flag & 0xE0 > 0 {
            let flag = a & 0xF8;

            let c: u32 = buffer[index + 2] as u32;

            if (flag) == 0xF0 {
                return ((a & 0x7) << 18)
                    | ((b & 0x3F) << 12)
                    | ((c & 0x3F) << 6)
                    | (buffer[index + 3] as u32 & 0x3F);
            } else {
                if (flag) == 0xE0 {
                    return ((a & 0xF) << 12) | ((b & 0x3F) << 6) | (c & 0x3F);
                }
            };
        } else {
            if (flag) == 0xC {
                return ((a & 0x1F) << 6) | b & 0x3F;
            }
        };
    } else {
        return a;
    };

    0
}

fn get_type_at(code_point: u32) -> i32 {
    (CHAR_LU_TABLE[code_point as usize] & 0x1F) as i32
}

pub fn create_state(ENABLE_STACK_OUTPUT: u32) -> u32 {
    1 | (ENABLE_STACK_OUTPUT << 1)
}

pub fn token_production(
    mut state: &mut ParserState,
    production: StackFunction,
    pid: i32,
    _type: i32,
    tk_flag: u32,
) -> bool {
    let l: &Lexer = &state.lexer;

    if l._type == _type {
        return true;
    }

    if (state.active_token_productions & tk_flag) > 0 {
        return false;
    }

    state.active_token_productions |= tk_flag;

    let stack_ptr: u32 = state.get_stack_len();
    let rules_ptr: u32 = state.get_rules_len();
    let state_cache: u32 = state.state;

    let copy = state.lexer.copyInPlace();

    let mut data_buffer: ParserStateBuffer = ParserStateBuffer::new();

    let mut ACTIVE: bool = true;

    state.push_fn(production, 0);

    state.state = 0;

    while ACTIVE {
        ACTIVE = step_kernel(state, &mut data_buffer, stack_ptr);
    }

    state.state = state_cache;

    state.active_token_productions ^= tk_flag;

    if state.prod == pid {
        unsafe {
            state.stack.set_len(stack_ptr as usize);
            state.stash.set_len(stack_ptr as usize);
        }
        state.lexer.slice(&copy);
        state.lexer._type = _type;
        return true;
    } else {
        state.reset(&copy, stack_ptr, rules_ptr);
    }

    false
}
pub fn compare(
    state: &mut ParserState,
    data_offset: u32,
    sequence_offset: u32,
    byte_length: u32,
    sequence: &[u8],
) -> u32 {
    let mut i: usize = data_offset as usize;
    let mut j: usize = sequence_offset as usize;
    let len: usize = j + byte_length as usize;

    while j < len {
        if unsafe { *state.input.offset(i as isize) } != sequence[j] {
            return j as u32 - sequence_offset;
        };
        j += 1;
        i += 1;
    }

    return byte_length;
}

pub fn is_output_enabled(state: u32) -> bool {
    return 0 != (state & 2);
}

pub fn add_reduce(state: &mut ParserState, sym_len: u32, body: u32) {
    if is_output_enabled(state.state) {
        let total: u32 = body + sym_len;
        if (total) == 0 {
            return;
        }
        if body > 0xFF || sym_len > 0x1F {
            let low: u32 = (1 << 2) | (body << 3);
            let high: u32 = sym_len;
            state.add_rule(low);
            state.add_rule(high);
        } else {
            let low: u32 = ((sym_len & 0x1F) << 3) | ((body & 0xFF) << 8);
            state.add_rule(low);
        }
    };
}
pub fn add_shift(state: &mut ParserState, tok_len: u32) {
    if tok_len > 0x1FFF {
        let low: u32 = 1 | (1 << 2) | ((tok_len >> 13) & 0xFFF8);
        let high: u32 = tok_len & 0xFFFF;
        state.add_rule(low);
        state.add_rule(high);
    } else {
        let low: u32 = 1 | ((tok_len << 3) & 0xFFF8);
        state.add_rule(low);
    };
}
pub fn add_skip(state: &mut ParserState, skip_delta: u32) {
    if skip_delta < 1 {
        return;
    };
    if skip_delta > 0x1FFF {
        let low: u32 = 2 | (1 << 2) | ((skip_delta >> 13) & 0xFFF8);
        let high: u32 = skip_delta & 0xFFFF;

        state.add_rule(low);
        state.add_rule(high);
    } else {
        let low: u32 = 2 | ((skip_delta << 3) & 0xFFF8);
        state.add_rule(low);
    };
}

pub fn consume(state: &mut ParserState) -> bool {
    state.lexer.prev_byte_offset = state.lexer.byte_offset + state.lexer.byte_length as u32;

    if is_output_enabled(state.state) {
        add_shift(state, state.lexer.token_length as u32)
    };

    state.lexer.next(state.get_input_array());

    return true;
}

fn step_kernel(state: &mut ParserState, data_buffer: &mut ParserStateBuffer, base: u32) -> bool {
    if state.get_stack_len() > base {
        if let Some(_fn) = state.stack.pop() {
            if let Some(stash) = state.stash.pop() {
                state.prod = _fn(state, data_buffer, stash);

                if state.prod < 0 {
                    return false;
                };

                return true;
            }
        }
    }

    return false;
}
fn run(
    process_buffer: &mut ParserStateBuffer,
    invalid_buffer: &mut ParserStateBuffer,
    valid_buffer: &mut ParserStateBuffer,
    prod_id: i32,
) -> u32 {
    while process_buffer.len() > 0 {
        let mut i: usize = 0;

        while i < process_buffer.len() {
            let state = process_buffer.data[i].as_mut();

            if !step_kernel(state, invalid_buffer, 0) {
                state.COMPLETED = true;

                state.VALID = state.prod == prod_id;

                match state.VALID {
                    true => {
                        valid_buffer
                            .add_state_pointer_and_sort(process_buffer.remove_state_at_index(i));
                    }
                    false => {
                        invalid_buffer
                            .add_state_pointer_and_sort(process_buffer.remove_state_at_index(i));
                    }
                }
            } else {
                i += 1;
            }
        }

        while invalid_buffer.have_valid() {
            match invalid_buffer.get_valid_parser_state() {
                Some(x) => process_buffer.add_state_pointer(x),
                None => (),
            }
        }
    }
    return valid_buffer.len() as u32;
}

pub fn recognize<'a>(
    input_buffer: &'a [u8],
    input_byte_length: u32,
    production: i32,
    state_function: StackFunction,
) -> (ParserStateBuffer, ParserStateBuffer) {
    let mut process_buffer = ParserStateBuffer::new();
    let mut invalid_buffer = ParserStateBuffer::new();
    let mut valid_buffer = ParserStateBuffer::new();

    let state = process_buffer.create_data(input_buffer, input_byte_length);

    state.push_fn(state_function, 0);

    state.lexer.next(state.get_input_array());

    run(
        &mut process_buffer,
        &mut invalid_buffer,
        &mut valid_buffer,
        production,
    );

    return (valid_buffer, invalid_buffer);
}
//*/
#[cfg(test)]
mod recognizer_test {

    use super::*;

    fn testFN(
        state: &mut ParserState,
        buffer: &mut ParserStateBuffer,
        prop: i32,
        cache: i32,
    ) -> i32 {
        if state.lexer.current_byte == 32 {
            return 0;
        }
        -1
    }

    #[test]
    fn it_should_complete_a_parse_run() {
        let mut r: [u8; 1] = [32];

        let (passed, failed) = recognize(&r[..], 1, 5, testFN);

        assert_eq!(passed.len(), 1);
        assert_eq!(failed.len(), 0);

        let mut r: [u8; 1] = [28];

        let (passed, failed) = recognize(&r[..], 1, 5, testFN);

        assert_eq!(passed.len(), 0);
        assert_eq!(failed.len(), 1);
    }

    fn testFNForked(
        data: &mut ParserState,
        buffer: &mut ParserStateBuffer,
        prop: i32,
        cache: i32,
    ) -> i32 {
        {
            let forkA = data.fork(buffer);

            forkA.push_fn(testFNDest1, 2);
        }
        {
            let forkB = data.fork(buffer);

            forkB.push_fn(testFNDest2, 2);
        }
        {
            let forkC = data.fork(buffer);

            forkC.push_fn(testFNDest3, 2);
        }

        -1
    }

    fn testFNDest1(
        data: &mut ParserState,
        buffer: &mut ParserStateBuffer,
        prop: i32,
        cache: i32,
    ) -> i32 {
        if data.lexer.current_byte == 32 {
            return 0;
        }
        -1
    }

    fn testFNDest2(
        data: &mut ParserState,
        buffer: &mut ParserStateBuffer,
        prop: i32,
        cache: i32,
    ) -> i32 {
        if data.lexer.current_byte == 32 {
            return 0;
        }
        -1
    }

    fn testFNDest3(
        data: &mut ParserState,
        buffer: &mut ParserStateBuffer,
        prop: i32,
        cache: i32,
    ) -> i32 {
        if data.lexer.current_byte == 8 {
            return 0;
        }
        -1
    }

    #[test]
    fn it_should_complete_a_forked_parse_run() {
        let mut r: [u8; 1] = [32];

        let (passed, failed) = recognize(&r[..], 1, 5, 0, testFNForked);

        assert_eq!(passed.len(), 2);
        assert_eq!(failed.len(), 2);
    }
}
