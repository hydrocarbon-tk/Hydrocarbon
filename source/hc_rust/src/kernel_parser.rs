#![feature(destructuring_assignment)]

use super::lexer::*;
//*

//Global Constants
const state_index_mask:u32 = (1 << 24) - 1;
 const fail_state_mask:u32 = 1 << 26;
 const alpha_increment_stack_pointer_mask:u32 = 1 << 0;
 const alpha_have_default_action_mask:u32 = 1 << 1;
 const alpha_auto_accept_with_peek_mask:u32 = 1 << 2;
 const alpha_auto_consume_with_peek_mask:u32 = 1 << 3;

pub type ScannerFunction = fn(&mut Lexer, u32, u32) -> ();

// ///////////////////////////////////////////
// KERNEL STATE BUFFER
// ///////////////////////////////////////////

struct KernelState<'a> {
    state_stack: [u32;128],
    lexer_stack: [Lexer;10],
    
    tk_scan: ScannerFunction,
    state_buffer: &'a [u32],
    
    lexer_pointer: u32,
    stack_pointer: u32,
    

    // 8 byte +
    rules: Vec<u16>,
    origin: *const KernelState<'a>,

    // 4 byte
    state: u32,
    origin_fork: u32,

    // 1 byte
    VALID: bool,
    COMPLETED: bool,
    refs: u8,
}

impl KernelState<'_>  {
    
    pub fn new(
        state_buffer: *const u32,
        input_buffer: *const u8,
        input_len_in: u32,
        tk_scan: ScannerFunction,
    ) -> Self {
        KernelState {
            state_stack: [0;128],
            lexer_stack : [Lexer::new(input_buffer, input_len_in ); 128],
            tk_scan,
            state_buffer,
            lexer_pointer:0,
            stack_pointer:0,
            rules: Vec::with_capacity(512),
            origin: std::ptr::null(),
            state: 0xFFFFFFFF,
            origin_fork: 0,
            VALID: true,
            COMPLETED: false, /*  */
            refs: 0,
        }
    }

    pub fn get_rules_len(&self) -> u32 {
        self.rules.len() as u32
    }

    pub fn fork<'A>(&mut self, process_buffer: &'A mut KernelStateBuffer) -> &'A mut KernelState {

        let mut state_pointer = process_buffer.get_recycled_ParserState(self);
        let forked_state = state_pointer.as_mut();

        for  i in [0..10]{
            forked_state.lexer_stack[i].sync(self.lexer_stack[i]);}
        
            for i in  [0..=self.stack_pointer]{
                forked_state.state_stack[i] = self.state_stack[i];

            }

        //Increment the refs count to prevent the
        //KernelState from being recycled.
        forked_state.origin = self;
        forked_state.stack_pointer = self.stack_pointer;
        forked_state.lexer_pointer = self.lexer_pointer;
        forked_state.origin_fork = self.get_rules_len();
        forked_state.state = self.state;
        forked_state.VALID = true;

        self.refs += 1;

        process_buffer.add_state_pointer(forked_state);

        return forked_state;
    }
    pub fn add_rule(&mut self, val: u32) {
        self.rules.push(val as u16);
    }

    pub fn  add_reduce(&mut self, sym_len: u32, fn_id: u32) {

        if 0 != (self.state & 2) {
            let total = fn_id + sym_len;
            if (total) == 0 {
                return;
            }

            if fn_id > 0xFF || sym_len > 0x1F {
                let low = (1 << 2) | (fn_id << 3);
                let high = sym_len;
                self.add_rule(low);
                self.add_rule(high);
            }  else {
                let low = ((sym_len & 0x1F) << 3) | ((fn_id & 0xFF) << 8);
                self.add_rule(low);
            }
        }
    }
    pub fn  add_shift(&mut self, tok_len: u32) {
        if tok_len < 0 {
            return;
}
        if tok_len > 0x1FFF {
            let low = 1 | (1 << 2) | ((tok_len >> 13) & 0xFFF8);
            let high = tok_len & 0xFFFF;
            self.add_rule(low);
            self.add_rule(high);
        }
        else {
            let low = 1 | ((tok_len << 3) & 0xFFF8);
            self.add_rule(low);
        }
    }
    pub fn  add_skip(&mut self, skip_delta: u32) {
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

    pub fn  consume(&mut self, lexer_pointer: u32) {

        let l = &mut self.lexer_stack[lexer_pointer];

        if 0 != (self.state & 2) {

            let skip_delta = l.token_offset - l.prev_token_offset;

            self.add_skip(skip_delta);

            self.add_shift(l.token_length);
        }

        l.prev_byte_offset = l.byte_offset + l.byte_length;
        l.prev_token_offset = l.token_offset + l.token_length;

        l.next();
    }
}
// ///////////////////////////////////////////
// KERNEL STATE BUFFER
// ///////////////////////////////////////////
pub struct KernelStateBuffer<'a> {
    data: Vec<Box<KernelState<'a>>>,
}

