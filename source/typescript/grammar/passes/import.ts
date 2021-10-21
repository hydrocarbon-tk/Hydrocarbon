import { copy, traverse } from "@candlelib/conflagrate";
import { HCG3ProductionBody, ProductionSymbol, SymbolNode } from '../../types/grammar_nodes';
import {
    ExportPreamble,
    GrammarObject,
    GrammarProduction,
    HCG3Symbol, ProductionImportSymbol, ProductionNode, SymbolType
} from '../../types/grammar_nodes';
import { InstructionType, IR_Instruction, IR_State } from '../../types/ir_types';
import { createProductionSymbol, getImportedGrammarFromReference, getProductionByName } from "../nodes/common.js";
import { user_defined_state_mux } from '../nodes/default_symbols.js';

/**
 * Responsible discovering and collecting ALL imported modules.
 * Multiple references to the same module are resolved and import
 * names are unified
 */
export function integrateImportedGrammars(grammar: GrammarObject, errors: Error[]) {
    //pull imports from the input grammar metadata
    // Unify grammar names
    // - create a common name for every imported grammar

    const imported_productions = new Map();

    //Process all imported ignored symbols
    grammar.meta.ignore = grammar.meta.ignore.map(s => processSymbol(s, false, grammar, grammar, imported_productions));

    for (const { grammar: gmmr, reference } of grammar.imported_grammars) {
        gmmr.meta.ignore = gmmr.meta.ignore.map(s => processSymbol(s, true, grammar, gmmr, imported_productions));
    }

    processImportedObjects(grammar, errors, imported_productions);
}
function processImportedObjects(grammar: GrammarObject, errors: Error[], imported_productions: Map<string, ProductionNode> = new Map) {

    // In primary grammar, find all import symbols. For each import symbol
    // look in respective grammar file for symbol. Import the production into the 
    // current grammar. Recurse into that production and import any production that have
    // not yet been imported. Repeat until all imported production symbols have been handled



    // Now remove merge productions and insert their bodies into the imported production. 
    // If the import does not exists, then the merge production is discarded

    for (const grmmr of [grammar, ...grammar.imported_grammars.map(g => g.grammar)]) {

        //Map all normal production name symbols to the production's name
        for (const p of grmmr.productions)
            if (!p.name)
                if (p.symbol.type == "sym-production") {
                    p.name = p.symbol.name;
                } else {
                    const imported = getImportedGrammarFromReference(grmmr, p.symbol.module);
                    p.name = imported.grammar.common_import_name + "__" + p.symbol.name;
                }
    }

    for (const export_preamble of grammar.preamble.filter((p): p is ExportPreamble => p.type == "export")) {
        //@ts-ignore
        export_preamble.production = processImportedSymbolArray([export_preamble.production], grammar, grammar, imported_productions)[0];
    }

    for (const grmmr of [grammar, ...grammar.imported_grammars.map(g => g.grammar)]) {

        for (const { node, meta: { mutate } } of traverse(grmmr, "productions").skipRoot().makeMutable()) {

            const production: (GrammarProduction) = <any>node;

            production.loc = grmmr.URI;

            if (production.symbol.type == SymbolType.IMPORT_PRODUCTION) {

                if (production.type == "production-merged") {

                    const imported = getImportedGrammarFromReference(grmmr, production.symbol.module);

                    const name = imported.grammar.common_import_name + "__" + production.symbol.name;

                    if (imported_productions.has(name)) {

                        //  //Integrate the production 
                        integrateImportedProductions(grammar, grmmr, production, imported_productions);

                        //And merge the production body into the target production
                        imported_productions.get(name).bodies.push(...production.bodies);

                        mutate(null);
                    }

                } else {

                    const imported = getImportedGrammarFromReference(grmmr, production.symbol.module);

                    const name = imported.grammar.common_import_name + "__" + production.symbol.name;

                    if (imported_productions.has(name)) {

                        // //Integrate the production 
                        integrateImportedProductions(grammar, grmmr, production, imported_productions);
                        //And merge the production body into mthe target production
                        imported_productions.get(name).bodies = [...production.bodies];
                    }
                }

            } else {
                integrateImportedProductions(grammar, grmmr, production, imported_productions);
            }
        }
    }

    for (const grmmr of [grammar, ...grammar.imported_grammars.map(g => g.grammar)]) {

        for (const fn of grmmr.functions) {

            if ("production" in fn) {
                fn.production = processImportedSymbolArray<ProductionSymbol>([fn.production], grammar, grmmr, imported_productions)[0];
            }

            if ("reference" in fn && "production" in fn) {
                fn.reference = processImportedSymbolArray<ProductionSymbol>([<any>fn.reference], grammar, grmmr, imported_productions)[0];
            }

            if ("reference" in fn && "txt" in fn && grmmr != grammar) {
                fn.reference.val = grmmr.common_import_name + "__" + fn.reference.val;
            }

            fn.loc = grmmr.URI;

            if (grammar != grmmr)
                grammar.functions.push(fn);
        }

        for (const ir_state of grmmr.ir_states) {

            remapImportedIRStates(ir_state, grammar, grmmr, imported_productions);

            if (grammar != grmmr)
                grammar.ir_states.push(ir_state);
        }
    }
}

