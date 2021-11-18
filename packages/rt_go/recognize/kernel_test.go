package hc_kernel

import (
	"testing"
)

func TestKernelLexer(t *testing.T) {

	t.Run("CodePoint is correctly defined", func(t *testing.T) {
		input := []uint8("🌙")
		lexer := newKernelLexer(&input)

		if lexer.codepoint() != 127769 {
			t.Fail()
		}
	})
}

func TestJumpTable(t *testing.T) {

	InitJumptable()

	t.Run("JumpTable Is Intialized", func(t *testing.T) {
		if JUMP_TABLE_INITIALIZED != true {
			t.Fail()
		}
	})

	t.Run("JumpTable Is Correctly Constructed", func(t *testing.T) {
		if Jumptable[32]&0xF != SPACE {
			t.Fail()
		}
	})
}

func TestKernelStateBuffer(t *testing.T) {

	intructions := []uint32{}

	input := []uint8("abcdefg")

	buffer := newKernelStateBuffer()

	state := buffer.create_state(
		&intructions,
		&input,
	)

	state.VALID = true

	buffer.create_state(
		&intructions,
		&input,
	)

	state2 := buffer.remove_state_at_index(1)

	state2.VALID = false

	buffer.add_state_pointer_and_sort(state2)

	t.Run("Buffer is not nil", func(t *testing.T) {
		if buffer == nil {
			t.Fail()
		}
	})

	t.Run("The two states are not the same", func(t *testing.T) {
		if state == state2 {
			t.Fail()
		}
	})

	t.Run("Rules length is zero (no actions were created)", func(t *testing.T) {
		if state.P_get_rules_len() != 0 {
			t.Fail()
		}
	})

	t.Run("Lexer not at END", func(t *testing.T) {
		if state.P_lexer.END() != false {
			t.Fail()
		}
	})

	t.Run("Buffer size is two after creating two states (Buffer retains reference to created state)", func(t *testing.T) {
		if buffer.len() != 2 {
			t.Fail()
		}
	})

	t.Run("Invalid state is placed at back of buffer", func(t *testing.T) {
		if buffer.P_get_state(1) != state2 {
			t.Fail()
		}
	})

	t.Run("Valid state is placed at front of buffer", func(t *testing.T) {
		state := buffer.remove_state_at_index(0)

		state.VALID = true

		buffer.add_state_pointer_and_sort(state)

		if buffer.P_get_state(0) != state {
			t.Fail()
		}
	})
}
