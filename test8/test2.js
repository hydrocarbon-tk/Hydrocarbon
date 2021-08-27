import parser_loader from "../build/library/build/table_code.js";
import { JSParserEnvironment } from "@candlelib/js";
const parser = await parser_loader;

import fs from "fs";

const string = await fs.promises.readFile("../wick/source/grammars/wick.hcg", { encoding: "utf8" });


console.dir(parser(`
state [c3eb751f]
    on prod [22] (
        fork to(state [A], state[B])
    )

    on prod [22] (
        goto state [c3eb751f]
    )

`), { depth: null });
