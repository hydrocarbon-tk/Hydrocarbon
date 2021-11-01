use super::token::Token;
use crate::{ByteReader, StateIterator};

pub fn complete<T: 'static + ByteReader>(
    mut reader: T,
    bytecode: &'static [u32],
    entry_pointer: u32,
    //invalid: &mut KernelStateBuffer,
) -> Result<Token, String> {
    let mut iterator = StateIterator::new(reader, bytecode, entry_pointer, false);
    let mut tokens: Vec<Token> = Vec::with_capacity(8);
    let mut stack_pointer: usize = 0;
    let mut token_offset: usize = 0;
    loop {
        let action = iterator.nextAction();

        match action {
            crate::ParseAction::TOKEN { token } => {
                return Err(String::from("Token"));
            }
            crate::ParseAction::NONE {} => {
                return Err(String::from("None"));
            }
            crate::ParseAction::ERROR { production } => {
                return Err(String::from("Error"));
            }
            crate::ParseAction::FORK {} => {
                return Err(String::from("Fork"));
            }
            crate::ParseAction::ACCEPT {} => {
                return Ok(tokens.remove(0));
            }
            crate::ParseAction::REDUCE {
                body,
                length,
                production,
            } => {
                let len = length as usize;

                let pos_a = tokens[tokens.len() - len as usize];

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
            crate::ParseAction::SHIFT {
                length,
                line,
                token_type,
            } => {
                let tok = Token::new(length as usize, token_offset, line as usize);

                //stack.push(tok);

                tokens.push(tok);

                token_offset += length as usize;

                stack_pointer += 1;
            }
            crate::ParseAction::SKIP {
                length,
                line,
                token_type,
            } => {
                token_offset += length as usize;
            }
        }
    }
}
