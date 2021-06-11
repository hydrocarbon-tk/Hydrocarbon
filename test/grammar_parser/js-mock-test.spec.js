/**
 * Should compile a new HCG grammar parser, 
 * which then should be able to compile
 * a new HCG parser
 */
import URI from "@candlelib/uri";
import { assert } from "console";
import { buildJSParserStrings, compileRecognizer, createAddHocParser } from "../../build/library/compiler/compiler.js";
import {
    compileGrammarFromURI
} from "../../build/library/grammar3/compile.js";

await URI.server();

const grammar_file = URI.resolveRelative("./test/languages/mock.javascript.hcg");

//################################################################################################

//Take parser and do a sanity parse of a simple grammar
assert_group(
    "Should be able to use bootstrapped parser to compile mock grammar",
    20000, sequence, () => {
        const
            compiled_grammar = await compileGrammarFromURI(grammar_file),
            { recognizer_functions, meta, }
                = await compileRecognizer(compiled_grammar, 1),
            { recognizer_script, completer_script }
                = buildJSParserStrings(compiled_grammar, recognizer_functions, meta),
            parser = createAddHocParser(compiled_grammar, recognizer_script, completer_script).parser;



        const { result } = parser("t+t/**/ 2+2 ;(1-2)+t");

        assert(i, result[0].ty == "js");
        assert(result[0].stmts.length == 3);

    });

