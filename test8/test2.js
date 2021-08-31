import parser_loader from "../build/library/grammar/hcg_parser.js";
import { JSParserEnvironment } from "@candlelib/js";
const parser = await parser_loader;

import fs from "fs";

const string = await fs.promises.readFile("../wick/source/grammars/wick.hcg", { encoding: "utf8" });


const result = parser(`


@EXPORT test as test

@IMPORT ./test/ as test

<> test > g:sp
<[test_]

    pass

    on fail state [test_2]

    pass

    on fail state [test_3]

    fail

>
<[test_]

    pass

>
`);

console.dir(result, { depth: null });