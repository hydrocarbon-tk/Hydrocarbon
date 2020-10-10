import { compileGrammars, lrParse } from "@candlefw/hydrocarbon";
import URL from "@candlefw/url";
import { CompileHybrid, CompileLLHybrid } from "../build/library/hybrid/hybrid_compiler.js";
import parse_data from "./mock/test_grammar_b.js";
import { Lexer } from "@candlefw/wind";

const url = await URL.resolveRelative("./mock/test_grammar_b.hcg");

const file = await url.fetchText();

const test_string = "a*b;a+b*2";

assert_group(() => {

    const grammar = await compileGrammars(file, url + "");
    /*
        Go through each item ----
        Gather each item that transitions on a particular symbol; 
        This combinations represent whole groups that can transition 
        to a new state;
    */
    const parserLR = CompileHybrid(grammar);
    //const parserLL = CompileLLHybrid(grammar);

    //assert(lrParse(test_string, parse_data).value == parserLR(new Lexer(test_string))[0]);
    //assert(lrParse(test_string, parse_data).value == parserLL(new Lexer(test_string)));
    assert(parserLR);
    // harness.markTime();
    assert(parserLR(new Lexer(test_string)) == "");
    // harness.getTime("hybrid LR");

    //harness.markTime();
    //assert(parserLL(new Lexer(test_string)) == "");
    //harness.getTime("hybrid LL");

    harness.markTime();
    assert(lrParse(test_string, parse_data) == "");
    harness.getTime("LALR");

    // assert(parser() == "");
}, sequence);