impl KernelStateBuffer<'_> {
    pub fn  new<'a>() -> KernelStateBuffer<'a> {
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
            }
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



fn instruction_executor(
    index: u32,
    mut prod: u32,
    lexer_pointer: u32,
     kernel_state: &mut KernelState,
     kernel_states_repo: &mut KernelStateBuffer
) -> (bool, u32) {
    loop {

        let instruction = kernel_state.state_buffer[index];
        index += 1;

        match (instruction >> 28) & 0xF {

            //Both "pass" and "end";
             0=> { return ( false, prod ); }
             1=> { //InstructionType.consume:
                //consume(state)
                kernel_state.consume(lexer_pointer);
             }
             2=> { //InstructionType.goto:
                kernel_state.state_stack[kernel_state.stack_pointer + 1] = instruction;
                kernel_state.stack_pointer += 1;
            }
             3=> { //InstructionType.set_prod:
                prod = instruction & 0xFFFFFFF;
             }
             4=> //InstructionType.fork_to: 
                {
                    // the first state goes to 
                    // the current process
                    let length = (instruction & 0xFFFFFFF) - 1;

                    kernel_state.state_stack[kernel_state.stack_pointer + 1] = kernel_state.state_buffer[index];
                    index += 1;

                    while length > 0 {
                        
                        let fork = kernel_state.fork(kernel_states_repo);
                        
                        fork.state_buffer[fork.stack_pointer + 1] = kernel_state.state_buffer[index];
                        
                        fork.stack_pointer += 1;
                        
                        length -=1;
                        index += 1;
                    }

                    kernel_state.stack_pointer += 1;
                }
             5=> { // InstructionType.token_length:}
                //byte_length += 4 + 4 * instr.token_ids.length;
                //byte_sequence.push("scan_until", ...instr.token_ids);
             }
             6=> { //InstructionType.scan_until:}
                //byte_length += 4 + 4 * instr.token_ids.length;
                //byte_sequence.push("scan_until", ...instr.token_ids);
             }
             7=> { //InstructionType.pop: }
                kernel_state.stack_pointer -= instruction & 0xFFFFFFF;
             }
             8=> { //InstructionType.reduce: }

                let high = (instruction >> 16) & 0xFFFF;

                let low = (instruction) & 0xFFFF;

                kernel_state.add_rule(low);

                if (low & 0x4) == 0x4 {
                    kernel_state.add_rule(high & 0xFFF);
                }
            }
             9=> { //InstructionType.repeat: 
                kernel_state.stack_pointer += 1;
             }
            //Fail instructions
             10=> { return (true, prod );}
             11=> { return (true, prod );}
             12=> { return (true, prod );}
             13=> { return (true, prod );}
             14=> { return (true, prod );}
             15=> { return (true, prod );}
        }
    }

    return ( false, prod );
}


