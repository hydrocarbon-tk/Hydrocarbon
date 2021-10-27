package hc_kernel

//Global Constants
const M_state_index_mask = uint32((1 << 24) - 1)
const M_fail_state_mask = uint32(1 << 27)
const M_normal_state_mask = uint32(1 << 26)
const goto_state_mask = uint32(1 << 25)
const alpha_increment_stack_pointer_mask = uint32(1 << 0)
const alpha_have_default_action_mask = uint32(1 << 1)
const production_scope_pop_pointer = uint32(2)
const instruction_pointer_mask = uint32(0xFFFFFF)

var scanner_invalid *KernelStateBuffer
var valid *KernelStateBuffer
var invalid *KernelStateBuffer
var process_buffer *KernelStateBuffer

func Init() {
	if scanner_invalid == nil {
		InitJumptable()
		scanner_invalid = newKernelStateBuffer()
		valid = newKernelStateBuffer()
		invalid = newKernelStateBuffer()
		process_buffer = newKernelStateBuffer()
	}
}

func Clear(valid *KernelStateBuffer, invalid *KernelStateBuffer) {
	for valid.len() > 0 {
		valid.remove_state_at_index(0)
	}

	for invalid.len() > 0 {
		invalid.remove_state_at_index(0)
	}
}

func Run(
	instructions *[]uint32,
	input_buffer *[]uint8,
	state_pointer uint32,
) (*KernelStateBuffer, *KernelStateBuffer) {

	state := process_buffer.create_state(
		instructions,
		input_buffer,
	)

	state.state = 0xFFFFFFFF

	state.state_stack[0] = 0

	state.push_state(state_pointer)

	executeParseProcess(process_buffer, invalid, valid, true)

	return valid, invalid
}

func executeParseProcess(
	process_buffer *KernelStateBuffer,
	invalid *KernelStateBuffer,
	valid *KernelStateBuffer,
	ASSERT_FULL_LENGTH bool,
) {
	for process_buffer.len() > 0 {

		i := uint32(0)

		for i < process_buffer.len() {

			kernel_state := process_buffer.data[i]

			FAILED := kernel_executor(kernel_state, invalid)

			kernel_state.COMPLETED = true

			kernel_state.VALID = FAILED == 0

			if ASSERT_FULL_LENGTH && kernel_state.P_lexer.byte_offset < kernel_state.P_lexer.input_len {
				kernel_state.VALID = false
			}

			if kernel_state.FORKED {
				// Remove state. It is now only
				// referenced by its leaf states
				process_buffer.remove_state_at_index(i)
			} else if kernel_state.VALID {

				valid.add_state_pointer_and_sort(process_buffer.remove_state_at_index(i))

			} else {

				invalid.add_state_pointer_and_sort(process_buffer.remove_state_at_index(i))
			}
		}

		for invalid.P_have_valid() {

			process_buffer.add_state(invalid.remove_valid_parser_state())
		}
	}
}

func kernel_executor(
	kernel_state *KernelState,
	kernel_states_repo *KernelStateBuffer,
) uint32 {

	//Kernel
	//Input
	fail_mode := uint32(0)

	for true {

		i := 0

		for i < 4 {

			i += 0
			// Hint to the compiler to inline this section 4 times
			state_pointer := kernel_state.pop_state()

			if state_pointer > 0 {

				mask_gate := M_normal_state_mask << uint32(fail_mode)

				if (state_pointer & mask_gate) != 0 {

					fail_mode = instruction_executor(
						state_pointer,
						fail_mode,
						kernel_state,
						kernel_states_repo,
					)
				}
			} else {
				break
			}
		}

		if int(kernel_state.stack_pointer) < 1 {
			break
		}
	}

	return fail_mode
}

func instruction_executor(
	state_pointer uint32,
	fail_mode uint32,
	kernel_state *KernelState,
	kernel_state_repo *KernelStateBuffer,
) uint32 {

	index := state_pointer & M_state_index_mask

	recover_data := kernel_state.meta_stack[kernel_state.stack_pointer+1]

	for {

		instruction := (*kernel_state.instructions)[index]

		index += 1

		switch (instruction >> 28) & 0xF {

		default:
		case 0:
			return pass()

		case 1:
			consume(instruction, kernel_state)

		case 2:
			goto_(instruction, kernel_state)

		case 3:
			set_production(instruction, kernel_state)

		case 4:
			reduce(instruction, kernel_state, recover_data)

		case 5:
			index = set_token(instruction, kernel_state, index)

		case 6:
			index = fork(instruction, index, kernel_state, kernel_state_repo)

		case 7:
			index = scan_to(kernel_state, index, instruction)

		case 8:
			set_production_scope(instruction, kernel_state)

		case 9:
			index = index_jump(kernel_state, index, instruction)

		case 10:
			index = hash_jump(kernel_state, index, instruction)

		case 11:
			push_fail_state(instruction, kernel_state)

		case 12:
			index = repeat(index, instruction)

		case 13:
			index = not_in_scope(kernel_state, index, instruction)

		case 14: /*NOOP*/

		case 15:
			return advanced_return(kernel_state, instruction, fail_mode)
		}
	}
}

