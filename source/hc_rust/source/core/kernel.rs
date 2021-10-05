use super::lexer::*;
//*

//Global Constants
const state_index_mask:u32 = (1 << 24) - 1;
const fail_state_mask:u32 = 1 << 27;
const normal_state_mask:u32 = 1 << 26;
const alpha_increment_stack_pointer_mask:u32 = 1 << 0;
const alpha_have_default_action_mask:u32 = 1 << 1;
const alpha_auto_accept_with_peek_mask:u32 = 1 << 16;
const alpha_auto_consume_with_peek_mask:u32 = 1 << 17;
const production_scope_pop_pointer:u32 = 2;
const instruction_pointer_mask:u32 = 0xFFFFFF;
const stack_size:u32 = 128;

pub type ScannerFunction = fn(&mut Lexer, u32, u32) -> ();

// ///////////////////////////////////////////
// KERNEL STATE BUFFER
// ///////////////////////////////////////////

pub struct KernelState {
    state_stack: [u32; stack_size],
    meta_stack: [u32; stack_size],
    lexer: Lexer,
    peek_lexer: Lexer,

    tk_scan: ScannerFunction,
    
    instruction_buffer: &'static [u32],
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
    FORKED: bool,
    refs: u8,
}

impl KernelState {
    pub fn new(
        instruction_buffer: *const u32,
        instruction_buffer_len: usize,
        input_buffer: *const u8,
        input_len_in: usize,
        tk_scan: ScannerFunction,
    ) -> KernelState {
        use std::slice;

        KernelState {
            state_stack: [0; stack_size],
            meta_stack: [0; stack_size],
            lexer: Lexer::new(input_buffer, input_len_in),
            peek_lexer: Lexer::new(input_buffer, input_len_in),
            tk_scan,
            instruction_buffer: unsafe { slice::from_raw_parts(instruction_buffer, instruction_buffer_len as usize) },
            
            stack_pointer: 1,
            rules: Vec::with_capacity(512),
            origin: std::ptr::null(),
            state: 0xFFFFFFFF,
            origin_fork: 0,
            VALID: true,
            COMPLETED: false, /*  */
            FORKED:false,
            refs: 0,
            symbol_accumulator: 0,
        }
    }

    pub fn clone_new(&self) -> KernelState {
        let instruction_buffer = self.instruction_buffer.as_ptr();
        let instruction_buffer_len = self.instruction_buffer.len();
        let input_buffer = self.lexer_stack[0].input.as_ptr();
        let input_len_in = self.lexer_stack[0].input.len();
        let tk_scan = self.tk_scan;

        KernelState::new(
            instruction_buffer,
            instruction_buffer_len,
            input_buffer,
            input_len_in,
            tk_scan,
        )
    }

    pub fn get_rules_len(&self) -> u32 {
        self.rules.len() as u32
    }

    pub fn push_state(&mut self, kernel_state:u32){
        self.stack_pointer += 1;
        let sp = self.stack_pointer;
        self.state_stack[sp] = kernel_state;
        self.meta_stack[sp] = (self.meta_stack[sp - 1] & 0xFFFF) | self.symbol_accumulator;
    }

    pub fn replace_top_state(&mut self, kernel_state: u32) {
        self.state_stack[self.stack_pointer] = kernel_state;
    }

    pub fn pop_state(&mut self)->u32 {
        self.stack_pointer -= 1;
        self.get_state()
    }

    pub fn get_state(&mut self)->u32 {
        self.state_stack[self.stack_pointer]
    }

    pub fn copy_state_stack(&self, destination_state: &mut KernelState) {
        for i in 0..=self.stack_pointer {
            destination_state.state_stack[i] = self.state_stack[i];
        }            
    }

    pub fn copy_production_stack(&self, destination_state: &mut KernelState) {
        for i in 0..=self.stack_pointer {
            destination_state.meta_stack[i] = self.meta_stack[i];
            destination_state.state_stack[i] = 0;
        }            
    }

    pub fn transfer_state_stack(&mut self, new_state: &mut KernelState) {

        self.copy_state_stack(new_state);
        
        for i in 0..=self.stack_pointer {
            self.state_stack[i] = 0;
        }

        new_state.stack_pointer = self.stack_pointer;

        self.stack_pointer = 0;
    }

