import { compileGrammars, lrParse } from "@candlefw/hydrocarbon";
import URL from "@candlefw/url";
import { CompileHybrid, renderLLFN } from "../build/library/hybrid/hybrid_compiler.js";
import parse_data from "./mock/test_grammar_e_fork.js";
import { Lexer } from "@candlefw/wind";

const url = await URL.resolveRelative("./mock/test_grammar_e_fork.hcg");

const file = await url.fetchText();

const test_string = `( A, ( A ) , (A) ) => { ( A, ( A ) , (A) ) => { ( A, ( A ) , (A) ) => { ( A, ( A ) , (A) ) => { ( A, ( A ) , (A) ) => { D } } } } } ;`;

assert_group(() => {

    const grammar = await compileGrammars(file, url + "");
    /*
        Go through each item ----
        Gather each item that transitions on a particular symbol; 
        This combinations represent whole groups that can transition 
        to a new state;
    */
    const parserHybrid = CompileHybrid(grammar);
    const parserLL = renderLLFN(grammar);

    //assert(lrParse(test_string, parse_data).value == parserLR(new Lexer(test_string)));
    //assert(lrParse(test_string, parse_data).value == parserLL(new Lexer(test_string)));

    //harness.markTime();
    //assert(parserLL(new Lexer(test_string)) == "");
    //harness.getTime("hybrid LL");

    const a = new Lexer("ABC");
    a.addSymbol("SDFS", "SD");
    a.next().pk.copy().next().END;

    harness.markTime();
    assert(parserHybrid(new Lexer(test_string)) == "");
    harness.getTime("hybrid");



    harness.markTime();
    assert(lrParse(test_string, parse_data) == "");
    harness.getTime("LALR");


    // assert(parser() == "");
}, sequence);



