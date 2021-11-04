use std::time;
mod ast;
mod data;

use candlelib_hydrocarbon::{
    ast::HCObj, completer, ParseIterator, ReferenceIterator, ThreadedIterator, UTF8StringReader,
};

use crate::ast::{ASTNode, ASTNodeTraits, NodeIteration};

fn main() {
    //coz::thread_init();
    let input = "two+three two two one";
    //*
    for i in 0..100 {
        let result = completer(
            ReferenceIterator::new(
                UTF8StringReader::new(&input.as_bytes()),
                data::EntryPoint_Start,
                &data::Bytecode,
            ),
            &ast::FunctionMaps,
        );
    }

    //*///*
    /*
    let start = time::Instant::now();

    let reader = UTF8StringReader::new(&input.as_bytes());

    let elapsed = start.elapsed();

    println!("SR: {:?}", elapsed); */

    let iterator = ReferenceIterator::new(
        UTF8StringReader::new(&input.as_bytes()),
        data::EntryPoint_Start,
        &data::Bytecode,
    );

    let start2 = time::Instant::now();
    let mut result = completer(iterator, &ast::FunctionMaps);

    let elapsed2 = start2.elapsed();

    println!("PARSE: {:?}", elapsed2);

    if let Ok(node) = &mut result {
        dbg!(&node);
        use HCObj::*;
        match node {
            NODE(node) => {
                use ast::ASTNode::*;
                let d = 0;
                match node {
                    ROOT(root) => {
                        root.iterate(&mut |a, b| {
                            use ast::ASTNode::*;
                            use NodeIteration::*;

                            println!("{:?}", a.name());

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
