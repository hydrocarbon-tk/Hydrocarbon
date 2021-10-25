use super::lexer::Lexer;
use super::state_buffer::KernelStateBuffer;
const stack_size: usize = 128;

// ///////////////////////////////////////////
// KERNEL STATE
// ///////////////////////////////////////////

pub struct KernelState {
    // 8 byte +
    pub instructions: &'static [u32],
    pub rules: Vec<u16>,
    pub state_stack: [u32; stack_size],
    pub meta_stack: [u32; stack_size],

    pub lexer: Lexer,
    pub origin: *const KernelState,

    // 4 byte
    pub state: u32,
    pub stack_pointer: i32,
    pub origin_fork: u32,
    pub last_byte_offset: u32,
    pub last_token_offset: u32,
    pub last_token_type: i32,

    pub prod: u32,
    pub symbol_accumulator: u32,
    // 1 byte
    pub refs: u8,

    pub VALID: bool,
    pub COMPLETED: bool,
    pub FORKED: bool,
}

impl KernelState {
    pub fn new(
        instructions: *const u32,
        instructions_len: usize,
        input_buffer: *const u8,
        input_len_in: usize,
    ) -> KernelState {
        use std::slice;

        KernelState {
            instructions: unsafe { slice::from_raw_parts(instructions, instructions_len as usize) },
            rules: Vec::with_capacity(512),
            state_stack: [0; stack_size],
            meta_stack: [0; stack_size],

            lexer: Lexer::new(input_buffer, input_len_in),
            origin: std::ptr::null(),

            state: 0xFFFFFFFF,
            stack_pointer: 0,
            origin_fork: 0,
            last_byte_offset: 0,
            last_token_offset: 0,
            last_token_type: 0,

            prod: 0,
            symbol_accumulator: 0,

            VALID: true,
            COMPLETED: false, /*  */
            FORKED: false,
            refs: 0,
        }
    }

    pub fn get_rules_len(&self) -> u32 {
        self.rules.len() as u32
    }

    pub fn push_state(&mut self, kernel_state: u32) {
        self.stack_pointer += 1;
        let sp = self.stack_pointer as usize;

        self.state_stack[sp] = kernel_state;

        self.meta_stack[sp] = (self.meta_stack[sp - 1] & 0xFFFF) | (self.symbol_accumulator as u32);
    }

    pub fn swap_state(&mut self, kernel_state: u32) {
        self.state_stack[self.stack_pointer as usize] = kernel_state;
    }

    pub fn pop_state(&mut self) -> u32 {
        let state = self.read_state();
        self.stack_pointer -= 1;
        return state;
    }

    pub fn read_state(&mut self) -> u32 {
        self.state_stack[self.stack_pointer as usize]
    }

    pub fn copy_state_stack(&self, dest: &mut KernelState) {
        for i in 0..=self.stack_pointer {
            dest.state_stack[i as usize] = self.state_stack[i as usize];
        }
    }

    pub fn copy_production_stack(&self, dest: &mut KernelState, cutoff: i32) {
        for i in 0..=self.stack_pointer {
            dest.meta_stack[i as usize] = self.meta_stack[i as usize];
            if i > self.stack_pointer - (cutoff) {
                dest.state_stack[i as usize] = self.state_stack[i as usize]
            } else {
                dest.state_stack[i as usize] = 0
            }
        }
    }

    pub fn transfer_state_stack(&mut self, new_state: &mut KernelState) {
        self.copy_state_stack(new_state);

        for i in 0..=self.stack_pointer {
            self.state_stack[i as usize] = 0;
        }

        new_state.stack_pointer = self.stack_pointer;

        self.stack_pointer = 0;
    }

    pub fn fork<'a>(
        state: &mut KernelState,
        process_buffer: &'a mut KernelStateBuffer,
    ) -> &'a mut KernelState {
        let mut state_pointer = KernelStateBuffer::get_recycled_kernel_state(process_buffer, state);
        {
            let forked = state_pointer.as_mut();

            state.copy_state_stack(forked);

            //Increment the refs count to prevent the
            //KernelState from being recycled.
            forked.origin = state;
            forked.stack_pointer = state.stack_pointer;
            forked.origin_fork = state.get_rules_len();
            forked.state = state.state;
            forked.symbol_accumulator = state.symbol_accumulator;
            forked.last_byte_offset = state.last_byte_offset;
            forked.last_token_offset = state.last_token_offset;
            forked.VALID = true;

            state.refs += 1;
        }

        let size = process_buffer.data.len();

        return process_buffer.data[(size - 1) as usize].as_mut();
    }

    pub fn add_rule(&mut self, val: u32) {
        self.rules.push(val as u16);
    }

    pub fn add_reduce(&mut self, sym_len: u32, fn_id: u32) {
        if 0 != (self.state & 2) {
            self.symbol_accumulator -= (sym_len - 1) << 16;

            let total = fn_id + sym_len;

            if (total) == 0 {
                return;
            }

            if fn_id > 0xFF || sym_len > 0x1F {
                let low = (1 << 2) | (fn_id << 3);
                let high = sym_len;
                self.add_rule(low);
                self.add_rule(high);
            } else {
                let low = ((sym_len & 0x1F) << 3) | ((fn_id & 0xFF) << 8);
                self.add_rule(low);
            }
        }
    }
    pub fn add_shift(&mut self, tok_len: u32) {
        if tok_len == 0 {
            return;
        }

        if tok_len > 0x1FFF {
            let low = 1 | (1 << 2) | ((tok_len >> 13) & 0xFFF8);
            let high = tok_len & 0xFFFF;
            self.add_rule(low);
            self.add_rule(high);
        } else {
            let low = 1 | ((tok_len << 3) & 0xFFF8);
            self.add_rule(low);
        }
    }
    pub fn add_skip(&mut self, skip_delta: u32) {
        if skip_delta < 1 {
            return;
        }

        if skip_delta > 0x1FFF {
            let low = 2 | (1 << 2) | ((skip_delta >> 13) & 0xFFF8);
            let high = skip_delta & 0xFFFF;
            self.add_rule(low);
            self.add_rule(high);
        } else {
            let low = 2 | ((skip_delta << 3) & 0xFFF8);
            self.add_rule(low);
        }
    }

    pub fn consume(&mut self) {
        let mut l = self.lexer;

        if 0 != (self.state & 2) {
            self.add_skip(l.skip_delta());

            self.add_shift(l.token_length as u32);

            self.symbol_accumulator += 1 << 16;
        }

        l.next();

        l.consume();

        self.lexer = l;
    }

    pub fn get_root_lexer<'a>(&'a mut self) -> &'a mut Lexer {
        return &mut (self.lexer);
    }

    pub fn reset(&mut self) {
        self.rules.clear();
        self.stack_pointer = 0;
    }
}
