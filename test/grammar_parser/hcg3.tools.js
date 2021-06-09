import URL from "@candlelib/uri";
import { adHocParse, compile } from "../../build/library/compiler/compiler.js";
import { getGrammar } from "../tools.js";

let PARSER = null;
/**
 * Builds a HCG3 Grammar parser from source files
 * @returns 
 */
export async function getHCGParser() {

    if (PARSER) return PARSER;

    const uri = URL.resolveRelative("./source/grammars/hcg-3/hcg.hcg");
    const grammar = await getGrammar(uri + "");
    const {
        grammar_functions,
        runner
    } = await compile(grammar, { functions: {} }, {
        name: "test",
        recognizer_type: { js: "js", wasm: "wasm" }["js"],
        completer_type: { js: "js", ts: "ts" }["js"],
        output_dir: "./",
        memory_loader_url: "@candlelib/hydrocarbon",
        optimize: false,
        combine_recognizer_and_completer: true,
        add_annotations: true,
        debug: false,
        number_of_workers: 12
    });

    return (input_string, env = {}) => adHocParse(grammar, grammar_functions, runner, input_string, env);
}