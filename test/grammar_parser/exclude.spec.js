import { compileGrammar } from "../../build/library/grammar/compile.js";
import { render } from "../../build/library/grammar/passes/common.js";
import { loadGrammarFromString } from "../../build/library/grammar/passes/load.js";
import { compileJSParserFromGrammar } from "../tools.js";
assert_group(sequence, 10000, () => {

    const test_grammar_string =
        `@IGNORE g:sp g:nl

        <> start > A

        <> A > \\EXC (EXC \\fn \\[ ) B? \\tx f:r {  $1 + $2 + $3  }
            | \\td C \\ty
                  
        <> B > \\tx C \\ty
             | C

        <> C > \\tx \\ty  | \\fn \\[  \\test \\]
        `;

    const test_grammar = await loadGrammarFromString(test_grammar_string);

    const grammar = await compileGrammar(test_grammar);

    assert(grammar.productions[1].bodies.length == 3);

});