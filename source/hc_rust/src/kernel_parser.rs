use super::lexer::*;
//*

//Global Constants
const state_index_mask: u32 = (1 << 16) - 1;
const acc_sym_mask: u32 = ((1 << 27) - 1) ^ ((1 << 16) - 1);
const fail_state_mask: u32 = 1 << 27;
const alpha_increment_stack_pointer_mask: u32 = 1 << 0;
const alpha_have_default_action_mask: u32 = 1 << 1;
const alpha_auto_accept_with_peek_mask: u32 = 1 << 2;
const alpha_auto_consume_with_peek_mask: u32 = 1 << 3;

pub type ScannerFunction = fn(&mut Lexer, u32, u32) -> ();

// ///////////////////////////////////////////
// KERNEL STATE BUFFER
// ///////////////////////////////////////////

pub struct KernelState {
    state_stack: [u32; 128],
    lexer_stack: [Lexer; 10],

    tk_scan: ScannerFunction,
    state_buffer: &'static [u32],

    lexer_pointer: usize,
    stack_pointer: usize,

    // 8 byte +
    rules: Vec<u16>,
    origin: *const KernelState,

    // 4 byte
    state: u32,
    origin_fork: u32,
    symbol_accumulator: i32,

    // 1 byte
    VALID: bool,
    COMPLETED: bool,
    refs: u8,
}

impl KernelState {
    pub fn new(
        state_buffer: *const u32,
        state_buffer_len: usize,
        input_buffer: *const u8,
        input_len_in: usize,
        tk_scan: ScannerFunction,
    ) -> KernelState {
        use std::slice;

        KernelState {
            state_stack: [0; 128],
            lexer_stack: [Lexer::new(input_buffer, input_len_in); 10],
            tk_scan,
            state_buffer: unsafe { slice::from_raw_parts(state_buffer, state_buffer_len as usize) },
            lexer_pointer: 0,
            stack_pointer: 1,
            rules: Vec::with_capacity(512),
            origin: std::ptr::null(),
            state: 0xFFFFFFFF,
            origin_fork: 0,
            VALID: true,
            COMPLETED: false, /*  */
            refs: 0,
            symbol_accumulator: 0,
        }
    }

    pub fn clone_new(&self) -> KernelState {
        let state_buffer = self.state_buffer.as_ptr();
        let state_buffer_len = self.state_buffer.len();
        let input_buffer = self.lexer_stack[0].input.as_ptr();
        let input_len_in = self.lexer_stack[0].input.len();
        let tk_scan = self.tk_scan;

        KernelState::new(
            state_buffer,
            state_buffer_len,
            input_buffer,
            input_len_in,
            tk_scan,
        )
    }

    pub fn get_rules_len(&self) -> u32 {
        self.rules.len() as u32
    }

