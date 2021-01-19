import URL from "@candlefw/url";
import { compileHCGParser, compileGrammar } from "../tools.js";

assert_group(sequence, 10000, () => {

    const parse_test_1_result = {
        ty: 'js',
        stmts: [
            {
                ty: 'var',
                assignments: [
                    {
                        ty: 'assignment',
                        left: { ty: 'id', val: 'test' },
                        right: { ty: 'num', val: '3' }
                    }
                ]
            },
            {
                ty: 'block',
                statements: [
                    {
                        ty: 'expression_statement',
                        exprs: [
                            {
                                ty: 'add',
                                left: { ty: 'id', val: 'test' },
                                right: {
                                    ty: 'mul',
                                    left: { ty: 'num', val: '2' },
                                    right: { ty: 'num', val: '1' }
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    };

    //Construct A HCG parser
    const HCGparser = await compileHCGParser(true, true);

    assert("Construct HCG Parser", HCGparser != undefined);

    const mock_js_source = await(URL.resolveRelative("./mock.javascript.hcg").fetchText());

    const mock_js_grammar = await HCGparser(mock_js_source);

    assert("Construct test grammar", mock_js_grammar != undefined);

    const mock_js_parser = await compileGrammar(mock_js_grammar, true);

    assert("Construct test parser", mock_js_parser != undefined);

    assert("Parsed Input Produces Expected Value", mock_js_parser("var test = 3 \n { test + 2 * 1; }").result[0] == parse_test_1_result);

});