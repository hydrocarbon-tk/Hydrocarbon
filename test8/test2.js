import parser_loader from "../build/library/build/table_code.js";
import { JSParserEnvironment } from "@candlelib/js";
const parser = await parser_loader;

import fs from "fs";

const string = await fs.promises.readFile("../wick/source/grammars/wick.hcg", { encoding: "utf8" });


console.dir(parser(`
state [start_goto]
    on prod [ 1] (
        goto state [01acbb93] then goto state [start_goto]
    )

    on prod [ 4] (
        goto state [d96e3273] then goto state [start_goto]
    )

    on prod [ 2] (
        goto state [1799b1d2] then goto state [start_goto]
    )

    on prod [ 5] (
        goto state [0a5f22fd] then goto state [start_goto]
    )
`), { depth: null });