    pub fn fork<'a>(
        buffer: &mut KernelState,
        process_buffer: &'a mut KernelStateBuffer,
    ) -> &'a mut KernelState {
        let mut state_pointer =
            KernelStateBuffer::get_recycled_kernel_state(process_buffer, buffer);
        {
            let forked_state = state_pointer.as_mut();

            buffer.copy_state_stack(forked);

            //Increment the refs count to prevent the
            //KernelState from being recycled.
            forked_state.origin = buffer;
            forked_state.stack_pointer = buffer.stack_pointer;
            forked_state.origin_fork = buffer.get_rules_len();
            forked_state.state = buffer.state;
            forked_state.symbol_accumulator = buffer.symbol_accumulator;
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
            self.symbol_accumulator -= (sym_len as i32 - 1) << 16;
            
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

    pub fn consume(&mut self) {
        let mut l = self.lexer;

        if 0 != (self.state & 2) {
            let skip_delta = l.token_offset - l.prev_token_offset;

            self.add_skip(skip_delta);

            self.add_shift(l.token_length as u32);

            self.symbol_accumulator += 1 << 16;
        }

        l.prev_byte_offset = l.byte_offset + l.byte_length as u32;
        l.prev_token_offset = l.token_offset + l.token_length as u32;
        l.next();

        self.lexer = l;
    }

    pub fn get_root_lexer(&self) {
        return lexer;
    }

    pub fn get_root_lexer(&self) -> &Lexer {
        &self.lexer_stack[0]
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
        instruction_buffer: *const u32,
        instruction_buffer_len: usize,
        input_buffer: *const u8,
        input_len_in: usize,
        tk_scan: ScannerFunction,
    ) -> &mut KernelState {
        let data: Box<KernelState> = Box::new(KernelState::new(
            instruction_buffer,
            instruction_buffer_len,
            input_buffer,
            input_len_in,
            tk_scan,
        ));

        let index = buffer.data.len();

        buffer.data.push(data);

        return buffer.data[index].as_mut();
    }

    pub fn remove_state_at_index(&mut self, index: usize) -> Box<KernelState> {
        return self.data.remove(index);
    }

    pub fn add_state_pointer(buffer: &mut KernelStateBuffer, data: Box<KernelState>) {
        buffer.data.push(data);
    }

    pub fn add_state_pointer_and_sort(
        buffer: &mut KernelStateBuffer,
        pointer: Box<KernelState>,
    ) -> u32 {
        let mut index: usize = 0;

        let data = pointer.as_ref();

        for index in 0..buffer.data.len() {
            let exist_ref: &mut KernelState = &mut buffer.data[index];

            if data.VALID && (!exist_ref.VALID) {
                break;}
            
            if exist_ref.lexer_stack[0].byte_offset < data.lexer_stack[0].byte_offset {
                break;
            }
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
                (a.get_rules_len() as usize)
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
            if self.index >= self.final_index {
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


fn instruction_executor(
    state_pointer: u32,
    fail_mode: bool,
    kernel_state: &mut KernelState,
    kernel_states_repo: &mut KernelStateBuffer,
)-> bool {

    let mut index = (state & state_index_mask) as usize;

    let recover_data = kernel_state.meta_stack[kernel_state.stack_pointer + 1];

    loop {

        let instruction = kernel_state.instruction_buffer[index];

        index += 1;

        match ((instruction >> 28) & 0xF) as u8 {

             0 | _ => {return pass(prod);}

             1 => {consume(instruction, kernel_state);}

             2 => {goto(instruction, kernel_state);}

             3 => {set_production(instruction, kernel_state);}

             4 => {reduce(instruction, kernel_state, recover_data);}

             5 => {set_token_length(instruction, kernel_state);}

             6 => {index = fork(instruction, index, kernel_state, kernel_state_repo);}

             7 => {index = scan_to(kernel_state, index, instruction);}

             8 => { set_production_scope(instruction, kernel_state);}

             9 => {index = index_jump(kernel_state, index, instruction);}

             10 =>:{ index = hash_jump(kernel_state, index, instruction);}

             11 =>:{ push_fail_state(instruction, kernel_state);}

             12 =>:{ index = repeat(index, instruction);}

             13 =>:{ index = not_in_scope(kernel_state, index, instruction);}

             14 =>:{ /*NOOP*/;}

             15 =>:{ return advanced_return(instruction, instruction, fail_mode);}
        }
    }
}

fn pass(prod: u32)-> bool  {
    return false;
}

fn advanced_return(instruction: u32, prod: u32, fail_mode: bool)-> bool {
    if instruction & 1 {

        return fail_mode;
    }

    if !kernel_state.lexer.END() {
        kernel_state.lexer._type = 0;
        kernel_state.lexer.token_length = 1;
        kernel_state.lexer.byte_length = 1;
        kernel_state.peek_lexer._type = 0;
        kernel_state.peek_lexer.token_length = 1;
        kernel_state.peek_lexer.byte_length = 1;
    }

    return true;
}

fn set_production_scope(instruction: u32, kernel_state: &mut KernelState) {

    let prod_scope = instruction & 0xFFFFFFF;

    kernel_state.meta_stack[kernel_state.stack_pointer] = prod_scope | (kernel_state.meta_stack[kernel_state.stack_pointer] & 0xFFFF0000);

}

fn set_production(instruction: u32, prod: u32, kernel_state: KernelState)->u32 {
    kernel_state.prod = instruction & 0xFFFFFFF;
}

fn not_in_scope(kernel_state: &mut KernelState, index: u32, instruction: u32)-> u32 {

    let length = instruction & 0xFFFFFFF;

    let RUN = true;

    let start = index;

    let end = index + length;

    index += length;

    let j = 0;

    while j <= kernel_state.stack_pointer {
        let prod = kernel_state.meta_stack[j] & 0xFFFF;

        for i in start..end  {

            if kernel_state.instruction_buffer[i] == prod {
                RUN = false;
                break;
            }
        }

        if (!RUN) {break};

        j+=1
    }

    if j >= 0 && j <= kernel_state.stack_pointer
       { return 1;}

    return index;
}

fn scan_to(kernel_state:&mut KernelState, mut index: u32, instruction: u32)-> u32 {

    let length = instruction & 0xFFFF;

    let gamma = kernel_state.instruction_buffer[index];

    index += 1;

    let tk_row = gamma >> 16;

    let skip_row = gamma & 0xFFFF;

    let scan_back = (instruction & 0x00100000) > 0;

    let lexer = kernel_state.lexer;

    let start_byte_offset = lexer.prev_byte_offset;

    let start_token_offset = lexer.prev_token_offset;

    lexer.byte_length = 1;

    let RUN = true;

    let start = index;

    let end = index + length;

    let end_offset = lexer.input_len;

    index += length;

    let temp_lexer = lexer.copy_in_place();

    if scan_back {
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

    while RUN {

        kernel_state.tk_scan(temp_lexer, tk_row, skip_row);

        for i in start..end  {

            if temp_lexer._type == kernel_state.instruction_buffer[i] {
                RUN = false;
                break;
            }
        }

        if (!RUN) break;

        if temp_lexer.byte_offset >= end_offset
            {return 1;}

        temp_lexer.next();
    }

    if !scan_back {

        //Reset peek stack;
        kernel_state.lexer.peek_unroll_sync(temp_lexer);
        kernel_state.lexer.prev_byte_offset = start_byte_offset;
        kernel_state.lexer.prev_token_offset = start_token_offset;
    }

    return index;
}

fn hash_jump(kernel_state: &mut KernelState, index: u32, instruction: u32)-> u32 {

    let input_type = ((instruction >> 24) & 0x3);

    let token_transition = ((instruction >> 26) & 0x3);

    let token_row_switches = kernel_state.instruction_buffer[index];

    let table_data = kernel_state.instruction_buffer[index + 1];

    index += 2;

    let modulus = (1 << ((table_data >>> 16) & 0xFFFF)) - 1;

    let table_size = (table_data) & 0xFFFF;

    let hash_table_start = index;

    let instruction_field_start = hash_table_start + table_size;

    let instruction_field_size = instruction & 0xFFFF;

    let input_value =
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

    let hash_index = input_value & modulus;

    while (true) {

        let cell = kernel_state.instruction_buffer[hash_table_start + hash_index];

        let value = cell & 0x7FF;

        let next = ((cell >>> 22) & 0x3FF) - 512;

        if (value == input_value) {

            let instruction_start = (cell >> 11) & 0x7FF;

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

fn index_jump(kernel_state:&mut KernelState, index: u32, instruction: u32)->u32 {

    let token_row_switches = kernel_state.instruction_buffer[index];

    let table_data = kernel_state.instruction_buffer[index + 1];

    index += 2;

    let basis__ = instruction & 0xFFFF;

    let input_type = ((instruction >> 24) & 0x3);

    let token_transition = ((instruction >> 26) & 0x3);

    let input_value = get_token_info(
        kernel_state,
        input_type,
        token_transition,
        token_row_switches,
        basis__
    );

    let number_of_rows = table_data >> 16;

    let row_size = table_data & 0xFFFF;
    
    if input_value >= 0 && input_value < number_of_rows {

        return index + input_value * row_size + row_size;

    } else {
        // Use default behavior found at the beginning of the 
        // jump table
        return index;
    }
}

fn set_token_length(instruction: u32, kernel_state: &mut KernelState) {

    let length = instruction & 0xFFFFFFF;

    kernel_state.lexer.token_length = length;
    kernel_state.lexer.byte_length = length;
    kernel_state.lexer.token_length = length;
    kernel_state.lexer.byte_length = length;

}

fn reduce(instruction: u32 , kernel_state: &mut KernelState, recover_data: u32) {
    let low = (instruction) & 0xFFFF;

    if ((low & 0xFFFF) == 0xFFFF) {

        let accumulated_symbols = kernel_state.symbol_accumulator
            -
            (recover_data & 0xFFFF0000);

        let len = (accumulated_symbols >> 16);

        let fn_id = (instruction >> 16) & 0x0FFF;
        
        //Extract accumulated symbols inform
        kernel_state.add_reduce(len, fn_id);
    } else {

        kernel_state.add_rule(low);

        if ((low & 0x4) == 0x4) {
            let high_len = (instruction >> 16) & 0xFFFF;
            
            kernel_state.symbol_accumulator -= (high_len - 1) << 16;

            kernel_state.add_rule(high_len & 0xFFF);
        } else {
            
            kernel_state.symbol_accumulator -= (((low >> 3) & 0x1F) - 1) << 16;

            kernel_state.meta_stack[kernel_state.stack_pointer] =
                kernel_state.symbol_accumulator
                |
                (kernel_state.meta_stack[kernel_state.stack_pointer] & 0xFFFF);
        }
    }
}

fn goto(instruction: u32, kernel_state:&mut KernelState) {
    kernel_state.push_state(instruction);
}

fn consume(instruction: u32, kernel_state: KernelState) {

    if (instruction & 1) > 0 {
        let lexer = kernel_state.lexer;
        lexer.token_length = 0;
        lexer.byte_length = 0;
    }

    kernel_state.consume();
}

fn repeat(index: u32, instruction: u32 )  ->u32{
    
    let origin_offset = 0xFFFFFFF & instruction;

    index -= (origin_offset);

    return index;
}

fn push_fail_state(instruction: u32, kernel_state: KernelState) {

    let fail_state_pointer = instruction;

    let current_state = (kernel_state.get_state() & instruction_pointer_mask);
    //Only need to set new failure state if the previous state
    //Is not identical to the pending fail state.
    if (current_state != ((fail_state_pointer) & instruction_pointer_mask)) {
        
        kernel_state.push_state(fail_state_pointer);
    } else {
        kernel_state.replace_top_state(fail_state_pointer);
    }
}

fn get_token_info(
    ks: &mut KernelState,
    input_type: u32,
    token_transition: u32,
    token_row_switches: u32,
    basis__: u32,
) -> i32 {

    let mut input_value: i32 = prod as i32;

    if input_type == 2 {
        // Lexer token id input

        let tk_row = token_row_switches >> 16;

        let skip_row = token_row_switches & 0xFFFF;

        match token_transition & 0xF {
            1 =>
            /* set next peek lexer */ /* set next peek lexer *//* set next peek lexer */ /* set next peek lexer */
            {
                if ks.peek_lexer.byte_offset <= ks.lexer.byte_offset {
                    ks.peek_lexer.sync(ks.lexer);
                }

                ks.peek_lexer.next();

                ks.peek_lexer.sync_offsets();

                let lexer = &mut ks.peek_lexer;

                ks.tk_scan(lexer, tk_row, skip_row);

                input_value = ks.peek_lexer._type;
            }

            2 =>
            /* set primary lexer */
            {
                if (
                    ks.peek_lexer.byte_offset >= ks.lexer.byte_offset
                ) {

                    ks.peek_lexer.byte_offset = 0;

                    ks.lexer._type = 0;
                    ks.token_length = 1;
                    ks.byte_length = 1;
                }

                let lexer = &mut ks.lexer;

                ks.tk_scan(lexer, tk_row, skip_row);

                input_value = ks.lexer._type;
            }

            _ => { /*do nothing */ }
        }
    } else {
        return kernel_state.prod - basis__; 
    }

    input_value - (basis__ as i32)
}


fn fork(
    instruction: u32,
    index: u32,
    origin_kernel_state:&mut KernelState,
    origin_kernel_state_repo:&mut KernelStateBuffer,
) -> u32 {

    let valid = KernelStateBuffer::new();
    let invalid = KernelStateBuffer::new();
    let process_buffer = KernelStateBuffer::new();
    let length = (instruction & 0xFFFFFFF);

    origin_kernel_state.FORKED = true;

    while (length > 0) {

        let kernel_state = origin_kernel_state.fork(process_buffer, false);

        let new_state = origin_kernel_state.instruction_buffer[index];

        kernel_state.push_state(new_state);

        length-= 1;
        index += 1;
    }

    while (process_buffer.len() > 0) {

        let i = 0;

        while i < process_buffer.len() {

            let kernel_state: &mut KernelState = process_buffer.data[i];

            let FAILED = kernel_executor(kernel_state, invalid, false);

            kernel_state.COMPLETED = true;

            kernel_state.VALID = !FAILED;

            if (kernel_state.FORKED)
                process_buffer.remove_state_at_index(i);
        }

        while (invalid.have_valid())
            process_buffer.add_state_pointer(invalid.remove_valid_parser_state());
    }

    if (valid.len() > 0) {

        if (valid.len() == 1) {

            //Continue Parsing from the end of the previous KernelState
            let tip = valid.data[0];

            origin_kernel_state.next.push(tip);

            //Synch tip with the origin_kernel_state
            origin_kernel_state.transfer_state_stack(tip);

            //Set the tip to point to the next set of instructions
            //after the fork.
            tip.push_state(index);

            origin_kernel_state_repo.add_state_pointer(tip);

            //Set index so that it points to the pass instruction block;
            index = 0;

        } else {

            let furthest_byte = valid.data[0].lexer.byte_offset;

            let furthest_index = 0;

            let furthest_matching_count = 1;

            for i in 1..valid.len(){

                if (valid.data[i].lexer.byte_offset != furthest_byte) {
                    // Extract the longest parsers
                    for i in 1..valid.len(){ {
                        let len = valid.data[i].lexer.byte_offset;

                        if (len > furthest_byte) {
                            furthest_byte = len;
                            furthest_index = i;
                            furthest_matching_count = 1;
                        } else if (len == furthest_byte)
                            furthest_matching_count += 1;
                    }

                    if (furthest_matching_count == 1) {
                        //Continue Parsing from the end of the previous KernelState
                        //Continue Parsing from the end of the previous KernelState
                        let tip = valid.data[furthest_index];

                        origin_kernel_state.next.push(tip);

                        //Synch tip with the origin_kernel_state
                        origin_kernel_state.transfer_state_stack(tip);

                        //Set the tip to point to the next set of instructions
                        //after the fork.
                        tip.push_state(index);

                        origin_kernel_state_repo.add_state_pointer(tip);

                        //Set index so that it points to the null instruction block;
                        index = 0;

                    } else {
                        panic!("Multiple uneven parse paths exist, no resolution mechanism has been implemented for this situation. Exiting");
                    }
                    break;
                } else if (i == valid.len() - 1) {
                    panic!("Multiple even parse paths exist, no resolution mechanism has been implemented for this situation. Exiting");
                }
            }
        }
    } else {

        //Continue Parsing from the end of the previous KernelState
        let tip = valid.get_mut_state(0);

        origin_kernel_state.next.push(tip);

        //Synch tip with the origin_kernel_state
        origin_kernel_state.transfer_state_stack(tip);

        //Set the tip to point to the next set of instructions
        //after the fork.
        tip.push_state(normal_state_mask | fail_state_mask | 1);

        origin_kernel_state_repo.add_state_pointer(tip);

        //Set index so that it points to the pass instruction block;
        index = 0;
    }

    // Link valid states to the origin state
    // Then create a new forward state the linked states reference.

    index
}

pub fn token_production(
    lexer: &mut Lexer,
    production_state_pointer: u32,
    _type: i32,
    tk_flag: u32,
    instruction_buffer: *const u32,
    instruction_buffer_len: usize,
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
        instruction_buffer,
        instruction_buffer_len,
        lexer.input.as_ptr(),
        lexer.input.len(),
        tk_scan,
    );

    state.lexer.byte_offset = lexer.byte_offset;
    state.lexer.token_offset = lexer.token_offset;
    state.lexer.byte_length = 0;
    state.lexer.token_length = 0;
    state.lexer.next();
    state.lexer.active_token_productions |= tk_flag;
    state.state_stack[1] = production_state_pointer;
    state.state_stack[0] = 0;
    state.stack_pointer = 1;
    state.state = 0;

    if !kernel_executor(&mut state, &mut data_buffer) {

        lexer.set_token_span_to(&mut state.lexer_stack[0]);

        return true;
    }

    return false;
}


fn kernel_executor(
    kernel_state: &mut KernelState,
    kernel_states_repo: &mut KernelStateBuffer,
) -> bool {
    
    let mut fail_mode = false;

    loop {
        for _ in 0..4 {

            let state = kernel_state.pop_state();

            if state > 0 {

                let mask_gate = normal_state_mask << (fail_mode as u32);
                
                if (mask_gate & state) > 0
                {
                    fail_mode =
                        instruction_executor(
                            state, 
                            fail_mode,  
                            kernel_state, 
                            kernel_states_repo
                    );
                }
            }
        }

        if ((kernel_state.stack_pointer as i32) < 1)
            break;
    }

    fail_mode
}

fn internal_run(
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

            if kernel_state.lexer_stack[0].byte_offset < kernel_state.lexer_stack[0].input.length {
                kernel_state.VALID = false;
            }

            if kernel_state.FORKED {
                KernelStateBuffer::add_state_pointer_and_sort(
                    valid_buffer,
                    process_buffer.remove_state_at_index(i),
                );
            } else {

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
        }

        while invalid_buffer.have_valid() {
            match invalid_buffer.remove_valid_parser_state() {
                Some(x) => KernelStateBuffer::add_state_pointer(process_buffer, x),
                None => (),
            }
        }
    }
}

pub fn run(
    instruction_buffer: *const u32,
    instruction_buffer_length: usize,
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
            instruction_buffer,
            instruction_buffer_length,
            input_buffer,
            input_byte_length,
            scanner_function,
        );

        state.state_stack[0] = 0;
        state.state_stack[1] = start_state_pointer;
        state.stack_pointer = 1;

        internal_run(&mut process_buffer, &mut invalid_buffer, &mut valid_buffer);
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
        let mut instruction_buffer: [u32; 4] = [0x10000000, 0x30000002, 0x20000000, 0];

        let (passed, failed) = run(
            instruction_buffer.as_ptr(),
            instruction_buffer.len(),
            input.as_ptr(),
            input.len(),
            0,
            scan,
        );

        assert_eq!(passed.len(), 2);
        assert_eq!(failed.len(), 2);
    }
}
