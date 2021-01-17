import { constructCompilerEnvironment } from "../build/library/grammar/grammar_parser.js";
import { compileGrammars } from "@candlefw/hydrocarbon";
import URL from "@candlefw/url";
import { compileHybrid } from "../build/library/compiler/hybrid_compiler.js";

var HC_parser = null;



/**
 * Create new parser environment for a HCG parser
 */
export function createEnvironment() {
    let env = constructCompilerEnvironment(url + "", { count: 0 }, { count: 0 }, 112, new Map);
    env.fn = env.functions;
    return env;
}

/**
 * Loads and compiles new HCG parser.
 * 
 * Returns function that can be used to load a parser
 * file and compile a DSL parser.
 */
export async function compileHCGParser(USE_CACHED = false) {

    if (USE_CACHED && HC_parser) return HC_parser;

    await URL.server();

    const grammar_string = (await URL.resolveRelative("../source/grammars/hcg/hcg.hcg").fetchText());

    const grammar = await compileGrammars(grammar_string, url + "");

    const parser = await compileHybrid(grammar, {}, {
        type: "wasm",
        wasm_output_dir: "./temp/",
        ts_output_dir: "./temp/",
        combine_wasm_with_js: true,
        create_function: true,
        optimize: true,
        no_file_output: true,
        number_of_workers: 2,
        add_annotations: false,
        debug: false
    });


    const output = function parse(string) {
        const env = createEnvironment();
        return parser(string, env);
    };

    return output;
}
/**
 * Compile a grammar from a file path or an input string
 */
export async function compileGrammar(string_or_url, USE_WEB_ASSEMBLY) {

    await URL.server();

    const url = new URL(string_or_url);

    let string = string_or_url;

    if (await url.DOES_THIS_EXIST())
        string = await url.fetchText();

    const
        grammar = await compileGrammars(string, url + ""),
        parser = await compileHybrid(grammar, {}, {
            type: "javascript",
            wasm_output_dir: URL.resolveRelative("./test/temp/"),
            ts_output_dir: URL.resolveRelative("./test/temp/"),
            combine_recognizer_and_completer: true,
            create_function: true,
            optimize: true,
            no_file_output: true,
            number_of_workers: 2,
            add_annotations: false,
            debug: true
        });

    return function (string, env = {}) {
        return parser(string, env);
    };
}