import parser_loader from "../build/library/build/table_code.js";
import { JSParserEnvironment } from "@candlelib/js";
const parser = await parser_loader;

import fs from "fs";

const string = await fs.promises.readFile("../wick/source/grammars/wick.hcg", { encoding: "utf8" });


console.dir(parser(`
state [S_goto]
    on prod [ 1] (
        goto state [5105c42d] then repeat state

    on prod [ 2] (
        goto state [63a41105] then repeat state

    on fail state[S_goto_failed] 
        on prod [ 0 ] ( pass )
`), { depth: null });
