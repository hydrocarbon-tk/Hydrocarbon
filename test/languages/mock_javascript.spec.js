import URL from "@candlelib/uri";

import { compileHCGParser, compileGrammar, compileGrammarSource } from "../tools.js";

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

    const mock_js_source = await(URL.resolveRelative("./test/languages/mock.javascript.hcg").fetchText());

    const mock_js_parser = await compileGrammarSource(mock_js_source, true);

    assert("Construct test parser", mock_js_parser != undefined);

    assert("Parsed Input Produces Expected Value", mock_js_parser("var //Test \n test = 3 /* Test */ \n { test + 2 /* Test */ * 1; }").result[0] == parse_test_1_result);

});