fn getTokenInfo(
    alpha: u32,
    gamma: u32,
    auto_accept_with_peek: bool,
    auto_consume_with_peek: bool,
    basis__: u32,
    prod: u32,
    &mut kernel_state: KernelState,
)->(u32, u32) {

    let input_value: i32 = 0;

    let input_type = (alpha >> 12) & 0xF;

    let lexer = kernel_state.lexer_stack[kernel_state.lexer_pointer];

    let lexer_pointer = kernel_state.lexer_pointer;

    if input_type == 2 { // Lexer token id input

        let tk_row = gamma >> 16;

        let skip_row = gamma & 0xFFFF;

        let token_transition = (alpha >> 4) & 0xF;

        match token_transition & 0xF {
             0=>  {/*do nothing */ }
             1=> /* set next peek lexer */ /* set next peek lexer *//* set next peek lexer */ /* set next peek lexer */ {

                let prev_lexer = kernel_state.lexer_stack[(kernel_state.lexer_pointer)];

                kernel_state.lexer_pointer += 1;

                lexer = kernel_state.lexer_stack[(kernel_state.lexer_pointer)];

                lexer.sync(prev_lexer);

                lexer.next();

                kernel_state.tk_scan(lexer, tk_row, skip_row);

                lexer_pointer = kernel_state.lexer_pointer;

            } 

             2=> /* set primary lexer */{

                let consume_index = kernel_state.lexer_pointer >> 16;
                let peek_level = kernel_state.lexer_pointer & 0xFFFF;

                if (peek_level - consume_index) > 0
                    &&
                    auto_accept_with_peek {

                    lexer = kernel_state.lexer_stack[consume_index];

                    lexer_pointer = consume_index;

                    if auto_consume_with_peek {
                        kernel_state.lexer_pointer += 1 << 16;
                        if consume_index > 0{
                            kernel_state.lexer_stack[0].sync(kernel_state.lexer_stack[consume_index + 1]);
                        }
                    } else {
                        kernel_state.lexer_stack[0].sync(kernel_state.lexer_stack[consume_index]);
                        lexer_pointer = 0;
                    }

                    lexer._type = basis__;

                } else {

                    kernel_state.lexer_pointer = 0;

                    lexer = kernel_state.lexer_stack[0];

                    kernel_state.tk_scan(lexer, tk_row, skip_row);

                    lexer_pointer = 0;

                }}
              
             3=> {/*do nothing */ }
        }

        input_value = lexer._type - basis__;

    } else {
        // Production id input
        input_value = prod - basis__;
    }

    ( input_value, lexer_pointer )
}


fn state_executor(
    state_pointer: u32,
    mut prod: u32,
   kernel_state:&mut  KernelState,
   kernel_states_repo:&mut  KernelStateBuffer,
)-> (bool, u32){

    let mut fail_mode = false;

    // Decode state information and proceed run either the basic
    // state executor or the table executor (scanner executor is 
    // not yet implemented )
    let alpha = kernel_state.state_buffer[state_pointer];

    let beta = kernel_state.state_buffer[state_pointer + 1];

    let gamma = kernel_state.state_buffer[state_pointer + 2];

    let delta = kernel_state.state_buffer[state_pointer + 3];


    // If the state value is true then increment stack pointer
    // after setting the stack pointer with the fail state value.
    // However, if the previous state is the same as the failure state,
    // do not increment. This prevents the stack from needlessly growing
    // from repeating states that are linked to failures states. 

    let previous_state = kernel_state.state_stack[kernel_state.stack_pointer];

    kernel_state.state_stack[kernel_state.stack_pointer + 1] = beta;

    let failure_bit = (alpha & alpha_increment_stack_pointer_mask) & +((previous_state ^ beta) > 0);

    kernel_state.stack_pointer += failure_bit;

    let auto_accept_with_peek = (alpha & alpha_auto_accept_with_peek_mask) > 0;
    let auto_consume_with_peek = (alpha & alpha_auto_consume_with_peek_mask) > 0;

    // Main instruction process ----------------------
    let process_type = (alpha >> 8) & 0xF;


    match process_type {
         0=> {}
         1=> //basic 
            {
                let lexer_pointer = kernel_state.lexer_pointer;
                // The instructions start at the 16 byte offset and 
                // is directly handled by the instruction executor
                ( fail_mode, prod) = instruction_executor(
                    state_pointer + 4,
                    prod,
                    lexer_pointer,
                    kernel_state,
                    kernel_states_repo
                );

            } 
         2=> //table 
            {
                let basis__ = (delta >> 16) & 0xFFFF;

                let ( input_value, lexer_pointer ) =
                    getTokenInfo(alpha, kernel_state, gamma, auto_accept_with_peek, auto_consume_with_peek, basis__, prod);

                let number_of_rows = alpha >> 16;

                let row_size = delta & 0xFFFF;

                if (input_value >= 0 && input_value < number_of_rows) {
                    ( fail_mode, prod)  = instruction_executor(
                        state_pointer + 4 + input_value * row_size,
                        prod,
                        lexer_pointer,
                        kernel_state,
                        kernel_states_repo
                    );
                } else {

                    // Use default behavior found at the end of the 
                    // state table
                    ( fail_mode, prod) = instruction_executor(
                        state_pointer + 4 + number_of_rows * row_size,
                        prod,
                        lexer_pointer,
                        kernel_state,
                        kernel_states_repo
                    );
                }

            } 
         3=> //scanner 
            {
                let ( input_value, lexer_pointer ) =
                    getTokenInfo(alpha, kernel_state, gamma, auto_accept_with_peek, auto_consume_with_peek, 0, prod);

                let scan_field_length = alpha >> 16;

                let instruction_field_size = delta & 0xFFFF;

                let i = state_pointer + 4;

                let scan_field_end = i + scan_field_length;

                let instruction_field_start = scan_field_end;

                //Default instructions
                let selected_instruction_field_start = instruction_field_start + instruction_field_size;

                while (i < scan_field_end) {

                    if (kernel_state.state_buffer[i] == input_value) {
                        selected_instruction_field_start = instruction_field_start + kernel_state.state_buffer[i + 1];
                        break;
                    }
                    i += 2;
                }

                ( fail_mode, prod ) = instruction_executor(
                    selected_instruction_field_start,
                    prod,
                    lexer_pointer,
                    kernel_state,
                    kernel_states_repo
                );

            } 
    }

    (fail_mode, prod)
}


