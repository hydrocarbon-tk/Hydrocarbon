import parser_loader from "../build/library/build/table_code.js";
import { JSParserEnvironment } from "@candlelib/js";
const parser = await parser_loader;

import fs from "fs";

const string = await fs.promises.readFile("../wick/source/grammars/wick.hcg", { encoding: "utf8" });


console.dir(parser(`
state [c3eb751f]

    peek [ 20 /* τwatermellon */ 22 /* τtomatoes */ 3 /* θid */ 9 /* τgrapes */ 5 /* θnum */ ] 
        then goto state [ad6b2c68]

`), { depth: null });
