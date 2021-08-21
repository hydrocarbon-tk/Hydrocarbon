import { copy, traverse } from "@candlelib/conflagrate";
import {
    HCG3Grammar,
    HCG3Production,
    HCG3Symbol
} from "../../types/grammar_nodes";
import { createProductionSymbol, getProductionByName } from "../nodes/common.js";

/**
 * Responsible discovering and collecting ALL imported modules.
 * Multiple references to the same module are resolved and import
 * names are unified
 */
export function integrateImportedGrammars(grammar: HCG3Grammar, errors: Error[]) {
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
function processImportedObjects(grammar: HCG3Grammar, errors: Error[], imported_productions = new Map()) {

    // In primary grammar, find all import symbols. For each import symbol
    // look in respective grammar file for symbol. Import the production into the 
    // current grammar. Recurse into that production and import any production that have
    // not yet been imported. Repeat until all imported production symbols have been handled


    for (const production of grammar.productions)
        integrateImportedProductions(grammar, grammar, production, imported_productions);

    // Now remove merge productions and insert their bodies into the imported production. 
    // If the import does not exists, then the merge production is discarded
    for (const grmmr of [grammar, ...grammar.imported_grammars.map(g => g.grammar)])
        for (const { node: production, meta: { mutate } } of traverse(grmmr, "productions").makeMutable())
            if (production.type == "production-import") {

                const imported = getImportedGrammarFromReference(grmmr, production.name.module);

                const name = imported.grammar.common_import_name + "__" + production.name.production;

                if (imported_productions.has(name)) {

                    // //Integrate the production 
                    processImportedObjects(grammar, errors);
                    //And merge the production body into the target production
                    imported_productions.get(name).bodies = [...production.bodies];
                }

            } else if (production.type == "production-merged-import") {

                const imported = getImportedGrammarFromReference(grmmr, production.name.module);

                const name = imported.grammar.common_import_name + "__" + production.name.production;

                if (imported_productions.has(name)) {

                    //  //Integrate the production 
                    processImportedObjects(grammar, errors);
                    //And merge the production body into the target production
                    imported_productions.get(name).bodies.push(...production.bodies);

                    mutate(null);
                }
            }
}

function integrateImportedProductions(root_grammar: HCG3Grammar, local_grammar: HCG3Grammar, production: HCG3Production, imported_productions: Map<any, any>) {
    for (const body of production.bodies)
        body.sym = processImportedBody(body.sym, root_grammar, local_grammar, imported_productions);
}
function processImportedBody(symbols: HCG3Symbol[], root_grammar: HCG3Grammar, local_grammar: HCG3Grammar, imported_productions: Map<any, any>): HCG3Symbol[] {

    const NOT_ORIGIN = root_grammar != local_grammar;

    return symbols.map(sym => processSymbol(sym, NOT_ORIGIN, root_grammar, local_grammar, imported_productions));
}
function processSymbol(sym: HCG3Symbol, NOT_ORIGIN: boolean, root_grammar: HCG3Grammar, local_grammar: HCG3Grammar, imported_productions: Map<any, any>):
    HCG3Symbol {

    if (NOT_ORIGIN && sym.type == "list-production") {

        const list_sym = sym.val;

        processImportedBody([list_sym], root_grammar, local_grammar, imported_productions);

    } if (NOT_ORIGIN && (sym.type == "sym-production" || sym.type == "production_token")) {

        const original_name = sym.name;

        const name = local_grammar.common_import_name + "__" + original_name;

        sym.name = name;

        if (!imported_productions.has(name)) {

            const prd = getProductionByName(local_grammar, original_name);

            if (prd) {
                const cp = copy(prd);

                cp.name = name;

                cp.grammar_id = local_grammar.common_import_name;

                imported_productions.set(name, cp);

                root_grammar.productions.push(cp);

                integrateImportedProductions(root_grammar, local_grammar, cp, imported_productions);
            }
        }
    } else if (sym.type == "group-production") {

        for (const body of sym.val)
            body.sym = processImportedBody(body.sym, root_grammar, local_grammar, imported_productions);

    } else if (sym.type == "sym-production-import") {

        const imported = getImportedGrammarFromReference(local_grammar, sym.module);
        //Convert symbol to a local name
        //Find the production that is referenced in the grammar
        const prd = getProductionByName(imported.grammar, sym.production);


        const name = imported.grammar.common_import_name + "__" + prd.name;

        const prod = createProductionSymbol(name, sym.IS_OPTIONAL || 0, sym);


        if (!imported_productions.has(name)) {

            //copy production and convert the copies name to a local name 
            const cp = copy(prd);

            cp.name = name;


            cp.grammar_id = imported.grammar.common_import_name;

            imported_productions.set(name, cp);

            root_grammar.productions.push(cp);

            integrateImportedProductions(root_grammar, imported.grammar, cp, imported_productions);
        }

        return prod;
    }

    return sym;
}

function getImportedGrammarFromReference(local_grammar: HCG3Grammar, module_name: string) {
    return local_grammar.imported_grammars.filter(g => g.reference == module_name)[0];
}
