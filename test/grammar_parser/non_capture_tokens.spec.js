import {
    compileGrammarFromString
} from "../../build/library/grammar3/compile.js";
import {
    createAddHocParser
} from "../../build/library/compiler/compiler.js";
assert_group(sequence, 10000, () => {

    const test_grammar_string =
        `@IGNORE g:ws g:nl

        <> start > datas
        
        <> datas >  data                        f:r { [$1] }
                 |  datas ( ?=g:nl | ; | ?={ ) data  f:r { $1.concat($3) }
        
        <> data > g:id
                | \\{ g:id \\}                  f:r { { type:"brackets", v:$2 } }
        `;

    const test_grammar = await compileGrammarFromString(test_grammar_string);

    assert("Construct test grammar", test_grammar != undefined);

    const test_parser = await createAddHocParser(test_grammar);

    assert("Construct test parser", test_parser != undefined);

    assert("Parse input with production token", test_parser("test\ntest{test}").result[0] == ['test', 'test', { type: 'brackets', v: 'test' }]);

});