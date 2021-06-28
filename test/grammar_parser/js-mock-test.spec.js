/**
 * Should compile a new HCG grammar parser, 
 * which then should be able to compile
 * a new HCG parser
 */
import URI from "@candlelib/uri";
import { buildRecognizer } from "../../build/library/build/build.js";
import { compileGrammarFromURI } from "../../build/library/grammar/compile.js";
import { createAddHocParser } from "../../build/library/render/create_add_hoc_parser.js";
import { compileJSParserFromGrammar } from "../tools.js";
await URI.server();

const grammar_file = URI.resolveRelative("./test/languages/mock.javascript.hcg");

//################################################################################################

//Take parser and do a sanity parse of a simple grammar
assert_group(
    "Should be able to use bootstrapped parser to compile mock JS grammar",
    20000, sequence, () => {

        const parser = await compileJSParserFromGrammar(grammar_file + "");

        const { result } = parser(`
function Test( ){
    hello_world +2
}
(22+2-taco)-23
for(var d = 0;2+2;3+3){
    function Test( ){
        hello_world +2
    }
}
        `);
        assert(result[0].ty == "js");
        assert(result[0].stmts.length == 3);
        assert(result[0].stmts[0].ty == "fn");
        assert(result[0].stmts[1].ty == "expression_statement");
        assert(result[0].stmts[2].ty == "for");

    });

