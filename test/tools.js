import URL from "@candlelib/uri";
import { buildJSParserStrings, compileRecognizer, createAddHocParser } from "../build/library/compiler/compiler.js";
import {
    compileGrammarFromString
} from "../build/library/grammar3/compile.js";

/**
 * Compile a parser from a file path or an input string
 */
export async function compileGrammarSource(string_or_url, DEBUG = false, recognizer_type = "js") {

    await URL.server();

    const url = URL.resolveRelative(string_or_url);

    let string = string_or_url;

    if (await url.DOES_THIS_EXIST())
        try {
            string = await url.fetchText();
        } catch (e) { }

    const
        compiled_grammar = await compileGrammarFromString(string),
        { recognizer_functions, meta, }
            = await compileRecognizer(compiled_grammar, 1, true),
        { recognizer_script, completer_script }
            = buildJSParserStrings(compiled_grammar, recognizer_functions, meta);

    return await createAddHocParser(compiled_grammar, recognizer_script, completer_script);
}