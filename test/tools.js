import { constructCompilerEnvironment } from "../build/library/grammar/grammar_parser.js";
import { compileGrammars } from "@candlefw/hydrocarbon";
import URL from "@candlefw/url";
import { compile } from "../build/library/compiler/compiler.js";
import { createGrammar } from "../build/library/grammar/compile_grammar.js";

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
export async function compileHCGParser(USE_CACHED = false, DEBUG = false) {

    if (USE_CACHED && HC_parser) return HC_parser;

    await URL.server();

    const url = await URL.resolveRelative("../source/grammars/hcg/hcg.hcg", import.meta.url);

    const grammar_string = await url.fetchText();

    const grammar = await compileGrammars(grammar_string, url + "");

    const parser = await compile(grammar, {}, {
        recognizer_type: "js",
        completer_type: "js",
        output_dir: URL.resolveRelative("./temp/hcg_parser/", import.meta.url),
        combine_recognizer_and_completer: true,
        create_function: true,
        no_file_output: !DEBUG,
        number_of_workers: 1,
        add_annotations: DEBUG,
        debug: DEBUG
    });

    const output = async function (string) {
        const grammar = await createGrammar(string, "", parser);
        return grammar;
    };

    if (!HC_parser)
        HC_parser = output;

    return output;
}

export async function compileBasicHCGParser(USE_CACHED = false, DEBUG = false) {

    if (USE_CACHED && HC_parser) return HC_parser;

    await URL.server();

    const url = await URL.resolveRelative("../source/grammars/hcg/hcg.hcg", import.meta.url);

    const grammar_string = await url.fetchText();

    const grammar = await compileGrammars(grammar_string, url + "");

    const parser = await compile(grammar, {}, {
        recognizer_type: "js",
        completer_type: "js",
        output_dir: URL.resolveRelative("./temp/hcg_parser/", import.meta.url),
        combine_recognizer_and_completer: true,
        create_function: true,
        no_file_output: !DEBUG,
        number_of_workers: 1,
        add_annotations: DEBUG,
        debug: DEBUG
    });

    return parser;
}

export async function getGrammar(string_or_url, parser) {
    await URL.server();

    const url = new URL(string_or_url);

    let string = string_or_url;

    if (await url.DOES_THIS_EXIST())
        string = await url.fetchText();


    return await compileGrammars(string, url + "", parser);
}

/**
 * Compile a grammar from a file path or an input string
 */
export async function compileGrammarSource(string_or_url, DEBUG = false) {

    await URL.server();

    const url = URL.resolveRelative(string_or_url);

    let string = string_or_url;

    if (await url.DOES_THIS_EXIST())
        try {
            string = await url.fetchText();
        } catch (e) { }

    const
        grammar = await compileGrammars(string, url + "");

    const
        parser = await compile(grammar, {}, {
            recognizer_type: "js",
            completer_type: "js",
            output_dir: URL.resolveRelative("./temp/parser_from_source/", import.meta.url),
            combine_recognizer_and_completer: true,
            create_function: true,
            no_file_output: !DEBUG,
            number_of_workers: 1,
            add_annotations: DEBUG,
            debug: DEBUG
        });

    return function (string, env = {}) {
        return parser(string, env);
    };
}

/**
 * Compile a parser from a grammar object
 */
export async function compileGrammar(grammar, DEBUG = false) {

    const
        parser = await compile(grammar, {}, {
            recognizer_type: "js",
            completer_type: "js",
            output_dir: URL.resolveRelative("./temp/parser_from_grammar_obj/", import.meta.url),
            combine_recognizer_and_completer: true,
            create_function: true,
            no_file_output: !DEBUG,
            number_of_workers: 1,
            add_annotations: DEBUG,
            debug: DEBUG
        });

    return function (string, env = {}) {
        return parser(string, env);
    };
}