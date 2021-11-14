use std::time;
mod ast;
mod data;

use candlelib_hydrocarbon::{
    ast::HCObj, completer, ParseIterator, ReferenceIterator, UTF8StringReader,
};

use crate::ast::{ASTNodeTraits, NodeIteration};

fn main() {
    //coz::thread_init();
    let input = "f: {{ test  }} 44 55 66 44 55 66 22 33 44 f: {{ trials }} ";
    //*
    for i in 0..20 {
        let result = completer(
            ReferenceIterator::new(
                UTF8StringReader::new(&input.as_bytes()),
                data::EntryPoint_Start,
                &data::BYTECODE,
            ),
            &ast::FunctionMaps,
        );
    }
    //*/
    let start = time::Instant::now();

    let reader = UTF8StringReader::new(&input.as_bytes());

    let elapsed = start.elapsed();

    println!("SR: {:?}", elapsed);

    let iterator = ReferenceIterator::new(
        UTF8StringReader::new(&input.as_bytes()),
        data::EntryPoint_Start,
        &data::BYTECODE,
    );
    let start2 = time::Instant::now();
    let mut result = completer(iterator, &ast::FunctionMaps);
    let elapsed2 = start2.elapsed();
    dbg!(&result);
    println!("PARSE: {:?}", elapsed2);
    if let Ok(node) = &mut result {
        use HCObj::*;
        match node {
            NODE(node) => {
                use ast::ASTNode::*;
                let d = 0;
                match node {
                    _ => {}
                }
            }
            _ => {}
        }

        //println!("{:?}", lex)
    }
}