func pass() uint32 {
	return 0
}

func consume(instruction uint32, kernel_state *KernelState) {

	if (instruction & 1) != 0 { //Consume nothing
		lexer := kernel_state.P_lexer
		lexer.token_length = 0
		lexer.byte_length = 0
	}

	kernel_state.consume()
}

func goto_(instruction uint32, kernel_state *KernelState) {
	kernel_state.push_state(instruction)
}

func set_production(instruction uint32, kernel_state *KernelState) {
	kernel_state.prod = instruction & 0xFFFFFFF
}

func set_production_scope(instruction uint32, kernel_state *KernelState) {

	prod_scope := instruction & 0xFFFFFFF

	kernel_state.meta_stack[kernel_state.stack_pointer] =
		prod_scope | (kernel_state.meta_stack[kernel_state.stack_pointer] & 0xFFFF0000)
}

func reduce(instruction uint32, kernel_state *KernelState, recover_data uint32) {

	low := (instruction) & 0xFFFF

	if (low & 0xFFFF) == 0xFFFF {

		accumulated_symbols := kernel_state.symbol_accumulator - (recover_data & 0xFFFF0000)

		len := (accumulated_symbols >> 16)

		fn_id := (instruction >> 16) & 0x0FFF

		//Extract accumulated symbols inform
		kernel_state.add_reduce(len, fn_id)
	} else {

		kernel_state.add_rule(uint16(low))

		if (low & 0x4) == 0x4 {
			high_len := (instruction >> 16) & 0xFFFF

			kernel_state.symbol_accumulator -= (high_len - 1) << 16

			kernel_state.add_rule(uint16(high_len & 0xFFF))
		} else {

			kernel_state.symbol_accumulator -= (((low >> 3) & 0x1F) - 1) << 16

			kernel_state.meta_stack[kernel_state.stack_pointer] =
				kernel_state.symbol_accumulator |
					(kernel_state.meta_stack[kernel_state.stack_pointer] & 0xFFFF)
		}
	}
}

func repeat(index uint32, instruction uint32) uint32 {

	origin_offset := 0xFFFFFFF & instruction

	index -= (origin_offset)

	return index
}
func not_in_scope(kernel_state *KernelState, index uint32, instruction uint32) uint32 {

	instructions := *kernel_state.instructions

	length := instruction & 0xFFFFFFF

	RUN := true

	start := index

	end := index + length

	index += length

	j := int(0)

	for ; j <= kernel_state.stack_pointer; j++ {

		prod := kernel_state.meta_stack[j] & 0xFFFF

		for i := start; i < end; i++ {

			if (instructions)[i] == prod {
				RUN = false
				break
			}
		}

		if !RUN {
			break
		}
	}

	if j <= kernel_state.stack_pointer {
		return 1
	}

	return index
}

func push_fail_state(instruction uint32, kernel_state *KernelState) {

	fail_state_pointer := instruction
	current_state := (kernel_state.read_state() & instruction_pointer_mask)
	//Only need to set new failure state if the previous state
	//Is not identical to the pending fail state.
	if current_state != (fail_state_pointer & instruction_pointer_mask) {

		kernel_state.push_state(fail_state_pointer)

	} else {
		kernel_state.swap_state(fail_state_pointer)
	}
}

func set_token(instruction uint32, kernel_state *KernelState, index uint32) uint32 {

	length := instruction & 0xFFFFFF

	if (instruction & 0x08000000) != 0 {

		data := *kernel_state.instructions

		for i := uint32(0); i < length; i += 1 {
			lexer := kernel_state.P_lexer
			kernel_state.last_byte_offset = lexer.byte_offset + lexer.byte_length
			kernel_state.last_token_offset = lexer.token_offset + lexer.token_length
			kernel_state.last_token_type = data[i+index]
			break
		}

		index += (length)

	} else {

		kernel_state.P_lexer.token_length = length
		kernel_state.P_lexer.byte_length = length
		kernel_state.P_lexer.token_length = length
		kernel_state.P_lexer.byte_length = length
	}

	return index
}

