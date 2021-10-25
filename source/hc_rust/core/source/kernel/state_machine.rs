use std::cell::RefCell;

use super::lexer::Lexer;
use super::state::KernelState;
use super::state_buffer::KernelStateBuffer;

//Global Constants
const state_index_mask: u32 = (1 << 24) - 1;
const fail_state_mask: u32 = 1 << 27;
const normal_state_mask: u32 = 1 << 26;
const goto_state_mask: u32 = 1 << 25;
const alpha_increment_stack_pointer_mask: u32 = 1 << 0;
const alpha_have_default_action_mask: u32 = 1 << 1;
const production_scope_pop_pointer: u32 = 2;
const instruction_pointer_mask: u32 = 0xFFFFFF;

thread_local! {
    static scanner_invalid_buffer: RefCell<KernelStateBuffer> = RefCell::new(KernelStateBuffer::new());
}

pub fn run(
    instructions: *const u32,
    instructions_length: usize,
    input_buffer: *const u8,
    input_byte_length: usize,
    start_state_pointer: u32,
) -> (KernelStateBuffer, KernelStateBuffer) {
    let mut process_buffer: KernelStateBuffer = KernelStateBuffer::new();
    let mut invalid_buffer: KernelStateBuffer = KernelStateBuffer::new();
    let mut valid_buffer: KernelStateBuffer = KernelStateBuffer::new();

    let state = KernelStateBuffer::create_state(
        &mut process_buffer,
        instructions,
        instructions_length,
        input_buffer,
        input_byte_length,
    );

    state.state_stack[0] = 0;
    state.state_stack[1] = start_state_pointer;
    state.stack_pointer = 1;

    executeParseProcess(&mut process_buffer, &mut invalid_buffer, &mut valid_buffer);

    (valid_buffer, invalid_buffer)
}

fn executeParseProcess(
    pb: &mut KernelStateBuffer,
    ib: &mut KernelStateBuffer,
    vb: &mut KernelStateBuffer,
) {
    while pb.len() > 0 {
        let i: usize = 0;

        while i < pb.len() {
            let kernel_state: &mut KernelState = pb.data[i].as_mut();

            let FAILED = kernel_executor(kernel_state, ib);

            kernel_state.COMPLETED = true;

            kernel_state.VALID = FAILED == 0;

            if kernel_state.lexer.byte_offset < kernel_state.lexer.input.len() as u32 {
                kernel_state.VALID = false;
            }

            if kernel_state.FORKED {
                KernelStateBuffer::add_state_pointer_and_sort(vb, pb.remove_state_at_index(i));
            } else {
                match kernel_state.VALID {
                    true => {
                        KernelStateBuffer::add_state_pointer_and_sort(
                            vb,
                            pb.remove_state_at_index(i),
                        );
                    }
                    false => {
                        KernelStateBuffer::add_state_pointer_and_sort(
                            ib,
                            pb.remove_state_at_index(i),
                        );
                    }
                }
            }
        }

        while ib.have_valid() {
            match ib.remove_valid_parser_state() {
                Some(x) => KernelStateBuffer::add_state_pointer(pb, x),
                None => (),
            }
        }
    }
}

fn kernel_executor(
    kernel_state: &mut KernelState,
    kernel_states_repo: &mut KernelStateBuffer,
) -> u32 {
    let mut fail_mode: u32 = 0;
    loop {
        for _ in 0..4 {
            let state = kernel_state.pop_state();

            if state > 0 {
                let mask_gate = normal_state_mask << fail_mode;

                if (mask_gate & state) != 0 {
                    fail_mode =
                        instruction_executor(state, fail_mode, kernel_state, kernel_states_repo);

                    coz::progress!();
                }
            } else {
                break;
            }
        }

        if (kernel_state.stack_pointer as i32) < 1 {
            break;
        }
    }
    fail_mode
}

