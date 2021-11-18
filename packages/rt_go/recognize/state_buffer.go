package hc_kernel

// Kernel State Buffer ---------------------

type KernelStateBuffer struct {
	data []*KernelState
}

func newKernelStateBuffer() *KernelStateBuffer {

	s := KernelStateBuffer{}

	return &s
}

func (s *KernelStateBuffer) len() uint32 {
	return uint32(len(s.data))
}

func (s *KernelStateBuffer) remove_state_at_index(index uint32) *KernelState {
	temp_location := s.data[index]

	s.data = append(s.data[:index], s.data[index+1:]...)

	return temp_location
}

func (s *KernelStateBuffer) add_state(state *KernelState) {
	s.data = append(s.data, state)
}

func (s *KernelStateBuffer) add_state_pointer_and_sort(state *KernelState) uint32 {

	index := uint32(0)

	len := s.len()

	for index < len {

		exist_ref := s.data[index]
		//Valid states are always sorted first
		if !exist_ref.VALID && state.VALID {
			break
		}

		if exist_ref.P_lexer.byte_offset < state.P_lexer.byte_offset {
			break
		}

		index += 1
	}

	if index == len {
		s.data = append(s.data, state)
	} else {
		s.data = append(s.data[:index], s.data[index:]...)
		s.data[index] = state
	}

	return len + 1
}

func (s *KernelStateBuffer) P_have_valid() bool {
	return s.len() > 0 && s.data[0].VALID
}
func (s *KernelStateBuffer) remove_valid_parser_state() *KernelState {

	if s.P_have_valid() {
		return s.remove_state_at_index(0)
	}

	return nil
}

func (s *KernelStateBuffer) P_get_state(index uint32) *KernelState {
	return s.data[index]
}

func (s *KernelStateBuffer) get_recycled_KernelState(state *KernelState) *KernelState {

	if s.len() > 0 {

		i := uint32(0)

		for i < s.len() {

			ref := s.data[i]

			if !ref.VALID && ref.refs < 1 {
				invalid_state := s.remove_state_at_index(i)

				invalid_state.reset()

				return invalid_state
			}

			i++
		}
	}

	return newKernelState(
		state.instructions,
		state.P_lexer.input,
	)
}

func (s *KernelStateBuffer) create_state(
	instructions *[]uint32,
	input *[]uint8,
) *KernelState {

	state := newKernelState(
		instructions,
		input,
	)

	s.data = append(s.data, state)

	return state
}
