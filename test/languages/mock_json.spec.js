import URL from "@candlelib/uri";
import { compileJSParserFromGrammar } from "../tools.js";

await URL.server();

const parse_test_1_result = { array: [1, 2, { taco: 'pub' }], number: 25.25 };

//Construct A HCG parser
const mock_js_parser = await compileJSParserFromGrammar(URL.resolveRelative("./test/languages/mock.json.hcg") + "");

const data_string =
    `{ 
        "array":[1,2, { "taco" : "pub" }],
        "number": 25.25e0
    }`;

mock_js_parser(data_string);

assert("Parsed Input Produces Expected Value", mock_js_parser(data_string).result[0] == parse_test_1_result);