fn instruction_executor(
    state_pointer: u32,
    fail_mode: u32,
    kernel_state: &mut KernelState,
    kernel_states_repo: &mut KernelStateBuffer,
) -> u32 {
    let mut index = (state_pointer & state_index_mask) as usize;

    let recover_data = kernel_state.meta_stack[(kernel_state.stack_pointer as usize) + 1];

    loop {
        let instruction = kernel_state.instructions[index];

        index += 1;

        match ((instruction >> 28) & 0xF) as u8 {
            1 => {
                consume(instruction, kernel_state);
            }

            2 => {
                goto(instruction, kernel_state);
            }

            3 => {
                set_production(instruction, kernel_state);
            }

            4 => {
                reduce(instruction, recover_data, kernel_state);
            }

            5 => {
                index = set_token(index, instruction, kernel_state);
            }

            6 => {
                index = fork(index, instruction, kernel_state, kernel_states_repo);
            }

            7 => {
                index = scan_to(index, instruction, kernel_state);
            }

            8 => {
                set_production_scope(instruction, kernel_state);
            }

            9 => {
                index = index_jump(index, instruction, kernel_state);
            }

            10 => {
                index = hash_jump(index, instruction, kernel_state);
            }

            11 => {
                push_fail_state(instruction, kernel_state);
            }

            12 => {
                index = repeat(index, instruction);
            }

            13 => {
                index = not_in_scope(index, instruction, kernel_state);
            }

            14 => { /*NOOP*/ }

            15 => {
                return advanced_return(instruction, fail_mode, kernel_state);
            }
            0 | _ => {
                return pass();
            }
        }
    }
}

fn pass() -> u32 {
    return 0;
}

fn consume(instruction: u32, kernel_state: &mut KernelState) {
    if (instruction & 1) != 0 {
        let lexer = &mut kernel_state.lexer;
        lexer.token_length = 0;
        lexer.byte_length = 0;
    }

    kernel_state.consume();
}

fn goto(instruction: u32, kernel_state: &mut KernelState) {
    kernel_state.push_state(instruction);
}

fn set_production(instruction: u32, kernel_state: &mut KernelState) {
    kernel_state.prod = instruction & 0xFFFFFFF;
}

fn set_production_scope(instruction: u32, kernel_state: &mut KernelState) {
    let prod_scope = instruction & 0xFFFFFFF;

    kernel_state.meta_stack[kernel_state.stack_pointer as usize] =
        prod_scope | (kernel_state.meta_stack[kernel_state.stack_pointer as usize] & 0xFFFF0000);
}

fn reduce(instruction: u32, recover_data: u32, kernel_state: &mut KernelState) {
    let low = (instruction) & 0xFFFF;

    if (low & 0xFFFF) == 0xFFFF {
        let accumulated_symbols = kernel_state.symbol_accumulator - (recover_data & 0xFFFF0000);

        let len = accumulated_symbols >> 16;

        let fn_id = (instruction >> 16) & 0x0FFF;

        //Extract accumulated symbols inform
        kernel_state.add_reduce(len as u32, fn_id);
    } else {
        kernel_state.add_rule(low);

        if (low & 0x4) == 0x4 {
            let high_len = (instruction >> 16) & 0xFFFF;

            kernel_state.symbol_accumulator -= (high_len - 1) << 16;

            kernel_state.add_rule(high_len & 0xFFF);
        } else {
            kernel_state.symbol_accumulator -= (((low >> 3) & 0x1F) - 1) << 16;

            kernel_state.meta_stack[kernel_state.stack_pointer as usize] = (kernel_state
                .symbol_accumulator
                | (kernel_state.meta_stack[kernel_state.stack_pointer as usize] & 0xFFFF))
                as u32;
        }
    }
}

fn repeat(mut index: usize, instruction: u32) -> usize {
    let origin_offset = 0xFFFFFFF & instruction;

    index -= origin_offset as usize;

    return index;
}