    pub fn fork<'a>(
        buffer: &mut KernelState,
        process_buffer: &'a mut KernelStateBuffer,
    ) -> &'a mut KernelState {
        let mut state_pointer =
            KernelStateBuffer::get_recycled_kernel_state(process_buffer, buffer);
        {
            let forked_state = state_pointer.as_mut();

            for i in 0..10 {
                forked_state.lexer_stack[i].sync(&buffer.lexer_stack[i]);
            }

            for i in 0..=buffer.stack_pointer {
                forked_state.state_stack[i] = buffer.state_stack[i];
            }

            //Increment the refs count to prevent the
            //KernelState from being recycled.
            forked_state.origin = buffer;
            forked_state.stack_pointer = buffer.stack_pointer;
            forked_state.lexer_pointer = buffer.lexer_pointer;
            forked_state.origin_fork = buffer.get_rules_len();
            forked_state.state = buffer.state;
            forked_state.VALID = true;

            buffer.refs += 1;
        }

        let size = process_buffer.data.len();

        return process_buffer.data[(size - 1) as usize].as_mut();
    }
    pub fn add_rule(&mut self, val: u32) {
        self.rules.push(val as u16);
    }

    pub fn add_reduce(&mut self, sym_len: u32, fn_id: u32) {
        if 0 != (self.state & 2) {
            let total = fn_id + sym_len;

            if (total) == 0 {
                return;
            }

            self.symbol_accumulator -= (sym_len as i32 - 1) << 16;

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
        if tok_len <= 0 {
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

    pub fn get_root_lexer(&self) -> &Lexer {
        &self.lexer_stack[0]
    }

    pub fn consume(&mut self, lexer_pointer: usize) {
        let mut l = self.lexer_stack[lexer_pointer];

        if 0 != (self.state & 2) {
            let skip_delta = l.token_offset - l.prev_token_offset;

            self.add_skip(skip_delta);

            self.add_shift(l.token_length as u32);
        }

        l.prev_byte_offset = l.byte_offset + l.byte_length as u32;
        l.prev_token_offset = l.token_offset + l.token_length as u32;
        l.next();

        self.lexer_stack[lexer_pointer] = l;
    }
}
// ///////////////////////////////////////////
// KERNEL STATE BUFFER
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

    pub fn create_state(
        buffer: &mut KernelStateBuffer,
        state_buffer: *const u32,
        state_buffer_len: usize,
        input_buffer: *const u8,
        input_len_in: usize,
        tk_scan: ScannerFunction,
    ) -> &mut KernelState {
        let data: Box<KernelState> = Box::new(KernelState::new(
            state_buffer,
            state_buffer_len,
            input_buffer,
            input_len_in,
            tk_scan,
        ));

        let index = buffer.data.len();

        buffer.data.push(data);

        return buffer.data[index].as_mut();
    }

    pub fn add_state_pointer(buffer: &mut KernelStateBuffer, data: Box<KernelState>) {
        buffer.data.push(data);
    }

    pub fn remove_state_at_index(&mut self, index: usize) -> Box<KernelState> {
        return self.data.remove(index);
    }

    pub fn add_state_pointer_and_sort(
        buffer: &mut KernelStateBuffer,
        pointer: Box<KernelState>,
    ) -> u32 {
        let mut index: usize = 0;

        let data = pointer.as_ref();

        while index < buffer.data.len() {
            let exist_ref: &mut KernelState = &mut buffer.data[index];

            if data.VALID && (!exist_ref.VALID) {
                break;
            } else {
                if exist_ref.lexer_stack[0].byte_offset < data.lexer_stack[0].byte_offset {
                    break;
                }
            }
            index += 1;
        }

        buffer.data.insert(index, pointer);

        return buffer.data.len() as u32;
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

    pub fn get_mut_state(buffer: &mut KernelStateBuffer, index: usize) -> Option<&mut KernelState> {
        if buffer.len() > index {
            return Some(buffer.data[index].as_mut());
        }

        return None;
    }

    pub fn get_ref_state(&self, index: usize) -> Option<&KernelState> {
        if self.len() > index {
            return Some(self.data[index].as_ref());
        }

        return None;
    }

    pub fn get_recycled_kernel_state(
        buffer: &mut KernelStateBuffer,
        state: &KernelState,
    ) -> Box<KernelState> {
        if buffer.len() > 0 {
            let mut i: usize = 0;

            while i < buffer.len() {
                let a = buffer.data[i].as_ref();
                if !a.VALID && a.refs < 1 {
                    let mut invalid_ptr = buffer.remove_state_at_index(i);
                    let mut invalid_state = invalid_ptr.as_mut();

                    invalid_state.rules.clear();

                    return invalid_ptr;
                }
                i += 1;
            }
        }

        return Box::new(state.clone_new());
    }
}

// ///////////////////////////////////////////
// PARSER STATE ITERATOR
// ///////////////////////////////////////////

use std::iter::Iterator;

pub struct KernelStateIterator<'a> {
    current: Option<&'a KernelState>,
    refs: Vec<&'a KernelState>,
    index: usize,
    final_index: usize,
}

impl KernelStateIterator<'_> {
    pub fn new<'a>(state: &'a KernelState) -> KernelStateIterator {
        let mut active = state;
        let mut vector: Vec<&'a KernelState> = Vec::new();

        vector.push(state);

        unsafe {
            while let Some(a) = active.origin.as_ref() {
                vector.push(a);
                active = a;
            }
        }

        let last = vector.pop();

        return KernelStateIterator {
            final_index: if let Some(a) = vector.last() {
                a.origin_fork as usize
            } else if let Some(a) = last {
                (a.get_rules_len() as usize) - 1
            } else {
                0
            },
            index: 0,
            refs: vector,
            current: last,
        };
    }
}

