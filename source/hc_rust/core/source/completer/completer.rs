use super::super::kernel::state_buffer::KernelStateBuffer;
use super::iterator::KernelStateIterator;
use super::token::Token;

pub fn complete<'a>(
    input: *const u8,
    input_len: usize,
    valid: &mut KernelStateBuffer,
    //invalid: &mut KernelStateBuffer,
) -> Option<Token> {
    if valid.have_valid() {
        if let Some(state) = valid.get_ref_state(0) {
            let mut iter = KernelStateIterator::new(state);
            //let mut stack: Vec<Token> = Vec::with_capacity(128);
            let mut tokens: Vec<Token> = Vec::with_capacity(128);
            let mut stack_pointer: usize = 0;
            let mut token_offset: usize = 0;

            while let Some(instr) = iter.next() {
                match instr & 3 {
                    0 => {
                        //let mut body = ((instr >> 8) & 0xFF) as usize;
                        let mut len = ((instr >> 3) & 0x1F) as usize;

                        if instr & 4 > 0 {
                            //body = ((body >> 8) | len) as usize;
                            len = if let Some(high_instr) = iter.next() {
                                high_instr as usize
                            } else {
                                0
                            };
                        }

                        let pos_a = tokens[tokens.len() - len];
                        let pos_b = tokens[tokens.len() - 1];
                        let token = Token::token_from_range(pos_a, pos_b);

                        let root = tokens.len() - len;

                        tokens[root] = token;

                        unsafe {
                            tokens.set_len(root + 1);
                        }

                        /* let range = stack
                        .drain((stack_pointer - len)..(stack_pointer))
                        .collect(); */

                        //stack.push(reduce_functions[body](range, len as u32));

                        stack_pointer = stack_pointer - len + 1;
                    }
                    1 => {
                        let mut len = ((instr >> 3) & 0x1FFF) as usize;

                        if instr & 4 > 0 {
                            let high: usize = if let Some(high_instr) = iter.next() {
                                high_instr as usize
                            } else {
                                0
                            };

                            len = ((len << 16) | high) as usize;
                        }

                        let tok = Token::new(input, input_len, len, token_offset, 0xFFFFFFFF);

                        //stack.push(tok);

                        tokens.push(tok);

                        token_offset += len;

                        stack_pointer += 1;
                    }
                    2 => {
                        let mut len = ((instr >> 3) & 0x1FFF) as usize;

                        if instr & 4 > 0 {
                            let high: usize = if let Some(high_instr) = iter.next() {
                                high_instr as usize
                            } else {
                                0
                            };
                            len = ((len << 16) | high) as usize;
                        }

                        token_offset += len;
                    }
                    _ => break,
                }
            }

            return Some(tokens.remove(0));
        } else {
        }
    }

    None
}