fn not_in_scope(mut index: usize, instruction: u32, kernel_state: &mut KernelState) -> usize {
    let length = instruction & 0xFFFFFFF;

    let mut RUN = true;

    let start = index;

    let end = index + length as usize;

    index += length as usize;

    let mut j = 0;

    while j <= kernel_state.stack_pointer {
        let prod = kernel_state.meta_stack[j as usize] & 0xFFFF;

        for i in start..end {
            if kernel_state.instructions[i as usize] == prod {
                RUN = false;
                break;
            }
        }

        if !RUN {
            break;
        };

        j += 1
    }

    if j >= 0 && j <= kernel_state.stack_pointer {
        return 1;
    }

    return index;
}

fn push_fail_state(instruction: u32, kernel_state: &mut KernelState) {
    let fail_state_pointer = instruction;

    let current_state = kernel_state.read_state() & instruction_pointer_mask;
    //Only need to set new failure state if the previous state
    //Is not identical to the pending fail state.
    if current_state != ((fail_state_pointer) & instruction_pointer_mask) {
        kernel_state.push_state(fail_state_pointer);
    } else {
        kernel_state.swap_state(fail_state_pointer);
    }
}

fn set_token(mut index: usize, instruction: u32, kernel_state: &mut KernelState) -> usize {
    let length = instruction & 0xFFFFFF;

    if (instruction & 0x08000000) != 0 {
        let data = kernel_state.instructions;

        for i in 0..length {
            let lexer = kernel_state.lexer;
            kernel_state.last_byte_offset = lexer.byte_offset + lexer.byte_length;
            kernel_state.last_token_offset = lexer.token_offset + lexer.token_length;
            kernel_state.last_token_type = data[(i as usize + index) as usize] as i32;
            break;
        }

        index += length as usize
    } else {
        kernel_state.lexer.token_length = length;
        kernel_state.lexer.byte_length = length;
        kernel_state.lexer.token_length = length;
        kernel_state.lexer.byte_length = length;
    }

    index
}

fn advanced_return(instruction: u32, fail_mode: u32, kernel_state: &mut KernelState) -> u32 {
    if (instruction & 1) != 0 {
        return fail_mode;
    }

    if !kernel_state.lexer.END() {
        //kernel_state.lexer._type = 0;
        //kernel_state.lexer.token_length = 1;
        //kernel_state.lexer.byte_length = 1;
    }

    1 /* true */
}