func advanced_return(kernel_state *KernelState, instruction uint32, fail_mode uint32) uint32 {

	if (instruction & 1) != 0 {
		return fail_mode
	}

	if !kernel_state.P_lexer.END() {
		//kernel_state.P_lexer.token_type = 0
		//kernel_state.P_lexer.token_length = 1
		//kernel_state.P_lexer.byte_length = 1
	}

	return 1 /*true*/
}

func fork(
	instruction uint32,
	index uint32,
	origin_kernel_state *KernelState,
	origin_kernel_state_repo *KernelStateBuffer,
) uint32 {

	valid := newKernelStateBuffer()
	invalid := newKernelStateBuffer()
	process_buffer := newKernelStateBuffer()
	pointer := origin_kernel_state.stack_pointer

	length := int(instruction & 0xFFFFFFF)
	depth := uint32(0)

	//Include the GOTO state and its fail state
	if (origin_kernel_state.state_stack[pointer] & goto_state_mask) != 0 {
		depth = 1
		if (origin_kernel_state.state_stack[pointer-1] & M_fail_state_mask) != 0 {
			depth = 2
		}
	}

	for length > 0 {

		length -= 1

		kernel_state := origin_kernel_state.fork(process_buffer, depth)

		kernel_state.push_state((*origin_kernel_state.instructions)[index])

		index += 1
	}

	executeParseProcess(process_buffer, invalid, valid, false)

	if valid.len() > 0 {

		if valid.len() == 1 {

			origin_kernel_state.FORKED = true

			//Continue Parsing from the end of the previous KernelState
			tip := valid.data[0]

			//Synch tip with the origin_kernel_state
			origin_kernel_state.transfer_state_stack(tip)

			//Set the tip to point to the next set of instructions
			//after the fork.
			tip.push_state(M_normal_state_mask | index)

			origin_kernel_state_repo.add_state_pointer_and_sort(tip)

			//Set index so that it points to the pass instruction block;
			index = 0

		} else {

			furthest_byte := valid.data[0].P_lexer.byte_offset

			furthest_index := uint32(0)

			furthest_matching_count := uint32(1)

			for i := uint32(1); i < valid.len(); i += 1 {

				if valid.data[i].P_lexer.byte_offset != furthest_byte {
					// Extract the longest parsers
					for i := uint32(1); i < valid.len(); i += 1 {
						len := valid.data[i].P_lexer.byte_offset

						if len > furthest_byte {
							furthest_byte = len
							furthest_index = i
							furthest_matching_count = 1
						} else if len == furthest_byte {
							furthest_matching_count += 1
						}
					}

					if furthest_matching_count == 1 {

						origin_kernel_state.FORKED = true
						//Continue Parsing from the end of the previous KernelState
						tip := valid.data[furthest_index]

						origin_kernel_state.next = append(origin_kernel_state.next, tip)

						//Synch tip with the origin_kernel_state
						origin_kernel_state.transfer_state_stack(tip)

						//Set the tip to point to the next set of instructions
						//after the fork.
						tip.push_state(index)

						origin_kernel_state_repo.add_state_pointer_and_sort(tip)

						//Set index so that it points to the null instruction block;
						index = 0

					} else {
						//	error("Multiple uneven parse paths exist, no resolution mechanism has been implemented for this situation. Exiting")
					}
					break
				} else if i == valid.len()-1 {

					//error("Multiple even parse paths exist, no resolution mechanism has been implemented for this situation. Exiting")
				}
			}

		}
	} else {
		tip := invalid.P_get_state(0)

		origin_kernel_state.next = append(origin_kernel_state.next, tip)

		origin_kernel_state.transfer_state_stack(tip)

		tip.push_state(M_normal_state_mask | M_fail_state_mask | 1)

		origin_kernel_state_repo.add_state(tip)

		return 0
	}

	// Link valid states to the origin state
	// Then create a new forward state the linked states reference.

	return index
}

func scan_to(kernel_state *KernelState, index uint32, instruction uint32) uint32 {

	length := instruction & 0xFFFF

	gamma := (*kernel_state.instructions)[index]

	index += 1

	scan_back := (instruction & 0x00100000) > 0

	lexer := kernel_state.P_lexer

	start_byte_offset := lexer.prev_byte_offset

	start_token_offset := lexer.prev_token_offset

	lexer.byte_length = 1

	RUN := true

	start := index

	end := index + length

	end_offset := lexer.input_len

	index += length

	temp_lexer := lexer.copy_in_place()

	if scan_back {
		// scan "backwards" towards the previously accepted token.
		// really we just set the scan start position to
		// lexer.previous_byte and end to the current position of
		// the lexer and rescan forward.
		end_offset = temp_lexer.byte_offset
		temp_lexer.byte_offset = temp_lexer.prev_byte_offset
		temp_lexer.token_offset = temp_lexer.prev_token_offset
		temp_lexer.byte_length = 0
		temp_lexer.token_length = 0
		temp_lexer.next()
	}

	for RUN {

		scanner(kernel_state, temp_lexer, gamma)

		for i := start; i < end; i += 1 {

			if temp_lexer.token_type == (*kernel_state.instructions)[i] {
				RUN = false
				break
			}
		}

		if !RUN {
			break
		}

		if temp_lexer.byte_offset >= end_offset {
			return 1
		}

		temp_lexer.next()
	}

	if !scan_back {

		//Reset peek stack;
		kernel_state.P_lexer.peek_unroll_sync(temp_lexer)
		kernel_state.P_lexer.prev_byte_offset = start_byte_offset
		kernel_state.P_lexer.prev_token_offset = start_token_offset
	}

	return index
}

