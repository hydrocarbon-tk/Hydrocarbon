import { HCGParser } from "@candlelib/hydrocarbon/build/types/types/parser";
import { Helper } from "../build/helper.js";
import { ParserFactoryNext } from "../entry/hydrocarbon.js";
import { HCG3Grammar } from "../types/grammar_nodes.js";
import { ParserGenerator } from "../types/ParserGenerator";
import { RDProductionFunction } from "../types/rd_production_function.js";
import { generateJSParser } from "./render.js";


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
    fn_generate_parser: ParserGenerator = generateJSParser
): Promise<HCGParser<T>> {

    const parser_string = await fn_generate_parser(
        grammar,
        recognizer_functions,
        meta,
        "",
        "return"
    );

    return new Function("ParserFactory", parser_string)(ParserFactoryNext);
}