fn fork(
    mut index: usize,
    instruction: u32,
    origin_kernel_state: &mut KernelState,
    origin_kernel_state_repo: &mut KernelStateBuffer,
) -> usize {
    let mut vb = KernelStateBuffer::new();
    let mut ib = KernelStateBuffer::new();
    let mut pb = KernelStateBuffer::new();
    let mut length = instruction & 0xFFFFFFF;

    origin_kernel_state.FORKED = true;

    while length > 0 {
        let kernel_state = KernelState::fork(origin_kernel_state, &mut pb);

        let new_state = origin_kernel_state.instructions[index];

        kernel_state.push_state(new_state);

        length -= 1;
        index += 1;
    }

    while pb.len() > 0 {
        let i = 0;

        while i < pb.len() {
            if let Some(kernel_state) = KernelStateBuffer::get_mut_state(&mut pb, i) {
                let FAILED = kernel_executor(kernel_state, &mut ib);

                kernel_state.COMPLETED = true;

                kernel_state.VALID = FAILED == 0;

                if kernel_state.FORKED {
                    pb.remove_state_at_index(i);
                }
            }
        }

        while ib.have_valid() {
            KernelStateBuffer::add_state_pointer_and_sort(&mut pb, ib.remove_state_at_index(i));
        }
    }

    if vb.len() > 0 {
        if vb.len() == 1 {
            //Continue Parsing from the end of the previous KernelState
            let valid_state = KernelStateBuffer::remove_valid_parser_state(&mut vb);

            if let Some(mut tip_box) = valid_state {
                let tip = tip_box.as_mut();
                //origin_kernel_state.next.push(tip);

                //Synch tip with the origin_kernel_state
                origin_kernel_state.transfer_state_stack(tip);

                //Set the tip to point to the next set of instructions
                //after the fork.
                tip.push_state(index as u32);

                //Set index so that it points to the pass instruction block;

                KernelStateBuffer::add_state_pointer_and_sort(origin_kernel_state_repo, tip_box);
            }
            index = 0;
        } else {
            /* let furthest_byte = vb.data[0].lexer.byte_offset;

            let furthest_index = 0;

            let furthest_matching_count = 1;

            for i in 1..vb.len() {
                if vb.data[i].lexer.byte_offset != furthest_byte {
                    // Extract the longest parsers
                    for i in 1..vb.len() {
                        let len = vb.data[i].lexer.byte_offset;

                        if len > furthest_byte {
                            furthest_byte = len;
                            furthest_index = i;
                            furthest_matching_count = 1;
                        } else if len == furthest_byte {
                            furthest_matching_count += 1;
                        }
                    }

                    if furthest_matching_count == 1 {
                        //Continue Parsing from the end of the previous KernelState
                        //Continue Parsing from the end of the previous KernelState
                        let tip = vb.data[furthest_index];

                        //origin_kernel_state.next.push(tip);

                        //Synch tip with the origin_kernel_state
                        origin_kernel_state.transfer_state_stack(tip);

                        //Set the tip to point to the next set of instructions
                        //after the fork.
                        tip.push_state(index);

                        KernelStateBuffer::add_state_pointer_and_sort(
                            origin_kernel_state_repo,
                            tip_box,
                        );

                        //Set index so that it points to the null instruction block;
                        index = 0;
                    } else {
                        panic!("Multiple uneven parse paths exist, no resolution mechanism has been implemented for this situation. Exiting");
                    }
                    break;
                } else if i == vb.len() - 1 {
                    panic!("Multiple even parse paths exist, no resolution mechanism has been implemented for this situation. Exiting");
                }
            } */
        }
    } else {
        //Continue Parsing from the end of the previous KernelState
        let mut tip_box = KernelStateBuffer::remove_state_at_index(&mut ib, 0);

        let tip = tip_box.as_mut();
        //origin_kernel_state.next.push(tip);

        //Synch tip with the origin_kernel_state
        origin_kernel_state.transfer_state_stack(tip);

        //Set the tip to point to the next set of instructions
        //after the fork.
        tip.push_state(normal_state_mask | fail_state_mask | 1);

        KernelStateBuffer::add_state_pointer(origin_kernel_state_repo, tip_box);

        //Set index so that it points to the pass instruction block;
        index = 0;
    }

    // Link valid states to the origin state
    // Then create a new forward state the linked states reference.

    index
}

fn scan_to(mut index: usize, instruction: u32, kernel_state: &mut KernelState) -> usize {
    let length = instruction & 0xFFFF;

    let scanner_start_pointer = kernel_state.instructions[index];

    index += 1;

    let scan_back = (instruction & 0x00100000) > 0;

    let lexer = &mut kernel_state.lexer;

    let start_byte_offset = lexer.prev_byte_offset;

    let start_token_offset = lexer.prev_token_offset;

    lexer.byte_length = 1;

    let mut RUN = true;

    let start = index;

    let end = index + length as usize;

    let mut end_offset = lexer.input.len() as u32;

    index += length as usize;

    let mut temp_lexer = lexer.copy_in_place();

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
        {
            scanner(
                kernel_state,
                &mut { *(&kernel_state.lexer) },
                scanner_start_pointer,
            );
        };
        for i in start..end {
            if temp_lexer.token_type == kernel_state.instructions[i] as i32 {
                RUN = false;
                break;
            }
        }

        if !RUN {
            break;
        }

        if temp_lexer.byte_offset >= end_offset {
            return 1;
        }

        temp_lexer.next();
    }

    if !scan_back {
        //Reset peek stack;
        kernel_state.lexer.peek_unroll_sync(&mut temp_lexer);
        kernel_state.lexer.prev_byte_offset = start_byte_offset;
        kernel_state.lexer.prev_token_offset = start_token_offset;
    }

    return index;
}

