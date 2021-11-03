use std::{cell::UnsafeCell, fmt::Debug};

use super::token::Token;
use crate::{
    ast::{HCObj, ReduceFunction},
    ByteReader, StateIterator,
};

pub fn complete<T: 'static + ByteReader, Node: Debug>(
    mut reader: T,
    bytecode: &'static [u32],
    entry_pointer: u32,
    fns: &[ReduceFunction<Node>],
) -> Result<HCObj<Node>, String> {
    let mut iterator = StateIterator::new(reader, bytecode, entry_pointer, false);
    let mut tokens: Vec<Token> = Vec::with_capacity(8);
    let mut nodes: Vec<HCObj<Node>> = Vec::with_capacity(8);
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
                return Ok(nodes.remove(0));
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

                let node = fns[body as usize](&mut nodes, token);

                nodes.push(node);

                stack_pointer = stack_pointer - len + 1;
            }
            crate::ParseAction::SHIFT {
                length,
                line,
                token_type,
            } => {
                let tok = Token::new(length, token_offset as u32, line);

                let node = HCObj::TOKEN(tok);

                nodes.push(node);

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
