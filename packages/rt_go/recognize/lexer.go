package hc_kernel

// Kernel Lexer ----------------------------
type KernelLexer struct {
	input *[]uint8

	byte_offset       uint32
	token_offset      uint32
	token_length      uint32
	byte_length       uint32
	prev_byte_offset  uint32
	prev_token_offset uint32
	peek_byte_offset  uint32
	peek_token_offset uint32
	line              uint32
	token_type        uint32
	input_len         uint32
}

func newKernelLexer(input *[]uint8) *KernelLexer {

	p := KernelLexer{
		input:             input,
		byte_offset:       0,
		token_offset:      0,
		token_length:      1,
		byte_length:       1,
		prev_byte_offset:  0,
		prev_token_offset: 0,
		peek_byte_offset:  0,
		peek_token_offset: 0,
		line:              0,
		token_type:        0,
		input_len:         uint32(len(*input)),
	}

	return &p
}

func getTypeAt(code_point uint32) uint32 { return uint32(Jumptable[code_point] & 0x1F) }

func (s *KernelLexer) P_token_offset() uint32 {
	return s.token_offset
}

func (s *KernelLexer) P_token_length() uint32 {
	return s.token_length
}

func (s *KernelLexer) P_line() uint32 {
	return s.line
}

func (s *KernelLexer) codepoint() uint32 {
	cp := get_utf8_code_point_at(s.byte_offset, *s.input)
	s.byte_length = get_utf8_byte_length_from_code_point(cp)
	s.token_length = get_token_length_from_code_point(cp)
	return cp
}

func (s *KernelLexer) class() uint32 {
	return getTypeAt(s.codepoint())
}

func (s *KernelLexer) byte() uint32 {
	s.byte_length = 1
	s.token_length = 1
	return uint32((*s.input)[s.byte_offset])
}

func (s *KernelLexer) copy_in_place() *KernelLexer {
	destination := newKernelLexer(s.input)
	destination.peek_unroll_sync(s)
	return destination
}

func (s *KernelLexer) peek_unroll_sync(source *KernelLexer) {

	s.byte_offset = source.byte_offset
	s.byte_length = source.byte_length
	s.token_length = source.token_length
	s.token_offset = source.token_offset
	s.prev_byte_offset = source.prev_byte_offset
	s.prev_token_offset = source.prev_token_offset
	s.line = source.line
	s.token_type = source.token_type
}

func (s *KernelLexer) scanner_sync(source *KernelLexer) {
	s.byte_offset = source.byte_offset
	s.byte_length = source.byte_length
	s.token_length = source.token_length
	s.token_offset = source.token_offset
	s.prev_byte_offset = s.byte_offset
	s.prev_token_offset = s.byte_length
	s.line = source.line
	s.token_type = source.token_type
}

func (s *KernelLexer) peek() {
	s.byte_offset += s.byte_length
	s.token_offset += s.token_length

	if s.input_len <= s.byte_offset {
		s.token_type = 1
		s.byte_length = 0
		s.token_length = 0
	} else {

		if (*s.input)[s.byte_offset] == 10 {
			s.line += 1
		}

		s.token_type = 0
		s.byte_length = 1
		s.token_length = 1
	}
}

func (s *KernelLexer) reset() {
	if s.byte_offset > s.peek_byte_offset {
		s.byte_offset = s.peek_byte_offset
		s.token_offset = s.peek_token_offset
		s.token_length = 1
		s.byte_length = 1
		if s.token_type != 1 {
			s.token_type = 0
		}
	}
}

func (s *KernelLexer) skip_delta() uint32 {
	return s.token_offset - s.prev_token_offset
}

func (s *KernelLexer) next() {
	s.peek()
	s.peek_byte_offset = s.byte_offset
	s.peek_token_offset = s.token_offset
}

func (s *KernelLexer) consume() {
	s.prev_byte_offset = s.byte_offset
	s.prev_token_offset = s.token_offset
}

func (s *KernelLexer) END() bool {
	return s.byte_offset >= s.input_len
}
