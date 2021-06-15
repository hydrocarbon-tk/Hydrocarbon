import URL from "@candlelib/uri";
import { compileGrammarFromString } from "../build/library/grammar/compile.js";
import { createAddHocParser } from "../build/library/render/create_add_hoc_parser.js";

/**
 * Compile a parser from a file path or an input string
 */
export async function compileJSParserFromGrammar(string_or_url, DEBUG = false, recognizer_type = "js") {

    await URL.server();

    const url = URL.resolveRelative(string_or_url);

    let string = string_or_url;

    if (await url.DOES_THIS_EXIST())
        try {
            string = await url.fetchText();
        } catch (e) { }

    const
        compiled_grammar = await compileGrammarFromString(string),
        { recognizer_functions, meta, };

    return await createAddHocParser(compiled_grammar, recognizer_functions, meta);
}