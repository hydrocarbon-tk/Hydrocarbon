use super::token::Token;
use crate::{
    ast::{HCObj, ReduceFunction},
    ByteReader, ParseAction, ParseErrorCode, ParseIterator,
};
use std::fmt::Debug;

pub fn complete<'b, I: ParseIterator<T>, T: 'b + ByteReader, Node: Debug>(
    iterator: &mut I,
    fns: &'static [ReduceFunction<Node>],
) -> Result<HCObj<Node>, ParseAction> {
    let mut tokens: Vec<Token> = Vec::with_capacity(8);
    let mut nodes: Vec<HCObj<Node>> = Vec::with_capacity(8);
    let mut stack_pointer: usize = 0;
    let mut token_offset: usize = 0;
    let mut state: ParseAction = ParseAction::NONE {};

    let mut action_block = |action, reader: &T| match action {
        crate::ParseAction::TOKEN { token: _ } => {
            state = action;
        }
        crate::ParseAction::NONE {} => {}
        crate::ParseAction::ERROR { .. } => {
            state = action;
        }
        crate::ParseAction::FORK {} => {
            state = action;
        }
        crate::ParseAction::ACCEPT {} => {
            state = action;
        }
        crate::ParseAction::REDUCE {
            body,
            length,
            production: _,
        } => {
            let len = length as usize;

            let pos_a = &tokens[tokens.len() - len as usize];

            let pos_b = &tokens[tokens.len() - 1];

            let token = Token::token_from_range(pos_a, pos_b);

            let root = tokens.len() - len;

            tokens[root] = token.clone();

            unsafe {
                tokens.set_len(root + 1);
            }

            fns[body as usize](&mut nodes, token.clone());

            stack_pointer = stack_pointer - len + 1;
        }
        crate::ParseAction::SHIFT {
            length,
            line,
            token_type: _,
        } => {
            let mut tok = Token::new(length, token_offset as u32, line);

            //tok.set_source(reader);

            let node = HCObj::TOKEN(tok.clone());

            nodes.push(node);

            tokens.push(tok.clone());

            token_offset += length as usize;

            stack_pointer += 1;
        }
        crate::ParseAction::SKIP {
            length,
            line: _,
            token_type: _,
        } => {
            token_offset += length as usize;
        }
    };

    iterator.start(&mut action_block);

    match state {
        crate::ParseAction::ACCEPT {} => {
            return Ok(nodes.remove(0));
        }
        crate::ParseAction::ERROR { .. } => return Err(state),
        _ => {
            return Err(ParseAction::ERROR {
                error_code: ParseErrorCode::NORMAL,
                pointer: 0,
                production: 0,
            })
        }
    }
}
