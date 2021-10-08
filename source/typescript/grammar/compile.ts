import URI from "@candlelib/uri";
import "../utilities/array_globals.js";
import { DefinedSymbol, GeneralProductionNode, GrammarObject, HCG3ProductionBody, HCG3Symbol, ProductionFunction, ProductionNode, RECURSIVE_STATE, ScannerProductionNode, SymbolType, TokenSymbol } from "../types/grammar_nodes";
import { HCGParser } from "../types/parser";
import { getSymbolName, Sym_Is_A_Generic_Symbol, Sym_Is_A_Generic_Type, Sym_Is_A_Production, Sym_Is_A_Production_Token, Sym_Is_Defined, Sym_Is_Empty, Sym_Is_EOF } from './nodes/symbol.js';
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
import { Token } from '../runtime/token.js';

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

        buildScannerProduction(grammar);

        // Reprocess symbols to incorporate symbols from scanner productions
        processSymbols(grammar, errors);

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

function buildScannerProduction(grammar: GrammarObject) {

    const scanner_production: GeneralProductionNode = {
        type: "production",
        name: "__SCANNER__",
        bodies: [],
        tok: new Token("scanner", "", 0, 0),
        id: -1,
        IS_ENTRY: false,
        RECURSIVE: RECURSIVE_STATE.LEFT_RIGHT,
        priority: 0,
    };

    const productions: ScannerProductionNode[] = [], seen = new Set();

    for (const [name, sym] of grammar.meta.all_symbols) {

        if (!Sym_Is_A_Production(sym)) {
            if (Sym_Is_A_Generic_Type(sym)) {
                if (sym.type == SymbolType.END_OF_FILE || sym.val == "rec")
                    continue;
                const val = sym.val;
                if (["num", "id"].includes(val)) {
                    productions.push(
                        <ScannerProductionNode>
                        loadGrammarFromString(`<> __${val}__ > g:${val} | __${val}__ g:${val}\n`).productions[0]
                    );
                } else {
                    productions.push(
                        <ScannerProductionNode>
                        loadGrammarFromString(`<> __${val}__ > g:${val}\n`).productions[0]
                    );
                }
            } else if (Sym_Is_A_Production_Token(sym)) {

                let prods: GeneralProductionNode[] = [sym.production];

                for (const production of prods) {

                    const name = `__${production.name}__`;

                    if (seen.has(name))
                        continue;

                    seen.add(name);

                    const bodies = [];

                    for (const body of production.bodies) {
                        let str = [];
                        for (const sym of body.sym) {
                            if (Sym_Is_A_Generic_Type(sym)) {
                                if (Sym_Is_EOF(sym)) continue;
                                str.push(`__${sym.val}__`);
                            } else if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym)) {
                                const name = sym.name;
                                str.push(`__${name}__`);
                                prods.push(sym.production);
                            } else if (Sym_Is_Defined(sym)) {
                                const val = sym.val;
                                const syms = val.split("");
                                str.push(...syms.map(s => `\\${s} `));
                            }
                        }

                        bodies.push(str.join(" "));
                    }

                    productions.push(
                        <ScannerProductionNode>
                        loadGrammarFromString(`<> ${name} > ${bodies.join(" | ")}\n`).productions[0]
                    );
                }

            } else if (Sym_Is_Defined(sym) &&
                !(Sym_Is_Empty(sym) || Sym_Is_EOF(sym))) {

                const val = sym.val;

                const syms = val.split("");

                productions.push(
                    <ScannerProductionNode>
                    loadGrammarFromString(`<> __${val}__ > ${syms.map(s => `\\${s} `).join(" ")}\n`).productions[0]
                );

            }
        }
    }

    for (const production of productions) {
        production.name = production.symbol.name;
        production.type = "scanner-production";
    }
    const ubber_prod =
        <ScannerProductionNode>
        loadGrammarFromString(`<> __SCANNER__ > ${productions.map(p => p.name).join(" | ")}\n`).productions[0];
    ubber_prod.name = ubber_prod.symbol.name;;
    ubber_prod.type = "scanner-production";

    productions.unshift(ubber_prod);

    console.log(render_grammar({
        type: "hc-grammar-5",
        productions
    }));

    grammar.productions.push(...productions);
}