fn hash_jump(mut index: usize, instruction: u32, kernel_state: &mut KernelState) -> usize {
    let input_type = (instruction >> 22) & 0x7;

    let token_transition = (instruction >> 26) & 0x3;

    let scanner_start_pointer = kernel_state.instructions[index];

    let table_data = kernel_state.instructions[index + 1];

    index += 2;

    let modulus = (1 << ((table_data >> 16) & 0xFFFF)) - 1;

    let table_size = (table_data) & 0xFFFF;

    let hash_table_start = index as u32;

    let instruction_field_start = hash_table_start + table_size;

    let instruction_field_size = instruction & 0xFFFF;

    let input_value = get_token_info(
        kernel_state,
        input_type,
        token_transition,
        scanner_start_pointer,
    ) as u32;

    let mut hash_index = input_value & modulus;

    loop {
        let cell = kernel_state.instructions[(hash_table_start + hash_index) as usize];

        let value = cell & 0x7FF;

        let next = ((cell >> 22) & 0x3FF) as i32 - 512;

        if value == input_value {
            let instruction_start = (cell >> 11) & 0x7FF;

            return (instruction_field_start + instruction_start) as usize;
        }

        if next == 0 {
            //Failure
            return (instruction_field_size + instruction_field_start) as usize;
        }

        hash_index = (hash_index as i32 + next) as u32;
    }
}

fn index_jump(mut index: usize, instruction: u32, kernel_state: &mut KernelState) -> usize {
    let scanner_start_pointer = kernel_state.instructions[index];

    let table_data = kernel_state.instructions[index + 1];

    index += 2;

    let basis__ = instruction & 0xFFFF;

    let input_type = (instruction >> 22) & 0x7;

    let token_transition = (instruction >> 26) & 0x3;

    let input_value = (get_token_info(
        kernel_state,
        input_type,
        token_transition,
        scanner_start_pointer,
    ) - (basis__ as i32)) as u32;

    let number_of_rows = table_data >> 16;

    let row_size = table_data & 0xFFFF;

    if input_value < number_of_rows {
        index + (input_value * row_size + row_size) as usize
    } else {
        // Use default behavior found at the beginning of the
        // jump table
        index
    }
}

fn get_token_info(
    ks: &mut KernelState,
    input_type: u32,
    token_transition: u32,
    scanner_start_pointer: u32,
) -> i32 {
    if input_type > 0 {
        match token_transition {
            1 => ks.lexer.peek(),

            2 => ks.lexer.reset(),
            _ => { /* do nothing */ }
        }

        match input_type {
            2 => ks.lexer.class() as i32,
            3 => ks.lexer.codepoint() as i32,
            4 => ks.lexer.byte() as i32,
            1 | _ => {
                let mut lexer = ks.lexer.clone();

                scanner(ks, &mut lexer, scanner_start_pointer);

                ks.lexer.clone_from(&lexer);

                ks.lexer.token_type
            }
        }
    } else {
        ks.prod as i32
    }
}

pub fn scanner(root_state: &KernelState, lexer: &mut Lexer, scanner_start_pointer: u32) {
    scanner_invalid_buffer.with(|cell| {
        if let Some(ib) = unsafe { cell.as_ptr().as_mut() } {
            if lexer.token_type <= 0 {
                let mut box_state = KernelStateBuffer::get_recycled_kernel_state(ib, root_state);

                let state = box_state.as_mut();

                loop {
                    state.state_stack[0] = 0;

                    state.state = 0;

                    state.push_state(scanner_start_pointer);

                    state.lexer.scanner_sync(lexer);

                    if kernel_executor(state, ib) == 0 {
                        if state.last_token_type == 9999 {
                            lexer.byte_offset = state.lexer.byte_offset;
                            lexer.token_offset = state.lexer.token_offset;
                            state.reset()
                        } else {
                            let sync_lexer = state.lexer;
                            lexer.token_type = state.last_token_type;
                            lexer.byte_length = sync_lexer.byte_offset - lexer.byte_offset;
                            lexer.token_length = sync_lexer.token_offset - lexer.token_offset;
                            break;
                        }
                    } else {
                        break;
                    }
                }
                state.VALID = false;

                KernelStateBuffer::add_state_pointer(ib, box_state);
            }
        }
    })
}
