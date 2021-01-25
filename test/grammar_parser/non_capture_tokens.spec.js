import { compileHCGParser, compileGrammar } from "../tools.js";

assert_group(sequence, 10000, () => {

    //Construct A HCG parser
    const HCGparser = await compileHCGParser(false, true);

    const test_grammar_string =
        `@IGNORE g:ws g:nl

        <> start > datas
        
        <> datas >  data                        f:r { [$sym1] }
                 |  datas ( ?=g:nl | ; | ?={ ) data  f:r { $sym1.concat($sym3) }
        
        <> data > g:id
                | \\{ g:id \\}                  f:r { { type:"brackets", v:$sym2 } }
        `;

    const test_grammar = await HCGparser(test_grammar_string);

    assert("Construct test grammar", test_grammar != undefined);

    const test_parser = await compileGrammar(test_grammar);

    assert("Construct test parser", test_parser != undefined);

    assert("Parse input with production token", test_parser("test\ntest{test}").result[0] == ['test', 'test', { type: 'brackets', v: 'test' }]);

});