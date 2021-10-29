package hc_kernel

// Kernel State ----------------------------
type KernelState struct {
	instructions *[]uint32
	P_rules      []uint16
	next         []*KernelState
	state_stack  [64]uint32
	meta_stack   [64]uint32

	P_lexer  KernelLexer
	P_origin *KernelState

	symbol_accumulator uint32
	prod               uint32
	stack_pointer      int
	state              uint32
	P_origin_fork      uint32
	last_byte_offset   uint32
	last_token_offset  uint32
	last_token_type    uint32

	refs uint8

	VALID     bool
	COMPLETED bool
	FORKED    bool
}

func newKernelState(instructions *[]uint32, input *[]uint8) *KernelState {

	s := KernelState{
		instructions:       instructions,
		P_lexer:            *newKernelLexer(input),
		P_origin:           nil,
		symbol_accumulator: 0,
		prod:               0,
		stack_pointer:      0,
		state:              0xFFFFFFFF,
		P_origin_fork:      0,
		last_byte_offset:   0,
		last_token_offset:  0,
		last_token_type:    0,
		refs:               0,
		VALID:              true,
		COMPLETED:          false,
		FORKED:             false,
	}

	s.meta_stack[0] = 0

	return &s
}

func (s *KernelState) P_get_rules_len() uint32 {
	return uint32(len(s.P_rules))
}

func (s *KernelState) push_state(kernel_state_pointer uint32) {
	s.stack_pointer += 1
	s.state_stack[s.stack_pointer] = kernel_state_pointer
	s.meta_stack[s.stack_pointer] = (s.meta_stack[s.stack_pointer-1] & 0xFFFF) | s.symbol_accumulator
}

func (s *KernelState) swap_state(kernel_state_pointer uint32) {
	s.state_stack[s.stack_pointer] = kernel_state_pointer
}

func (s *KernelState) pop_state() uint32 {
	state := s.read_state()
	s.stack_pointer -= 1
	return state
}

func (s *KernelState) read_state() uint32 {
	return s.state_stack[s.stack_pointer]
}

func (s *KernelState) copy_state_stack(dest *KernelState) {
	for i := range s.state_stack {
		dest.state_stack[i] = s.state_stack[i]
	}
}

func (s *KernelState) copy_production_stack(dest *KernelState, cutoff uint32) {
	for i := range s.state_stack {
		dest.meta_stack[i] = (s.meta_stack[i])
		if i > s.stack_pointer-int(cutoff) {
			dest.state_stack[i] = s.state_stack[i]
		} else {
			dest.state_stack[i] = 0
		}
	}
}

func (s *KernelState) transfer_state_stack(dest *KernelState) {

	s.copy_state_stack(dest)

	for i := range s.state_stack {
		s.state_stack[i] = 0
	}

	dest.stack_pointer = s.stack_pointer

	s.stack_pointer = 0
}

func (s *KernelState) fork(process_buffer *KernelStateBuffer, cutoff uint32) *KernelState {

	forked_state := process_buffer.get_recycled_KernelState(s)

	forked_state.P_lexer.peek_unroll_sync(&s.P_lexer)
	//Increment the refs count to prevent the
	//KernelState from being recycled.
	s.copy_production_stack(forked_state, cutoff)

	forked_state.P_origin = s
	forked_state.stack_pointer = s.stack_pointer
	forked_state.P_origin_fork = s.P_get_rules_len()
	forked_state.state = s.state
	forked_state.symbol_accumulator = s.symbol_accumulator
	forked_state.last_byte_offset = s.last_byte_offset
	forked_state.last_token_offset = s.last_token_offset
	forked_state.VALID = true

	s.refs++

	process_buffer.add_state(forked_state)

	return forked_state
}

func (s *KernelState) add_rule(val uint16) {
	s.P_rules = append(s.P_rules, val)
}

func (s *KernelState) add_reduce(sym_len uint32, fn_id uint32) {

	if (s.state & 2) != 0 {

		// Sym len -1 is important because something is always
		// added to the stack, even if there where zero symbols
		// consumed.
		s.symbol_accumulator -= ((sym_len - 1) << 16)

		total := fn_id + sym_len
		if (total) == 0 {
			return
		}

		if fn_id > 0xFF || sym_len > 0x1F {
			low := (1 << 2) | (fn_id << 3)
			high := sym_len
			s.add_rule(uint16(low))
			s.add_rule(uint16(high))
		} else {
			low := ((sym_len & 0x1F) << 3) | ((fn_id & 0xFF) << 8)
			s.add_rule(uint16(low))
		}
	}
}
func (s *KernelState) add_shift(tok_len uint32) {
	if tok_len == 0 {
		return
	}

	if tok_len > 0x1FFF {
		low := 1 | (1 << 2) | ((tok_len >> 13) & 0xFFF8)
		high := (tok_len & 0xFFFF)
		s.add_rule(uint16(low))
		s.add_rule(uint16(high))
	} else {
		low := 1 | ((tok_len << 3) & 0xFFF8)
		s.add_rule(uint16(low))
	}
}
func (s *KernelState) add_skip(skip_delta uint32) {

	if skip_delta < 1 {
		return
	}

	if skip_delta > 0x1FFF {
		low := 2 | (1 << 2) | ((skip_delta >> 13) & 0xFFF8)
		high := (skip_delta & 0xFFFF)
		s.add_rule(uint16(low))
		s.add_rule(uint16(high))
	} else {
		low := 2 | ((skip_delta << 3) & 0xFFF8)
		s.add_rule(uint16(low))
	}
}

func (s *KernelState) consume() bool {

	l := s.get_root_lexer()

	if 0 != (s.state & 2) {

		s.add_skip(l.skip_delta())

		s.add_shift(l.token_length)

		s.symbol_accumulator += 1 << 16
	}

	l.next()

	l.consume()

	return true
}

func (s *KernelState) get_root_lexer() *KernelLexer {
	return &s.P_lexer
}

func (s *KernelState) reset() {
	s.P_rules = nil
	s.stack_pointer = 0
}
