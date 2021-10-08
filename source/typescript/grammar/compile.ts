import URI from "@candlelib/uri";
import "../utilities/array_globals.js";
import { DefinedSymbol, GeneralProductionNode, GrammarObject, HCG3ProductionBody, HCG3Symbol, ProductionFunction, ProductionNode, SymbolType, TokenSymbol } from "../types/grammar_nodes";
import { HCGParser } from "../types/parser";
import { getSymbolName, Sym_Is_A_Generic_Symbol, Sym_Is_A_Production, Sym_Is_A_Production_Token, Sym_Is_Defined } from './nodes/symbol.js';
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
import grammar_parser from './grammar_parser.js';

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


function integrateReferencedProductions(grammar: GrammarObject, errors) {
    const fn_lu = grammar.functions.filter(fn =>
        "reference" in fn && !("production" in fn)
    ).reduce((r, v) => (r.set(v.reference.val, v), r), new Map);

    for (const production of grammar.productions) {

        for (const body of production.bodies) {

            if (
                body.reduce_function
                &&
                body.reduce_function.ref
                &&
                fn_lu.has(body.reduce_function.ref.val)
            ) {
                const fn = fn_lu.get(body.reduce_function.ref.val);
                body.reduce_function = <ProductionFunction>{
                    js: "",
                    txt: fn.txt,
                    type: "RETURNED",
                    tok: fn.tok
                };
            }
        }
    }

    outer: for (const fn of grammar.functions) {

        if ("production" in fn) {

            const production = fn.production.production;

            const index: number[] = fn.index ?? [];

            let bodies: (HCG3ProductionBody | HCG3Symbol)[] = production.bodies,
                body: HCG3ProductionBody | HCG3Symbol = production.bodies[0];

            for (let i = 0; i < index.length; i++) {
                let old_body = body;
                body = bodies[index[i]];

                if (!body) {
                    errors.push(
                        old_body.tok.createError(`Unable to retrieve body at index [ ${index[i]} ] max length is ${bodies.length}`)
                    );
                    continue outer;
                }

                if (
                    body.type == "body"
                ) {
                    bodies = body.sym;
                    continue;
                } else if (
                    body.type == SymbolType.GROUP_PRODUCTION
                ) {
                    bodies = body.val;
                    body = bodies[0];
                    continue;
                } else if (
                    body.type == SymbolType.LIST_PRODUCTION
                ) {
                    const sym = body.val;

                    if (sym.type == SymbolType.GROUP_PRODUCTION) {
                        body = sym.val[0];
                        bodies = sym.val;
                        continue;
                    }
                    body = body.val;
                }

                errors.push(
                    fn.tok.createError(
                        `${body.tok.createError(
                            `Expected production body at location [ ${production.name}[${index.join(" > ") || 0}] ] \nFound [ ${getSymbolName(body)} ] instead`
                        ).message} \n Cannot apply Out-Of-Band function found`,
                        fn.loc + ""
                    )
                );

                continue outer;
            }

            const production_body: HCG3ProductionBody = <HCG3ProductionBody>body;

            if (production_body.reduce_function) {
                errors.push(
                    production_body.reduce_function.tok.createError(
                        production_body
                            .tok.createError(
                                `${fn.tok.createError(
                                    "Cannot set reduce action ", fn.loc + ""
                                ).message}\n on [ ${production.name}[${index.join(">") || 0}] ]`,
                            ).message + "\n Reduce action has already been set"
                    )
                );

                continue outer;
            }

            if ("reference" in fn) {
                production_body.reduce_function = {
                    type: "referenced-function",
                    ref: fn.reference,
                    tok: fn.tok
                };
            } else {
                production_body.reduce_function = {
                    type: "RETURNED",
                    txt: fn.txt,
                    tok: fn.tok
                };
            }
        }
    }
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
        const messages = errors.map(e => "\n-----\n" + e.message).join("\n----\n");

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
                    tok: sym.tok
                };
                const body_symbols = sym.val.split("").map(i => {
                    return <DefinedSymbol>{
                        type: "token",
                        val: i,
                        id: [i.codePointAt(0)],
                        tok: sym.tok
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