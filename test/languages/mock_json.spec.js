import URL from "@candlelib/uri";
import { compileGrammarSource } from "../tools.js";

await URL.server();
assert_group(sequence, 10000, () => {

    const parse_test_1_result = { array: [1, 2, { taco: 'pub' }], number: 25.25 };

    //Construct A HCG parser
    const mock_js_source = await(URL.resolveRelative("./test/languages/mock.json.hcg").fetchText());

    const mock_js_parser = await compileGrammarSource(mock_js_source);

    const data_string =
        `{ 
        "array":[1,2, { "taco" : "pub" }],
        "number": 25.25e0
    }`;

    assert(i, "Parsed Input Produces Expected Value", mock_js_parser(data_string).result[0] == parse_test_1_result);

});