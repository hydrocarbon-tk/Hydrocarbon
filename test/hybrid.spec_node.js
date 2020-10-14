import { compileGrammars, lrParse } from "@candlefw/hydrocarbon";
import URL from "@candlefw/url";
import { CompileHybrid, renderLLFN, renderLRFN } from "../build/library/hybrid/hybrid_compiler.js";
import parse_data from "./mock/test_grammar_c.js";
import { Lexer } from "@candlefw/wind";
import env from "@candlefw/js/build/library/parser/env.js";

await URL.server();

const url = await URL.resolveRelative("./test/mock/test_grammar_c.hcg");

const file = await url.fetchText();

const test_string = `a*b; sa \n +b*2+3;a+b*254+3;a+b*2+3;a+b*2+3*4;a+b; sa \n +b*2+3;a+b*254+3;a+b*2+3;a+b*2+3*4; 
sa \n +b*2+3;a+b*254+3;a+b*2+3;a+b*2+3*4`;

//assert_group(() => {

const grammar = await compileGrammars(file, url + "");
/*
    Go through each item ----
    Gather each item that transitions on a particular symbol; 
    This combinations represent whole groups that can transition 
    to a new state;
*/
//const parserLR = renderLRFN(grammar);
//const parserLL = renderLLFN(grammar);
const parserLR = CompileHybrid(grammar);
process.exit();

    //assert(lrParse(test_string, parse_data).value == parserLR(new Lexer(test_string)));
    //assert(lrParse(test_string, parse_data).value == parserLL(new Lexer(test_string)));

    //harness.markTime();
    //assert(parserLL(new Lexer(test_string)) == "");
    //harness.getTime("hybrid LL");


    //harness.markTime();
    //assert(lrParse(test_string, parse_data, env) == "");
    //harness.getTime("LALR");
//
    //harness.markTime();
    //assert(parserLR(new Lexer(test_string)) == "");
    //harness.getTime("hybrid");


    // assert(parser() == "");
//}, sequence);



