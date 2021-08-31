import { Helper } from "../build/helper.js";
import { GrammarObject } from "../types/grammar_nodes.js";
import { RDProductionFunction } from "../types/rd_production_function.js";

export type ParserGenerator = (
    grammar: GrammarObject,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    hydrocarbon_import_path?: string,
    export_expression_preamble?: string,
    namespace?: string,
    outpath?: string,
    js_extension?: string,
    INCLUDE_TYPES?: boolean,
) => Promise<string>;
