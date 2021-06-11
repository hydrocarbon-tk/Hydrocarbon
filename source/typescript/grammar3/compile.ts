import URI from "@candlelib/uri";
import { HCG3Grammar } from "../types/grammar_nodes";
import {
    buildSequenceString,
    convertListProductions,
    createItemMaps,
    createJSFunctionsFromExpressions,
    createUniqueSymbolSet
} from "./optimize.js";
import { integrateImportedGrammars } from "./import.js";
import {
    loadGrammarFromFile,
    loadGrammarFromString
} from "./load.js";


class GrammarCompilationReport extends Error {
    constructor(errors: Error[]) {
        const messages = errors.map(e => "\n-----\n" + e.stack).join("\n----\n");

        super(messages);
    }
}

export async function compileGrammar(grammar: HCG3Grammar) {
    const errors: Error[] = [];

    try {
        await integrateImportedGrammars(grammar, errors);
        convertListProductions(grammar, errors);
        createJSFunctionsFromExpressions(grammar, errors);
        createUniqueSymbolSet(grammar, errors);
        buildSequenceString(grammar);
        createItemMaps(grammar);
    } catch (e) {
        errors.push(e);
    }

    if (errors.length > 0)
        throw new GrammarCompilationReport(errors);

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

