import URI from "@candlelib/uri";
import { Helper } from "../build/helper.js";
import * as ParserCore from "../runtime/core_parser.js";
import { ParserFactory } from "../runtime/parser_loader_gamma.js";
import { fillByteBufferWithUTF8FromString } from "../runtime/utf8.js";
import { HCG3Grammar } from "../types/grammar_nodes.js";
import { HCGParserConstructor } from "../types/parser.js";
import { ParserGenerator } from "../types/ParserGenerator";
import { RDProductionFunction } from "../types/rd_production_function.js";
import { generateScriptParser } from "./render.js";


/**
 * Constructs a JavaScript based parser from a grammar, 
 * and optionally recognizer and completer strings.
 * If the recognizer or completer string is empty, then these strings will be compiled before the parser
 * function is created.
 * @param grammar
 * @param recognizer_script
 * @param completer_script
 * @returns
 */


export async function createAddHocParser<T = any>(
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    fn_generate_parser: ParserGenerator = generateScriptParser
): Promise<HCGParserConstructor<T>> {

    const parser_string = await fn_generate_parser(
        grammar,
        recognizer_functions,
        meta,
        "",
        "return",
        "temp_parser",
        "",
        "",
    );

    return new Function(
        "ParserFactory",
        "fillByteBufferWithUTF8FromString",
        "ParserCore",
        "URI",
        parser_string
    )(
        ParserFactory,
        fillByteBufferWithUTF8FromString,
        ParserCore,
        URI
    );
}