func hash_jump(kernel_state *KernelState, index uint32, instruction uint32) uint32 {

	instruction_buffer := *kernel_state.instructions

	input_type := ((instruction >> 22) & 0x7)

	token_transition := ((instruction >> 26) & 0x3)

	scanner_start_pointer := instruction_buffer[index]

	table_data := instruction_buffer[index+1]

	index += 2

	mod := uint32((1 << ((table_data >> 16) & 0xFFFF)) - 1)

	table_size := (table_data) & 0xFFFF

	hash_table_start := index

	instruction_field_start := hash_table_start + table_size

	instruction_field_size := instruction & 0xFFFF
	input_value :=
		get_input_value(
			kernel_state,
			input_type,
			token_transition,
			scanner_start_pointer,
		)
	hash_index := input_value & mod

	for {

		cell := instruction_buffer[hash_table_start+hash_index]

		value := cell & 0x7FF

		next := int((cell>>22)&0x3FF) - 512

		if value == input_value {

			instruction_start := (cell >> 11) & 0x7FF

			return instruction_field_start + instruction_start
		}

		if next == 0 {
			//Failure
			return instruction_field_size + instruction_field_start
		}

		hash_index = uint32(int(hash_index) + next)
	}

}

func index_jump(kernel_state *KernelState, index uint32, instruction uint32) uint32 {

	instruction_buffer := *kernel_state.instructions

	scanner_start_pointer := instruction_buffer[index]

	table_data := instruction_buffer[index+1]

	index += 2

	basis__ := instruction & 0xFFFF

	input_type := ((instruction >> 22) & 0x7)

	token_transition := ((instruction >> 26) & 0x3)

	input_value := get_input_value(
		kernel_state,
		input_type,
		token_transition,
		scanner_start_pointer,
	) - basis__

	number_of_rows := table_data >> 16

	row_size := table_data & 0xFFFF

	if input_value < number_of_rows {

		return index + input_value*row_size + row_size

	} else {
		// Use default behavior found at the beginning of the
		// jump table
		return index
	}
}

func get_input_value(
	kernel_state *KernelState,
	input_type uint32,
	token_transition uint32,
	scanner_start_pointer uint32,
) uint32 {

	lexer := kernel_state.get_root_lexer()

	if input_type > 0 { // Lexer token id input

		switch token_transition {

		case 0: /* do nothing */
			break

		case 1: /* set next peek lexer */

			lexer.peek()

		case 2: /* set primary lexer */

			lexer.reset()

		case 3: /*do nothing */
			break
		}

		switch input_type {

		case 1:
			scanner(kernel_state, lexer, scanner_start_pointer)

			return lexer.token_type
		case 2:
			return lexer.class()
		case 3:
			return lexer.codepoint()
		case 4:
			return lexer.byte()
		}

	} else {
		// Production id input
		return kernel_state.prod
	}

	return 0
}

func scanner(
	root_state *KernelState,
	lexer *KernelLexer,
	scanner_start_pointer uint32,
) {
	if lexer.token_type <= 0 {

		state := scanner_invalid.get_recycled_KernelState(root_state)

		for {

			state.state_stack[0] = 0

			state.state = 0

			state.push_state(scanner_start_pointer)

			state.P_lexer.scanner_sync(lexer)

			if kernel_executor(state, scanner_invalid) == 0 {
				if state.last_token_type == 9999 {
					lexer.byte_offset = state.P_lexer.byte_offset
					lexer.token_offset = state.P_lexer.token_offset
					state.reset()
				} else {
					sync_lexer := state.P_lexer
					lexer.token_type = state.last_token_type
					lexer.byte_length = sync_lexer.byte_offset - lexer.byte_offset
					lexer.token_length = sync_lexer.token_offset - lexer.token_offset
					break
				}
			} else {
				break
			}
		}

		state.VALID = false

		scanner_invalid.add_state(state)
	}
}
