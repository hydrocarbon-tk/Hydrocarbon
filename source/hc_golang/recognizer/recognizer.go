package hc_recognizer

import "candlelib/hc_kernel"

func Complete(
	input *[]uint8,
	valid *hc_kernel.KernelStateBuffer,
	invalid *hc_kernel.KernelStateBuffer,
	//fn_maps
	//fns
) {

	if valid.P_have_valid() {

		state := valid.P_get_state(0)

		iter := newKernelStateIterator(state)

		//default_tok := newToken(input, 0, 0, -1)

		stack := make([]*Token, 64)

		tokens := make([]*Token, 64)

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

					//body := (low >> 8) & 0xFF
					length := int(((low >> 3) & 0x1F))

					if (low & 4) != 0 {
						//body = (low >> 3)
						length = int(iter.next())
					}

					pos_a := tokens[len(tokens)-length]

					pos_b := tokens[len(tokens)-1]

					//e := stack[-length:]

					token := TokenFromRange(pos_a, pos_b)

					tokens[len(stack)-length] = token

					//stack[stack.length-length] = fns[body](env, e, token)

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

					//println(tok.String())

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

	} else {

	}
	//iter := newKernelStateIterator()
}