impl Iterator for KernelStateIterator<'_> {
    type Item = u16;

    fn next(&mut self) -> Option<Self::Item> {
        if let Some(current) = self.current {
            if self.index > self.final_index {
                if let Some(next) = self.refs.pop() {
                    self.index = 0;
                    self.final_index = if let Some(a) = self.refs.last() {
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

pub fn token_production(
    lexer: &mut Lexer,
    production_state_pointer: u32,
    _type: i32,
    tk_flag: u32,
    state_buffer: *const u32,
    state_buffer_len: usize,
    tk_scan: ScannerFunction,
) -> bool {
    if lexer._type == _type {
        return true;
    }

    if (lexer.active_token_productions & tk_flag) > 0 {
        return false;
    }

    let mut data_buffer: KernelStateBuffer = KernelStateBuffer::new();

    let mut state: KernelState = KernelState::new(
        state_buffer,
        state_buffer_len,
        lexer.input.as_ptr(),
        lexer.input.len(),
        tk_scan,
    );

    state.lexer_stack[0].sync(lexer);
    state.lexer_stack[0].active_token_productions |= tk_flag;
    state.state_stack[1] = production_state_pointer;
    state.state_stack[0] = 0;
    state.stack_pointer = 1;
    state.state = 0;

    if !kernel_executor(&mut state, &mut data_buffer) {
        lexer.set_token_span_to(&mut state.lexer_stack[0]);

        lexer._type = _type;

        return true;
    }

    return false;
}

fn instruction_executor(
    state: u32,
    mut prod: u32,
    kernel_state: &mut KernelState,
    kernel_states_repo: &mut KernelStateBuffer,
) -> (bool, u32) {
    let mut index = (state & state_index_mask) as usize;

    let mut lexer_pointer = kernel_state.lexer_pointer;

    loop {
        print!("Instruction Index {:?}: ", index);

        let instruction = kernel_state.state_buffer[index];

        match ((instruction >> 28) & 0xF) as u8 {
            //Both "pass" and "end";
            0 => {
                println!("End");
                return (false, prod);
            }
            1 => {
                //InstructionType.consume
                println!("Consume");
                kernel_state.consume(lexer_pointer);
            }
            2 => {
                //InstructionType.goto
                println!("Goto state {:?}", instruction & 0xFFFFFFF);
                kernel_state.state_stack[kernel_state.stack_pointer + 1] = instruction;
                kernel_state.stack_pointer += 1;
            }
            3 => {
                //InstructionType.set_prod:
                println!("Set prod {:?}", instruction & 0xFFFFFFF);
                prod = instruction & 0xFFFFFFF;
            }
            4 => {
                //InstructionType.reduce:

                let low = (instruction) & 0xFFFF;

                if (low & 0xFFFF) == 0xFFFF {
                    let accumulated_symbols = (kernel_state.symbol_accumulator
                        - ((state & acc_sym_mask) >> 16) as i32)
                        as u32;

                    let fn_id = (instruction >> 16) & 0x0FFF;

                    //Extract accumulated symbols inform
                    kernel_state.add_reduce(accumulated_symbols, fn_id);
                } else {
                    kernel_state.add_rule(low);

                    if (low & 0x4) == 0x4 {
                        let high_len = (instruction >> 16) & 0xFFFF;
                        kernel_state.symbol_accumulator -= (high_len as i32 - 1) << 16;
                        kernel_state.add_rule(high_len & 0xFFF);
                    } else {
                        kernel_state.symbol_accumulator -= (((low >> 3) & 0x1F) as i32 - 1) << 16;
                    }
                }
            }
            5 => {
                // InstructionType.token_length
                let length = (instruction & 0x0000FFFF) as u16;

                (&mut kernel_state.lexer_stack[lexer_pointer]).token_length = length;
                (&mut kernel_state.lexer_stack[lexer_pointer]).byte_length = length;
                (&mut kernel_state.lexer_stack[0]).token_length = length;
                (&mut kernel_state.lexer_stack[0]).byte_length = length;
            }
            6 =>
            //InstructionType.fork_to
            {
                println!("Fork {:?}times ", instruction & 0xFFFFFFF);
                // the first state goes to
                // the current process
                let mut length = (instruction & 0xFFFFFFF) - 1;

                index += 1;

                kernel_state.state_stack[kernel_state.stack_pointer + 1] =
                    kernel_state.state_buffer[index];

                while length > 0 {
                    index += 1;

                    let fork = KernelState::fork(kernel_state, kernel_states_repo);

                    fork.state_stack[fork.stack_pointer + 1] = kernel_state.state_stack[index];

                    fork.stack_pointer += 1;

                    length -= 1;
                }

                kernel_state.stack_pointer += 1;
            }
            7 => {
                //InstructionType.scan_until
                let length = (instruction & 0xFFFFFFF) as usize;
                let gamma = kernel_state.state_buffer[1 + index];
                let tk_row = gamma >> 16;
                let skip_row = gamma & 0xFFFF;

                index += 1;

                let mut lexer = kernel_state.lexer_stack[lexer_pointer];
                let mut synced_lexer = kernel_state.lexer_stack[(lexer_pointer + 1) % 10];

                let start_byte_offset = lexer.prev_byte_offset;
                let start_token_offset = lexer.prev_token_offset;

                synced_lexer.sync(&lexer);

                lexer.byte_length = 1;

                let mut RUN = true;
                let start = index + 1;
                let end = index + 1 + length;
                index += length;

                while RUN {
                    (kernel_state.tk_scan)(&mut lexer, tk_row, skip_row);

                    for i in (start as usize)..end {
                        if lexer._type == kernel_state.state_buffer[i] as i32 {
                            RUN = false;
                            break;
                        }
                    }

                    if !RUN {
                        break;
                    };

                    if lexer.END() {
                        lexer.sync(&synced_lexer);
                        lexer.prev_byte_offset = start_byte_offset;
                        lexer.prev_token_offset = start_token_offset;
                        return (false, prod);
                    }

                    lexer.next();
                }

                //Reset peek stack;
                kernel_state.lexer_pointer = 0;
                kernel_state.lexer_stack[0] = lexer;

                lexer.prev_byte_offset = start_byte_offset;
                lexer.prev_token_offset = start_token_offset;
            }
            8 => {
                //InstructionType.pop: }
                kernel_state.stack_pointer -= (instruction & 0xFFFFFFF) as usize;
            }
            //Table Jump
            9 => {
                let token_row_switches = kernel_state.state_buffer[index + 1];
                let table_data = kernel_state.state_buffer[index + 2];

                let auto_accept_with_peek = (instruction & alpha_auto_accept_with_peek_mask) > 0;
                let auto_consume_with_peek = (instruction & alpha_auto_consume_with_peek_mask) > 0;

                let basis__ = instruction & 0xFFFF;

                let input_type = (instruction >> 24) & 0x3;
                let token_transition = (instruction >> 26) & 0x3;

                let (input_value, lp) = get_token_info(
                    kernel_state,
                    input_type,
                    token_transition,
                    token_row_switches,
                    auto_accept_with_peek,
                    auto_consume_with_peek,
                    basis__,
                    prod,
                );

                lexer_pointer = lp;

                let number_of_rows = (table_data >> 16) as i32;
                let row_size = (table_data & 0xFFFF) as usize;

                let input_value_index = input_value as usize;

                if input_value >= 0 && input_value < number_of_rows {
                    index += (input_value_index * row_size + 2) as usize;
                } else {
                    // Use default behavior found at the end of the
                    // state table
                    index += (number_of_rows as usize * row_size + 2) as usize;
                }
            }
            //Scanner
            10 => {
                let alpha = instruction;
                let token_row_switches = kernel_state.state_buffer[index + 1];
                let scanner_data = kernel_state.state_buffer[index + 2];

                let auto_accept_with_peek = (alpha & alpha_auto_accept_with_peek_mask) > 0;
                let auto_consume_with_peek = (alpha & alpha_auto_consume_with_peek_mask) > 0;

                let input_type = (instruction >> 24) & 0x3;
                let token_transition = (instruction >> 26) & 0x3;

                let (input_value, lp) = get_token_info(
                    kernel_state,
                    input_type,
                    token_transition,
                    token_row_switches,
                    auto_accept_with_peek,
                    auto_consume_with_peek,
                    0,
                    prod,
                );

                lexer_pointer = lp;

                let scan_field_length = (scanner_data >> 16) as usize;

                let instruction_field_size = (scanner_data & 0xFFFF) as usize;

                let scan_field_start = index + 3;

                let scan_field_end = scan_field_start + scan_field_length;

                let instruction_field_start = scan_field_end;

                //default instruction
                index = instruction_field_start + instruction_field_size;

                for i in (scan_field_start..scan_field_end).step_by(2) {
                    if kernel_state.state_buffer[i] == input_value as u32 {
                        index = instruction_field_start + kernel_state.state_buffer[i + 1] as usize;
                        break;
                    }
                }
            }
            //Set fail state
            11 => {
                kernel_state.state_stack[kernel_state.stack_pointer + 1] =
                    instruction | ((kernel_state.symbol_accumulator as u32) & acc_sym_mask);

                kernel_state.stack_pointer += 1;
            }
            12 => {
                //InstructionType.repeat:
                kernel_state.stack_pointer += 1;
            }
            _ => {
                return (true, prod);
            }
        }

        index += 1;
    }
}

fn get_token_info(
    kernel_state: &mut KernelState,
    input_type: u32,
    token_transition: u32,
    token_row_switches: u32,
    auto_accept_with_peek: bool,
    auto_consume_with_peek: bool,
    basis__: u32,
    prod: u32,
) -> (i32, usize) {
    let mut input_value: i32 = prod as i32;

    let mut lexer_pointer = kernel_state.lexer_pointer;

    if input_type == 2 {
        // Lexer token id input

        let tk_row = token_row_switches >> 16;

        let skip_row = token_row_switches & 0xFFFF;

        match token_transition & 0xF {
            1 =>
            /* set next peek lexer */ /* set next peek lexer *//* set next peek lexer */ /* set next peek lexer */
            {
                let prev_lexer = kernel_state.lexer_stack[kernel_state.lexer_pointer];

                kernel_state.lexer_pointer += 1;

                let lexer = &mut kernel_state.lexer_stack[kernel_state.lexer_pointer];

                lexer.sync(&prev_lexer);

                lexer.next();

                (kernel_state.tk_scan)(lexer, tk_row, skip_row);

                lexer_pointer = kernel_state.lexer_pointer;
            }

            2 =>
            /* set primary lexer */
            {
                let consume_index = kernel_state.lexer_pointer >> 16;
                let peek_level = kernel_state.lexer_pointer & 0xFFFF;

                if (peek_level - consume_index) > 0 && auto_accept_with_peek {
                    lexer_pointer = consume_index;

                    if auto_consume_with_peek {
                        kernel_state.lexer_pointer += 1 << 16;
                        if consume_index > 0 {
                            let next_lexer = kernel_state.lexer_stack[consume_index + 1];
                            kernel_state.lexer_stack[0].sync(&next_lexer);
                        }
                    } else {
                        let last_lexer = kernel_state.lexer_stack[consume_index];
                        kernel_state.lexer_stack[0].sync(&last_lexer);
                        lexer_pointer = 0;
                    }

                    input_value = basis__ as i32;
                } else {
                    kernel_state.lexer_pointer = 0;

                    let lexer = &mut kernel_state.lexer_stack[0];

                    (kernel_state.tk_scan)(lexer, tk_row, skip_row);

                    lexer_pointer = 0;

                    input_value = lexer._type;
                }
            }

            _ => { /*do nothing */ }
        }
    }

    input_value = input_value - (basis__ as i32);

    (input_value, lexer_pointer)
}

fn kernel_executor(
    kernel_state: &mut KernelState,
    kernel_states_repo: &mut KernelStateBuffer,
) -> bool {
    //Kernel
    //Input
    let mut fail_mode = false;
    let mut prod = 0;

    loop {
        for _ in 0..4 {
            if kernel_state.stack_pointer < 1 {
                return fail_mode;
            }

            // Hint to the compiler to inline this section 4 times
            let state: u32 = kernel_state.state_stack[kernel_state.stack_pointer];

            println!("stack pointer {:?}", kernel_state.stack_pointer);

            kernel_state.stack_pointer -= 1;

            // * A state pointer is divided into three data segments
            //  *   Meta ______ State info     Array Index
            //  *   _|  _|_ ___________________|___
            //  *  |  ||  ||                       |
            //  * [31 .28 .24 . . .16 . . .8. . . .0]
            //  *
            //  * Meta data relates to found within the meta
            //  * executor and is within state pointers
            //  * that are stored in state buffers. An example
            //  * usage of this section is for goto instruction,
            //  * which is simply copied to the state_stack as
            //  * the instruction already contains the goto state
            //  * pointer information
            //  *
            //  *
            //  * State info segment store the information
            //  * necessary to handle kernel switching tasks,
            //  * namely, whether to use the state for failure
            //  * recovery or to use it for normal parser
            //  * duties.
            //  *

            if (!fail_mode && (state & fail_state_mask) == 0)
                || (fail_mode && (state & fail_state_mask) != 0)
            {
                let (failed, production) =
                    instruction_executor(state, prod, kernel_state, kernel_states_repo);

                fail_mode = failed;
                prod = production;
            }
        }
    }
}

fn run(
    process_buffer: &mut KernelStateBuffer,
    invalid_buffer: &mut KernelStateBuffer,
    valid_buffer: &mut KernelStateBuffer,
) {
    while process_buffer.len() > 0 {
        let i: usize = 0;

        while i < process_buffer.len() {
            let kernel_state: &mut KernelState = process_buffer.data[i].as_mut();

            let FAILED = kernel_executor(kernel_state, invalid_buffer);

            kernel_state.COMPLETED = true;

            kernel_state.VALID = !FAILED;

            match kernel_state.VALID {
                true => {
                    KernelStateBuffer::add_state_pointer_and_sort(
                        valid_buffer,
                        process_buffer.remove_state_at_index(i),
                    );
                }
                false => {
                    KernelStateBuffer::add_state_pointer_and_sort(
                        invalid_buffer,
                        process_buffer.remove_state_at_index(i),
                    );
                }
            }
        }

        while invalid_buffer.have_valid() {
            match invalid_buffer.remove_valid_parser_state() {
                Some(x) => KernelStateBuffer::add_state_pointer(process_buffer, x),
                None => (),
            }
        }
    }
}

pub fn recognize(
    state_buffer: *const u32,
    state_buffer_length: usize,
    input_buffer: *const u8,
    input_byte_length: usize,
    start_state_pointer: u32,
    scanner_function: ScannerFunction,
) -> (KernelStateBuffer, KernelStateBuffer) {
    let mut process_buffer = KernelStateBuffer::new();
    let mut invalid_buffer = KernelStateBuffer::new();
    let mut valid_buffer = KernelStateBuffer::new();

    {
        let state = KernelStateBuffer::create_state(
            &mut process_buffer,
            state_buffer,
            state_buffer_length,
            input_buffer,
            input_byte_length,
            scanner_function,
        );

        state.state_stack[0] = 0;
        state.state_stack[1] = start_state_pointer;
        state.stack_pointer = 1;

        run(&mut process_buffer, &mut invalid_buffer, &mut valid_buffer);
    }

    return (valid_buffer, invalid_buffer);
}

mod recognizer_test {

    use super::*;

    fn scan(lexer: &mut Lexer, tk_row: u32, pk_row: u32) {
        lexer._type = 5;
    }

    #[test]
    fn it_should_complete_a_forked_parse_run() {
        let mut input: [u8; 1] = [32];
        let mut state_buffer: [u32; 4] = [0x10000000, 0x30000002, 0x20000000, 0];

        let (passed, failed) = recognize(
            state_buffer.as_ptr(),
            state_buffer.len(),
            input.as_ptr(),
            input.len(),
            0,
            scan,
        );

        assert_eq!(passed.len(), 2);
        assert_eq!(failed.len(), 2);
    }
}