function remapImportedIRStates(ir_state: IR_State, grammar: GrammarObject, grmmr: GrammarObject, imported_productions: Map<any, any>) {

    if (typeof ir_state.id != "string") {

        //@ts-ignore
        ir_state.id = processImportedSymbolArray([ir_state.id], grammar, grmmr, imported_productions)[0];


        // Replace symbol with the string literal name
        // Append %%%% this state is used for recovery
        // of the target production.
        //@ts-ignore
        ir_state.id = user_defined_state_mux + ir_state.id.name;
    }

    remapImportedIRSymbols(ir_state.instructions, grammar, grmmr, imported_productions);

    if (ir_state.fail) {
        remapImportedIRStates(ir_state.fail, grammar, grmmr, imported_productions);
    }
}

function remapImportedIRSymbols(
    instructions: IR_Instruction[],
    root_grammar: GrammarObject,
    source_grammar: GrammarObject,
    imported_productions: Map<any, any>
) {

    for (const instruction of instructions) {
        switch (instruction.type) {

            case InstructionType.assert:
            case InstructionType.peek:
            case InstructionType.prod:
            case InstructionType.scan_back_until:
            case InstructionType.scan_until:

                instruction.ids = instruction.ids.map(
                    d => {
                        if (typeof d == "number")
                            return d;
                        return <any>processImportedSymbolArray([d], root_grammar, source_grammar, imported_productions)[0];
                    }
                );

                if ("instructions" in instruction) {
                    remapImportedIRSymbols(instruction.instructions, root_grammar, source_grammar, imported_productions);
                } break;

            case InstructionType.set_prod:
                //case InstructionType.set_token:
                if (typeof instruction.id != "number") {

                    //@ts-ignore
                    instruction.id = processImportedSymbolArray([instruction.id], root_grammar, source_grammar, imported_productions)[0];

                } break;

            case InstructionType.fork_to:

                instruction.states = instruction.states.map(
                    d => {
                        if (typeof d == "string")
                            return d;
                        //@ts-ignore
                        return <any>processImportedSymbolArray([d], root_grammar, source_grammar, imported_productions)[0];
                    }
                ); break;
            case InstructionType.goto:
                if (typeof instruction.state != "string") {
                    //@ts-ignore
                    instruction.state = processImportedSymbolArray([instruction.state], root_grammar, source_grammar, imported_productions)[0];
                } break;
        }
    }
}

function integrateImportedProductions(root_grammar: GrammarObject, local_grammar: GrammarObject, production: GrammarProduction, imported_productions: Map<any, any>) {
    for (const body of production.bodies) {
        processImportedBody(body, root_grammar, local_grammar, imported_productions);

    }
}
function processImportedBody(
    body: HCG3ProductionBody,
    root_grammar: GrammarObject,
    local_grammar: GrammarObject,
    imported_productions: Map<any, any>
) {
    //Resolve locally referenced functions before further processing
    resolveLocalReferencedFunctions(body, local_grammar);

    body.sym = processImportedSymbolArray(body.sym, root_grammar, local_grammar, imported_productions);
}
function resolveLocalReferencedFunctions(body: HCG3ProductionBody, local_grammar: GrammarObject) {

    if (body.reduce_function) {

        const fn = body.reduce_function;

        if (fn.type == "referenced-function") {

            fn.type = "resolved-referenced-function";

            fn.ref.val = local_grammar.common_import_name + "__" + fn.ref.val;
        }
    }
}

