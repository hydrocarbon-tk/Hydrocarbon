import { compileJSParserFromGrammar } from "../tools.js";
assert_group(sequence, 10000, () => {

    const test_grammar_string =
        `@IGNORE g:ws tk:comment
        
        <> start >  data
        
        <> data > ( g:id )(*)

        <> comment > \\/* ( g:ws | g:nl | g:id | g:num | g:sym )(*) \\*/
        `;


    const test_parser = await compileJSParserFromGrammar(test_grammar_string);

    assert("Construct test parser", test_parser != undefined);

    assert("Parse input with production token", test_parser("test /* grumble */ test").result[0] == ['test', 'test']);

});