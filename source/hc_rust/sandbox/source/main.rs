use std::time;
mod data;

use candlelib_hydrocarbon::{completer, UTF8StringReader};

fn main() {
    //coz::thread_init();
    let input = "two s three ";

    //*
    for i in 0..1000000 {
        let result = completer(
            UTF8StringReader::new(&input.as_bytes()),
            &data::instructions,
            67108956,
        );
        /* if let Ok(lex) = result {
            println!("{:?}", lex)
        } */
    } //*/
    let start = time::Instant::now();
    let result = completer(
        UTF8StringReader::new(&input.as_bytes()),
        &data::instructions,
        67108956,
    );
    let elapsed = start.elapsed();

    println!("Elapsed: {:?}", elapsed);
    if let Ok(lex) = result {
        println!("{:?}", lex)
    }
}
