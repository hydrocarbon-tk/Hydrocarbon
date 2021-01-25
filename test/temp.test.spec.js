import { constructCompilerRunner } from "@candlefw/hydrocarbon/build/library/compiler/helper.js";
import { AS } from "@candlefw/hydrocarbon/build/library/utilities/skribble.js";
import { compileGrammars } from "@candlefw/hydrocarbon";
import URL from "@candlefw/url";
import { constructHybridFunction } from "../build/library/compiler/function_constructor.js";

const url = URL.resolveRelative("../../js/source/grammar/javascript.hcg");

const grammar_string = await url.fetchText();
let g;
if (typeof grammar == "undefined") {
    grammar = await compileGrammars(grammar_string, url + "");
}

g = grammar;

const helper = constructCompilerRunner(false, false);
//todo: 94
const { fn } = constructHybridFunction(grammar[43], grammar, helper);

assert(32000, Object.assign(new AS, fn).renderCode() == 10);