fn kernel_executor(
    kernel_state: &mut KernelState,
    kernel_states_repo:&mut  KernelStateBuffer,
) -> bool{

    //Kernel
    //Input
    let mut fail_mode = false;
    let mut prod = 0;

    let last_good_state = 0;

    loop {

        let i = 0;

        while i < 4 {
            i+=1;
            // Hint to the compiler to inline this section 4 times
            let state = kernel_state.state_stack[kernel_state.stack_pointer];

            kernel_state.stack_pointer -= 1;

            if state > 0 {

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

                let state_pointer = state & state_index_mask;

                if !fail_mode && ((state & fail_state_mask) == 0) {

                    ( fail_mode, prod ) = state_executor(
                        state_pointer,
                        prod,
                        kernel_state,
                        kernel_states_repo
                    );

                    last_good_state = state_pointer;

                } else if (state & fail_state_mask) != 0 {

                    ( fail_mode, prod ) = state_executor(
                        state_pointer,
                        prod,
                        kernel_state,
                        kernel_states_repo
                    );
                }
            }
        }

        if kernel_state.stack_pointer < 1 {
            break;
        }
    }

     fail_mode

}

fn run(
    process_buffer: &mut KernelStateBuffer,
    invalid_buffer: &mut KernelStateBuffer,
    valid_buffer: &mut KernelStateBuffer,
) {

    while process_buffer.len() > 0 {

        let i:usize = 0;

        while i < process_buffer.len() {

            let kernel_state: &mut KernelState = process_buffer.data[i];

            let FAILED = kernel_executor(kernel_state, invalid_buffer);

            kernel_state.COMPLETED = true;

            kernel_state.VALID = !FAILED;

            match kernel_state.VALID {
                true => {
                    valid_buffer
                        .add_state_pointer_and_sort(process_buffer.remove_state_at_index(i));
                }
                false => {
                    invalid_buffer
                        .add_state_pointer_and_sort(process_buffer.remove_state_at_index(i));
                }
            }
        }

        while invalid_buffer.have_valid() {
            match invalid_buffer.remove_valid_parser_state() {
                Some(x) => process_buffer.add_state_pointer(x),
                None => (),
            }
        }

    }
}

pub fn recognize<'a>(
    state_buffer: &'a [u32],
    input_buffer: &'a [u8],
    input_byte_length: u32,
    production_state_pointer: i32,
    scanner_function: ScannerFunction,
) -> (KernelStateBuffer<'a>, KernelStateBuffer<'a>) {

    let mut process_buffer = KernelStateBuffer::new();
    let mut invalid_buffer = KernelStateBuffer::new();
    let mut valid_buffer = KernelStateBuffer::new();

    let state = process_buffer.create_state(
        state_buffer,
        input_buffer,
        input_byte_length,
        scanner_function
    );

    state.state_stack[0] = 0;
    state.state_stack[1] = production_state_pointer;
    state.stack_pointer = 1;

    run(
        &mut process_buffer,
        &mut invalid_buffer,
        &mut valid_buffer
    );

    return (valid_buffer, invalid_buffer);
}
