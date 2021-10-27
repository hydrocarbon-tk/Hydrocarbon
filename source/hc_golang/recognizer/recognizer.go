package hc_recognizer

import (
	"candlelib/hc_kernel"
	"fmt"
	"time"
)

type CompleterError struct {
	Where Token
	What  string
	When  time.Time
}

func (e *CompleterError) Error() string {
	return fmt.Sprintf("at %v, %s \n %s",
		e.When, e.What, e.Where.blame())
}

func Complete(
	input *[]uint8,
	valid *hc_kernel.KernelStateBuffer,
	invalid *hc_kernel.KernelStateBuffer,
	reduce_functions []ReduceFunction,
) (HCObj, error) {

	if valid.P_have_valid() {

		state := valid.P_get_state(0)

		iter := newKernelStateIterator(state)

		stack := make([]HCObj, 16)
		tokens := make([]*Token, 16)

		stack = stack[0:0]
		tokens = tokens[0:0]

		token_offset := 0

		for iter.is_valid() {

			low := iter.next()

			if low == 0 {
				break
			}

			rule := low & 0x3

			switch rule {

			case 0: //REDUCE;

				{

					body := (low >> 8) & 0xFF

					length := int(((low >> 3) & 0x1F))

					if (low & 4) != 0 {
						//body = (low >> 3)
						length = int(iter.next())
					}

					pos_a := tokens[len(tokens)-length]

					pos_b := tokens[len(tokens)-1]

					e := stack[len(tokens)-length : len(tokens)]

					token := TokenFromRange(pos_a, pos_b)

					tokens[len(tokens)-length] = token

					stack[len(stack)-length] = reduce_functions[body](e, token)

					stack = append(stack[:len(stack)-length+1], stack[len(stack):]...)

					tokens = append(tokens[:len(tokens)-length+1], tokens[len(tokens):]...)
				}

			case 1:

				{ //SHIFT;

					length := int((low >> 3) & 0x1FFF)

					if (low & 4) != 0 {
						length = (length << 16) | int(iter.next())
					}

					tok := newToken(input, length, token_offset, -1)

					stack = append(stack, tok)

					tokens = append(tokens, tok)

					token_offset += length

				}

			case 2:
				{ //SKIP

					length := int((low >> 3) & 0x1FFF)

					if (low & 4) != 0 {
						length = (length << 16) | int(iter.next())
					}

					token_offset += length
				}

			}
		}

		return stack[0], nil

	} else {
		state := invalid.P_get_state(0)
		lexer := state.P_lexer
		tok := newToken(
			input, int(lexer.P_token_offset()), int(lexer.P_token_length()), int(lexer.P_line()),
		)

		return NILHCObj{}, &CompleterError{
			Where: *tok,
			What:  "Invalid Token",
			When:  time.Now(),
		}
	}

	return NILHCObj{}, nil
}
