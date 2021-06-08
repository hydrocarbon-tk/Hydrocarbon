import { getGrammar } from "./tools.js";
import URL from "@candlelib/uri";
import { constructHybridFunction } from "../build/library/compiler/function_constructor.js";
import { constructCompilerRunner } from "../build/library/compiler/helper.js";
import { AS } from "../build/library/utilities/skribble.js";

const uri = URL.resolveRelative("./source/grammars/misc/skribble.hcg");
const grammar = await getGrammar(uri + "");

const item_lu = grammar;
