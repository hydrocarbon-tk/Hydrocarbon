import { compileHCGParser, compileGrammar } from "../tools.js";

assert_group(sequence, 10000, () => {

    //Construct A HCG parser
    const HCGparser = await compileHCGParser();

    assert("Construct HCG Parser", HCGparser != undefined);

    const test_grammar_string =
        `@IGNORE g:ws
        
        <> start >  data
        
        <> data > ( tk:comment | g:id )(*)

        <> comment > \\/* ( g:ws | g:nl | g:id | g:num | g:sym )(*) \\*/
        `;

    const test_grammar = await HCGparser(test_grammar_string);

    assert("Construct test grammar", test_grammar != undefined);

    const test_parser = await compileGrammar(test_grammar, true);

    assert("Construct test parser", test_parser != undefined);

    assert("Parse input with production token", test_parser("test /* grumble */ test").result[0] == ['test', '/* grumble */', 'test']);

});