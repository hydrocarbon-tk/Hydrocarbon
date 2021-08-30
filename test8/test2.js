import parser_loader from "../build/library/build/state_ir.js";
import { JSParserEnvironment } from "@candlelib/js";
const parser = await parser_loader;

import fs from "fs";

const string = await fs.promises.readFile("../wick/source/grammars/wick.hcg", { encoding: "utf8" });


console.dir(parser(`
state [c3eb751f]
    consume [22] (
        goto state [A] then repeat state
    )

    noconsume [22] (
        goto state [c3eb751f]
    )

    on fail state [failed_state]
        on prod [ g:sp ] (
            pass
        )
    

`), { depth: null });