function processImportedSymbolArray<T>(
    symbols: HCG3Symbol[],
    root_grammar: GrammarObject,
    local_grammar: GrammarObject,
    imported_productions: Map<any, any>
): T[] {
    const syms = [];


    const NOT_ORIGIN = root_grammar != local_grammar;


    for (const symbol of symbols) {
        if (symbol.type == "meta-exclude"
            ||
            symbol.type == "meta-ignore"
            ||
            symbol.type == "meta-reset") {
            symbol.sym.map(s => processSymbol(s, NOT_ORIGIN, root_grammar, local_grammar, imported_productions));

        }
        syms.push(processSymbol(symbol, NOT_ORIGIN, root_grammar, local_grammar, imported_productions));
    }
    return syms;
}

function processSymbol<T = HCG3Symbol>(
    sym: HCG3Symbol,
    NOT_ORIGIN: boolean,
    root_grammar: GrammarObject,
    local_grammar: GrammarObject,
    imported_productions: Map<any, any>
): T {


    if (NOT_ORIGIN && (
        sym.type == SymbolType.PRODUCTION)
    ) {

        const original_name = sym.name;

        const name = local_grammar.common_import_name + "__" + original_name;

        if (!imported_productions.has(name)) {

            const prd = getProductionByName(local_grammar, sym);

            if (prd) {
                const cp = copy(prd);

                cp.name = name;

                cp.grammar_id = local_grammar.common_import_name;

                imported_productions.set(name, cp);

                root_grammar.productions.push(cp);

                integrateImportedProductions(root_grammar, local_grammar, cp, imported_productions);
            }
        }

        sym.production = imported_productions.get(name);

        sym.name = name;

    } else if (NOT_ORIGIN && (
        sym.type == SymbolType.PRODUCTION_TOKEN_SYMBOL)
    ) {

        const original_name = sym.name;

        let name = local_grammar.common_import_name + "__" + original_name;

        if (sym.production.type == SymbolType.IMPORT_PRODUCTION) {
            sym.production = <ProductionSymbol>processSymbol(sym.production, NOT_ORIGIN, root_grammar, local_grammar, imported_productions);
            sym.name = sym.production.name;
            name = sym.name;
        }

        if (!imported_productions.has(name)) {

            const prd = getProductionByName(local_grammar, sym);

            if (prd) {
                const cp = copy(prd);

                cp.name = name;

                cp.grammar_id = local_grammar.common_import_name;

                imported_productions.set(name, cp);

                root_grammar.productions.push(cp);

                integrateImportedProductions(root_grammar, local_grammar, cp, imported_productions);
            }
        }

        sym.production = imported_productions.get(name);

        sym.name = name;

    } else if (sym.type == SymbolType.LIST_PRODUCTION) {

        sym.val = processImportedSymbolArray([sym.val], root_grammar, local_grammar, imported_productions)[0];

    } else if (sym.type == SymbolType.GROUP_PRODUCTION) {

        for (const body of sym.val)
            processImportedBody(body, root_grammar, local_grammar, imported_productions);

    } else if (sym.type == SymbolType.IMPORT_PRODUCTION) {

        const imported = getImportedGrammarFromReference(local_grammar, sym.module);

        if (!imported)
            throwModuleNotFound(sym, local_grammar);

        //Convert symbol to a local name
        //Find the production that is referenced in the grammar
        const prd = getProductionByName(local_grammar, sym);

        if (!prd)
            throwProductionNotFound(sym, imported, local_grammar);

        const name = imported.grammar.common_import_name + "__" + prd.symbol.name;

        sym = createProductionSymbol(name, sym.IS_OPTIONAL || 0, sym);

        if (!imported_productions.has(name)) {

            //copy production and convert the copy's name to a local name 
            const cp = copy(prd);

            cp.name = name;

            cp.grammar_id = imported.grammar.common_import_name;

            imported_productions.set(name, cp);

            root_grammar.productions.push(cp);

            integrateImportedProductions(root_grammar, imported.grammar, cp, imported_productions);
        }

        sym.production = imported_productions.get(name);
    }

    return sym;
}

function throwProductionNotFound(sym: ProductionImportSymbol, imported: {
    reference: string; uri: string; //@ts-ignore
    //@ts-ignore
    grammar: GrammarObject;
}, local_grammar: GrammarObject) {
    (sym.tok || sym.pos).throw(`Unable to import production [ ${sym.name} ] from \n    [ ${sym.module} ( local alias of file://${imported.uri} ) ]:
    Production was not found.`, local_grammar.URI + "");
}

function throwModuleNotFound(sym: ProductionImportSymbol, local_grammar: GrammarObject) {
    sym.tok.throw(`Could not find module ${sym.module}. 
    Available imported modules within this context are [${[...local_grammar.imported_grammars.values()].map(i => i.reference)}]`
        , local_grammar.URI + "");

}