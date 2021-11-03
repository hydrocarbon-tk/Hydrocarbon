use std::time;
mod ast;
mod data;

use candlelib_hydrocarbon::{ast::HCObj, completer, UTF8StringReader};

use crate::ast::{ASTNodeTraits, NodeIteration};

fn main() {
    //coz::thread_init();
    let input = "two+three two two one";

    for i in 0..100000 {
        let mut result = completer(
            UTF8StringReader::new(&input.as_bytes()),
            &data::Bytecode,
            data::EntryPoint_Start,
            &ast::FunctionMaps,
        );
    }

    //*
    /*
    let start = time::Instant::now();

    let reader = UTF8StringReader::new(&input.as_bytes());

    let elapsed = start.elapsed();

    println!("SR: {:?}", elapsed); */

    let start2 = time::Instant::now();

    let mut result = completer(
        UTF8StringReader::new(&input.as_bytes()),
        &data::Bytecode,
        data::EntryPoint_Start,
        &ast::FunctionMaps,
    );

    let elapsed2 = start2.elapsed();

    println!("PARSE: {:?}", elapsed2);

    if let Ok(node) = &mut result {
        dbg!(&node);
        use HCObj::*;
        match node {
            NODE(node) => {
                use ast::ASTNode::*;
                match node {
                    ROOT(root) => {
                        root.iterator(&mut |a, b| {
                            use ast::ASTNode::*;
                            use NodeIteration::*;

                            match b {
                                NodeIteration::ROOT(a) => {}
                                _ => {}
                            }

                            CONTINUE
                        });
                    }
                    _ => {}
                }
            }
            _ => {}
        }

        //println!("{:?}", lex)
    }
}
