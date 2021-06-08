import URL from "@candlelib/uri";
import { constructHybridFunction } from "../build/library/compiler/function_constructor.js";
import { constructCompilerRunner } from "../build/library/compiler/helper.js";
import { skRenderAsJavaScript } from "../build/library/skribble/skribble.js";
import { getGrammar } from "./tools.js";

const uri = URL.resolveRelative("./source/grammars/hcg-3/hcg.hcg");
const grammar = await getGrammar(uri + "");

//const uri = URL.resolveRelative("./source/grammars/misc/test.hcg");


const prod = grammar[28];
const runner = constructCompilerRunner(true);
const { fn } = constructHybridFunction(prod, grammar, runner);
const { fn: fn_, const: const_ } = runner.render_constants();
const str = [...fn_, ...const_, ...fn].map(sk => sk ? skRenderAsJavaScript(sk) : "").join("\n");

console.log(str);

assert(20000, inspect, str == "null");