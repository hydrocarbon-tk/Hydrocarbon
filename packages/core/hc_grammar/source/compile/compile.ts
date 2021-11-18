/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { HCGParser } from "@candlelib/hydrocarbon";
import URI from "@candlelib/uri";
import {
    GrammarObject,
    HCG3ProductionBody
} from "@hctoolkit/common";
import { buildScannerProduction } from '../passes/scanner_production';
import {
    createCollisionMatrix,
    processSymbols,
    render_grammar
} from "../passes/common.js";
import { convertListProductions } from "../passes/convert_list_productions.js";
import { extractMetaSymbolsFromBodies } from "../passes/extract_meta_symbols.js";
import { integrateImportedGrammars } from "../passes/import.js";
import { buildItemMaps } from "../passes/item_map.js";
import {
    loadGrammarFromFile,
    loadGrammarFromString
} from "../passes/load.js";
import { integrateReferencedProductions } from '../passes/referenced_production';

/**
 * Takes a raw root grammar object and applies transformation
 * operations to it to prepare the grammar for consumption by 
 * the compiler build and render processes.
 */
export async function compileGrammar(grammar: GrammarObject):
    Promise<GrammarObject> {

    const errors: Error[] = [];

    try {

        //Production and Body transformations.
        integrateImportedGrammars(grammar, errors);

        integrateReferencedProductions(grammar, errors);

        convertListProductions(grammar, errors);

        extractMetaSymbolsFromBodies(grammar, errors);

        deduplicateProductionBodies(grammar, errors);

        distributePriorities(grammar, errors);

        //Meta transformations: Symbols, Functions & Items
        processSymbols(grammar, errors);

        buildScannerProduction(grammar);

        // Reprocess symbols to incorporate symbols from scanner productions
        processSymbols(grammar, errors);

        buildItemMaps(grammar);

        createCollisionMatrix(grammar);

    } catch (e) {

        if (e instanceof Error)
            errors.push(e);
    }

    if (errors.length > 0) {


        throw new GrammarCompilationReport(errors);
    }

    return grammar;
}

export async function compileGrammarFromString(
    string: string,
    parser?: HCGParser
) {
    const grammar = loadGrammarFromString(string, parser);

    return await compileGrammar(grammar);
}

export async function compileGrammarFromURI(
    uri: URI,
    parser?: HCGParser
) {
    const grammar = await loadGrammarFromFile(uri, parser);

    if (grammar)
        return await compileGrammar(grammar);

    return null;
}

export class GrammarCompilationReport extends Error {
    constructor(errors: Error[]) {
        const messages = errors.map(e => "\n-----\n" + e.stack).join("\n----\n");

        super(messages);
    }
}

export function deduplicateProductionBodies(grammar: GrammarObject, error: Error[]) {

    for (const production of grammar.productions) {

        const valid_bodies = [];

        const signatures = new Set;

        for (const body of production.bodies) {

            const sig = render_grammar(Object.assign({}, body, <HCG3ProductionBody>{ reduce_function: null }));

            if (!signatures.has(sig)) {
                valid_bodies.push(body);
                signatures.add(sig);
            }
        }

        production.bodies = valid_bodies;
    }
}

function distributePriorities(grammar: GrammarObject, error: Error[]) {

    for (const production of grammar.productions) {

        if (production.priority > 0)

            for (const body of production.bodies) {

                body.priority = production.priority;
            }
    }
}


