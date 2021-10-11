//import parser_loader from "../build/library/grammar/hcg_parser.js";
import parser_loader from "../../wick/build/library/compiler/source-code-parse/parser_new.js";
//import parser_loader from "../../js/build/library/parser/parser_new.js";
import env from "../../wick/build/library/compiler/source-code-parse/env.js";
import { JSParserEnvironment } from "@candlelib/js";
import { compileGrammarFromURI } from "../build/library/grammar/compile.js";


const { parse: parser, entry_points } = await parser_loader;

import fs from "fs";
import { ext, renderCompressed } from "@candlelib/js";

//const string = await fs.promises.readFile("./source/grammars/hcg/productions.hcg", { encoding: "utf8" });

const string = `
<style>
body {
    color: linear-gradient(10deg, blue 10%, red)
}
</style>
`;
console.time();
const result = parser(string, env);
console.timeEnd();

//const ast = ext(result.result[0], true);
//console.dir({ ast }, { depth: null });
console.dir(result.result[0], { depth: null });

//console.log(renderCompressed(ast));

console.log(result.err);

//const grammar = await compileGrammarFromURI("./source/grammars/hcg/hcg.hcg", parser);

//console.log(grammar);z
