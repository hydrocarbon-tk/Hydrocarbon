import URI from "@candlelib/uri";
import { HCG3Grammar } from "../types/grammar_nodes";
import {
    buildSequenceString,
    convertListProductions,
    createItemMaps,
    createJSFunctionsFromExpressions,
    createUniqueSymbolSet
} from "./compile_grammar.js";
import { integrateImportedGrammars } from "./import.js";
import {
    loadGrammarFromFile,
    loadGrammarFromString
} from "./load.js";


export async function compileGrammar(grammar: HCG3Grammar) {
    await integrateImportedGrammars(grammar);
    convertListProductions(grammar);
    createJSFunctionsFromExpressions(grammar);
    createUniqueSymbolSet(grammar);
    buildSequenceString(grammar);
    createItemMaps(grammar);

    return grammar;
}

export async function compileGrammarFromString(
    string: string,
    parser
) {
    const grammar = loadGrammarFromString(string, parser);

    return await compileGrammar(grammar);
}


export async function compileGrammarFromURI(
    uri: URI,
    parser
) {
    const grammar = await loadGrammarFromFile(uri, parser);

    return await compileGrammar(grammar);
}

