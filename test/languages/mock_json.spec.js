import URL from "@candlefw/url";

import { compileHCGParser, compileGrammar } from "../tools.js";

assert_group(sequence, 10000, () => {

    const parse_test_1_result = { array: [1, 2, { taco: 'pub' }], number: 25.25 };

    //Construct A HCG parser
    const HCGparser = await compileHCGParser(true);

    assert("Construct HCG Parser", HCGparser != undefined);

    const mock_js_source = await(URL.resolveRelative("./mock.json.hcg").fetchText());

    const mock_js_grammar = await HCGparser(mock_js_source);

    assert("Construct test grammar", mock_js_grammar != undefined);

    const mock_js_parser = await compileGrammar(mock_js_grammar);

    assert("Construct test parser", mock_js_parser != undefined);


    const data_string =
        `{ 
        "array":[1,2, { "taco" : "pub" }],
        "number": 25.25e0
    }`;

    assert("Parsed Input Produces Expected Value", mock_js_parser(data_string).result[0] == parse_test_1_result);

});