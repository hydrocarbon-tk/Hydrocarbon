import { Helper } from "../build/helper.js";
import { HCG3Grammar } from "../types/grammar_nodes.js";
import { RDProductionFunction } from "../types/rd_production_function.js";

export type ParserGenerator = (
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    hydrocarbon_import_path?: string,
    export_expression_preamble?: string
) => Promise<string>;
