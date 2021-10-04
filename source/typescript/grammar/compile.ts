import URI from "@candlelib/uri";
import "../utilities/array_globals.js";
import { DefinedSymbol, GeneralProductionNode, GrammarObject, HCG3ProductionBody, ProductionNode, TokenSymbol } from "../types/grammar_nodes";
import { HCGParser } from "../types/parser";
import { Sym_Is_A_Generic_Symbol, Sym_Is_A_Production, Sym_Is_A_Production_Token, Sym_Is_Defined } from './nodes/symbol.js';
import {
    buildSequenceString,
    createCollisionMatrix,
    processSymbols,
    render_grammar
} from "./passes/common.js";
import { convertListProductions } from "./passes/convert_list_productions.js";
import { extractMetaSymbolsFromBodies } from "./passes/extract_meta_symbols.js";
import { integrateImportedGrammars } from "./passes/import.js";
import { buildItemMaps } from "./passes/item_map.js";
import {
    loadGrammarFromFile,
    loadGrammarFromString
} from "./passes/load.js";
import { createJSFunctionsFromExpressions } from "./passes/process_js_code.js";

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
        convertListProductions(grammar, errors);
        extractMetaSymbolsFromBodies(grammar, errors);
        deduplicateProductionBodies(grammar, errors);
        distributePriorities(grammar, errors);

        //Meta transformations: Symbols, Functions & Items
        createJSFunctionsFromExpressions(grammar, errors);
        processSymbols(grammar, errors);
        //buildScannerProductions(grammar);
        buildSequenceString(grammar);
        buildItemMaps(grammar);
        createCollisionMatrix(grammar);

    } catch (e) {
        errors.push(e);
    }

    if (errors.length > 0)
        throw new GrammarCompilationReport(errors);

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

    return await compileGrammar(grammar);
}

class GrammarCompilationReport extends Error {
    constructor(errors: Error[]) {
        const messages = errors.map(e => "\n-----\n" + e.stack).join("\n----\n");

        super(messages);
    }
}

function deduplicateProductionBodies(grammar: GrammarObject, error: Error[]) {

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
/*
function buildScannerProductions(grammar: GrammarObject) {

    const symbol_productions = [];

    for (const [name, sym] of grammar.meta.all_symbols) {

        if (!Sym_Is_A_Production(sym) && Sym_Is_Defined(sym)) {
            if (Sym_Is_A_Production_Token(sym)) {


            } else {
                const val = sym.val;

                console.log({ sym });

                let production = <GeneralProductionNode>{
                    type: "production",
                    name: "symbol--" + val,
                    bodies: [],
                    pos: sym.pos
                };
                const body_symbols = sym.val.split("").map(i => {
                    return <DefinedSymbol>{
                        type: "token",
                        val: i,
                        id: [i.codePointAt(0)],
                        pos: sym.pos
                    };
                });

                production.bodies = body_symbols;

                symbol_productions.push(production);

                console.log(production);
            }
        }
    }

    debugger;
} */