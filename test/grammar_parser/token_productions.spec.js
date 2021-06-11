import {
    compileGrammarFromString
} from "../../build/library/grammar3/compile.js";
import {
    createAddHocParser
} from "../../build/library/compiler/compiler.js";
assert_group(sequence, 10000, () => {

    const test_grammar_string =
        `@IGNORE g:ws
        
        <> start >  data
        
        <> data > ( tk:comment | g:id )(*)

        <> comment > \\/* ( g:ws | g:nl | g:id | g:num | g:sym )(*) \\*/
        `;

    const test_grammar = await compileGrammarFromString(test_grammar_string);

    assert("Construct test grammar", test_grammar != undefined);

    const test_parser = await createAddHocParser(test_grammar);

    assert("Construct test parser", test_parser != undefined);

    assert("Parse input with production token", test_parser("test /* grumble */ test").result[0] == ['test', '/* grumble */', 'test']);

});