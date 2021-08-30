use super::character_lookup_table::CHAR_LU_TABLE;

//*

use std::rc::Rc;

pub type StackFunction = fn(&mut KernelState, &mut KernelStateBuffer, i32) -> i32;

pub fn set_production(arg1: KernelState, arg2: KernelStateBuffer, arg3: i32) -> i32 {
    arg3
}

fn null_fn(a: &mut KernelState, b: &mut KernelStateBuffer, c: i32) -> i32 {
    -1
}

// ///////////////////////////////////////////
// PARSER STATE
// ///////////////////////////////////////////

pub struct KernelState {
    pub lexer_stack: [Lexer; 10],
    pub lexer_pointer: u32,

    pub state_stack: Vec<StackFunction>,
    pub stack_pointer: u32,

    //Grammar specific inputs
    pub tk_scan: (l: Lexer, i: u32, j: u32) -> void,
    pub state_buffer: &[u32]

    // 8 byte +
    rules: Vec<u16>,
    origin: *const KernelState,
    origin_fork: u32,

    // 1 byte
    VALID: bool,
    COMPLETED: bool,
    refs: u8,
}

impl KernelState {
    pub fn new(input_buffer: *const u8, input_len_in: u32) -> KernelState {
        KernelState {
            lexer: Lexer::new(input_buffer, input_len_in),

            stack: Vec::with_capacity(64),
            stash: Vec::with_capacity(64),
            rules: Vec::with_capacity(512),

            origin: std::ptr::null(),

            state: create_state(1),
            origin_fork: 0,
            prod: -1,

            VALID: true,
            COMPLETED: false, /*  */

            refs: 0,
        }
    }
    pub fn sync(&mut self, ptr: &KernelState) {
        return;
    }

    pub fn get_stack_len(&self) -> u32 {
        self.stack.len() as u32
    }

    pub fn get_rules_len(&self) -> u32 {
        self.rules.len() as u32
    }

    pub fn push_fn(&mut self, stack_val: StackFunction, stash_val: i32) {
        self.stack.push(stack_val);
        self.stash.push(stash_val);
    }

    pub fn reset(&mut self, origin: &Lexer, stack_ptr: u32, rules_ptr: u32) {
        unsafe {
            self.rules.set_len(rules_ptr as usize);
            self.stack.set_len(stack_ptr as usize);
            self.stash.set_len(stack_ptr as usize);
        }
        self.lexer.sync(origin);
    }

    pub fn fork<'A>(&mut self, process_buffer: &'A mut KernelStateBuffer) -> &'A mut KernelState {
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
            //KernelState from being recycled.
            self.refs += 1;
            forked_state.origin = &*self;
            forked_state.origin_fork = self.get_rules_len();
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

pub struct KernelStateBuffer {
    data: Vec<Box<KernelState>>,
}

impl KernelStateBuffer {
    pub fn new() -> KernelStateBuffer {
        KernelStateBuffer { data: Vec::new() }
    }

    pub fn len(&self) -> usize {
        self.data.len()
    }

    pub fn create_state<'A>(
        &'A mut self,
        input_buffer: &[u8],
        input_len_in: u32,
    ) -> &'A mut KernelState {
        let data = Box::new(KernelState::new(input_buffer.as_ptr(), input_len_in));

        let index = self.data.len();

        self.data.push(data);

        return self.data[index].as_mut();
    }

    pub fn add_state_pointer(&mut self, data: Box<KernelState>) {
        self.data.push(data);
    }

    pub fn remove_state_at_index(&mut self, index: usize) -> Box<KernelState> {
        return self.data.remove(index);
    }

    pub fn add_state_pointer_and_sort(&mut self, pointer: Box<KernelState>) -> u32 {
        let mut index: usize = 0;

        let data = pointer.as_ref();

        while index < self.data.len() {
            let exist_ref: &mut KernelState = &mut self.data[index];

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

    pub fn remove_valid_parser_state(&mut self) -> Option<Box<KernelState>> {
        if self.have_valid() {
            return Some(self.remove_state_at_index(0));
        }

        return None;
    }

    pub fn get_mut_state(&mut self, index: usize) -> Option<&mut KernelState> {
        if self.len() > index {
            return Some(self.data[index].as_mut());
        }

        return None;
    }

    pub fn get_ref_state(&self, index: usize) -> Option<&KernelState> {
        if self.len() > index {
            return Some(self.data[index].as_ref());
        }

        return None;
    }

    pub fn get_recycled_ParserState(&mut self, state: &KernelState) -> Box<KernelState> {
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
        }

        return Box::new(KernelState::new(
            state.lexer.input.as_ptr(),
            state.lexer.input.len() as u32,
        ));
    }
}

