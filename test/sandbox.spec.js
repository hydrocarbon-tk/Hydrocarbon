import URL from "@candlefw/url";
import fs from "fs";
import { constructHybridFunction } from "../build/library/compiler/function_constructor.js";
import { constructCompilerRunner } from "../build/library/compiler/helper.js";
import { skRenderAsSK, skRenderAsTypeScript } from "../build/library/skribble/skribble.js";
import { getGrammar } from "./tools.js";

const fsp = fs.promises;

const uri = URL.resolveRelative("./source/grammars/misc/skribble.hcg");
const grammar = await getGrammar(uri + "");

const prod = grammar[27];
const runner = constructCompilerRunner(true);
const { fn } = constructHybridFunction(prod, grammar, runner);
//const { const: constants_a, fn: const_functions_a } = runner.render_constants();

//const str = fn.map(sk => sk ? skRenderAsSK(sk) : "").join("\n");
const str = fn.map(sk => sk ? skRenderAsTypeScript(sk) : "").join("\n");

//const code = Object.assign(new AS, fn).addStatement(...constants_a, ...const_functions_a).renderCode();

//await fsp.writeFile("./test/temp-function.ts", code);
console.log(str);
assert(20000, inspect, str == "null");