// ///////////////////////////////////////////
// PARSER STATE ITERATOR
// ///////////////////////////////////////////

use std::iter::Iterator;

pub struct ParserStateIterator<'A> {
    current: Option<&'A KernelState>,
    refs: Vec<&'A KernelState>,
    index: usize,
    limit: usize,
}

impl ParserStateIterator<'_> {
    pub fn new<'A>(state: &'A KernelState) -> ParserStateIterator {
        let mut active = state;
        let mut vector: Vec<&'A KernelState> = Vec::new();

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


pub fn create_state(ENABLE_STACK_OUTPUT: u32) -> u32 {
    1 | (ENABLE_STACK_OUTPUT << 1)
}

pub fn token_production(
    lexer: &mut Lexer,
    production: StackFunction,
    pid: i32,
    _type: i32,
    tk_flag: u32,
) -> bool {
    if lexer._type == _type {
        return true;
    }

    if (lexer.active_token_productions & tk_flag) > 0 {
        return false;
    }

    lexer.active_token_productions |= tk_flag;

    let mut data_buffer: KernelStateBuffer = KernelStateBuffer::new();
    let mut token_state = KernelState::new(lexer.input.as_ptr(), lexer.input.len() as u32);

    token_state.lexer.sync(lexer);
    token_state.push_fn(production, 0);
    token_state.state = 0;

    let mut ACTIVE: bool = true;

    while ACTIVE {
        ACTIVE = step_kernel(&mut token_state, &mut data_buffer, 0);
    }

    lexer.active_token_productions ^= tk_flag;

    if token_state.prod == pid {
        lexer.set_token_span_to(&token_state.lexer);
        lexer._type = _type;
        return true;
    }

    false
}

pub fn compare(
    lexer: &mut Lexer,
    data_offset: u32,
    sequence_offset: u32,
    byte_length: u32,
    sequence: &[u8],
) -> u32 {
    let mut i: usize = data_offset as usize;
    let mut j: usize = sequence_offset as usize;
    let len: usize = j + byte_length as usize;

    while j < len {
        if lexer.get_byte_at(i) != sequence[j] {
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

pub fn add_reduce(state: &mut KernelState, sym_len: u32, body: u32) {
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

pub fn add_shift(state: &mut KernelState, tok_len: u32) {
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

pub fn add_skip(state: &mut KernelState, skip_delta: u32) {
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

pub fn consume(state: &mut KernelState) -> bool {
    if is_output_enabled(state.state) {
        let skip_delta = state.lexer.byte_offset - state.lexer.prev_byte_offset;
        add_skip(state, skip_delta);
        add_shift(state, state.lexer.token_length as u32);
    };

    state.lexer.prev_byte_offset = state.lexer.byte_offset + state.lexer.byte_length as u32;
    state.lexer.prev_token_offset = state.lexer.token_offset + state.lexer.token_length as u32;

    state.lexer.next();

    return true;
}

// ///////////////////////////////////////////////////////////////////////////////////////
// Kernel Code
// ///////////////////////////////////////////////////////////////////////////////////////
// /source/grammar/typescript/runtime/core-parser.ts for documentation
pub fn kernel_executor(
    &mut kernel_state: KernelState,
    &mut kernel_states: KernelStateBuffer,
) -> (bool, u32) {
    let mut fail_mode: bool = false;
    let mut prod: u32 = 0;
    let mut last_good_state: u32 = 0;

    loop {
        let i = 0;

        while i < 4 {

            i += 1;

            let state: u32 = kernel_state.state_stack[kernel_state.stack_pointer];

            kernel_state.stack_pointer -= 1;

            let state_pointer

            if state > 0 {

                if !fail_mode {

                    (failed, production) = state_executor(
                        state_pointer,
                        prod,
                        kernel_state,
                        kernel_states
                    )

                    fail_mode = failed;
                    prod = production;
                }
            }
        }

        if kernel_state.state_pointer < 1 {
            break;
        }
    }

    (fail_mode, last_good_state)
}

fn state_executor(
    state_pointer: u32,
    mut prod: u32,
    &mut kernel_state: KernelState,
    &mut kernel_states: KernelStateBuffer,
) -> (bool, u32) {

    let mut fail_mode = false;

    let alpha = kernel_state.state_buffer[state_pointer];
    let beta = kernel_state.state_buffer[state_pointer + 1];
    let gamma = kernel_state.state_buffer[state_pointer + 2];
    let delta = kernel_state.state_buffer[state_pointer + 3];

    const increment_state_pointer_mask = 1;

    let previous_state = kernel_state.state_stack[kernel_state.stack_pointer];

    kernel_state.state_stack[kernel_state.stack_pointer + 1] = beta;

    const failure_bit = (alpha & increment_stack_pointer_mask) & (((previous_state ^ beta) > 0) as u32);

    kernel_state.stack_pointer += failure_bit;

    // ----------

    let process_type = alpha >> 8;

    let &mut lexer = kernel_state.lexer_stack[kernel_state.lexer_pointer];

    match process_type & 0xF {
        0 => { return (true, prod);}
        1=>{
            ({ fail_mode, prod } = instruction_executor(
                state_pointer + 4,
                prod,
                lexer,
                kernel_state,
                kernel_states
            ));
        }
        2=>{

        }
        4=>{/* Scanner not implemented */return (true, prod);}

    };

    (fail_mode, prod)
}

fn instruction_executor(
    index: u32,
    mut prod: u32,
    &mut kernel_state: KernelState,
    &mut kernel_states: KernelStateBuffer,
) -> (bool, u32) {
    loop {
        let instruction = kernel_state.state_buffer[index];

        match (instruction >> 28) & 0xF {
            0 => {return (false, prod);}
            1 => { consume(kernel_state) }
            2 => {
                kernel_state.state_stack[kernel_state.stack_pointer + 1] = instruction;
                kernel_state.stack_pointer += 1;
            }
            3 => {
                prod = instruction & 0xFFFFFFF;
            }
            4 => {
                let length = (instruction & 0xFFFFFFF) - 1;

                kernel_state.state_stack[kernel_state.stack_pointer + 1] = kernel_state.state_buffer[index];

                index += 1;

                while length > 0 {

                    fork(kernel_state.state_buffer[index], kernel_state, kernel_states);
                    //fork
                    length -= 1;
                    index += 1;
                }

                kernel_state.stack_pointer += 1
            }
            5 => {}
            6 => {}
            7 => {
                kernel_state.stack_pointer -= (instruction & 0xFFFFFFF);
            }
            8 => {
                const high = (instruction >> 16) & 0xFFFF;
                const low = (instruction) & 0xFFFF;

                kernel_state.add_rule(low);
                
                if ((low & 0x4) == 0x4)
                    kernel_state.add_rule(high & 0xFFF);
            }
            9 => {
                kernel_state.stack_pointer += 1;
            }
            10 => {return (true, prod);}
            11 => {return (true, prod);}
            12 => {return (true, prod);}
            13 => {return (true, prod);}
            14 => {return (true, prod);}
            15 => {return (true, prod);}
        }
    };
    (true, prod)
}

fn run(
    process_buffer: &mut KernelStateBuffer,
    invalid_buffer: &mut KernelStateBuffer,
    valid_buffer: &mut KernelStateBuffer,
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
            match invalid_buffer.remove_valid_parser_state() {
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

    let state = process_buffer.create_state(input_buffer, input_byte_length);

    state.push_fn(state_function, 0);

    state.lexer.next();

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
        state: &mut KernelState,
        buffer: &mut KernelStateBuffer,
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
        data: &mut KernelState,
        buffer: &mut KernelStateBuffer,
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
        data: &mut KernelState,
        buffer: &mut KernelStateBuffer,
        prop: i32,
        cache: i32,
    ) -> i32 {
        if data.lexer.current_byte == 32 {
            return 0;
        }
        -1
    }

    fn testFNDest2(
        data: &mut KernelState,
        buffer: &mut KernelStateBuffer,
        prop: i32,
        cache: i32,
    ) -> i32 {
        if data.lexer.current_byte == 32 {
            return 0;
        }
        -1
    }

    fn testFNDest3(
        data: &mut KernelState,
        buffer: &mut KernelStateBuffer,
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
