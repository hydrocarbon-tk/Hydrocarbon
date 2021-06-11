import { copy, traverse } from "@candlelib/conflagrate";
import {
    HCG3Grammar,
    HCG3Production,
    HCG3Symbol,
    HCGProductionBody
} from "../types/grammar_nodes";
import { createProductionSymbol, getProductionByName } from "./common.js";

/**
 * Responsible discovering and collecting ALL imported modules.
 * Multiple references to the same module are resolved and import
 * names are unified
 */
export async function integrateImportedGrammars(grammar: HCG3Grammar, imports: Map<string, HCG3Grammar> = new Map) {
    //pull imports from the input grammar metadata
    // Unify grammar names
    // - create a common name for every imported grammar
    let i = 0;

    const imported_productions = new Map();

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

                    //Integrate the production 
                    integrateImportedGrammars(grammar, grmmr, production, imported_productions);

                    //And merge the production body into the target production
                    imported_productions.get(name).bodies = [...production.bodies];
                }

            } else if (production.type == "production-merged-import") {

                const imported = getImportedGrammarFromReference(grmmr, production.name.module);

                const name = imported.grammar.common_import_name + "__" + production.name.production;

                if (imported_productions.has(name)) {

                    //Integrate the production 
                    integrateImportedGrammars(grammar, grmmr, production, imported_productions);

                    //And merge the production body into the target production
                    imported_productions.get(name).bodies.push(...production.bodies);

                    mutate(null);
                }
            }

}
function integrateImportedProductions(root_grammar: HCG3Grammar, local_grammar: HCG3Grammar, production: HCG3Production, imported_productions: Map<any, any>) {
    for (const body of production.bodies)
        processImportedBody(body, root_grammar, local_grammar, imported_productions);
}
function processImportedBody(body: HCGProductionBody, root_grammar: HCG3Grammar, local_grammar: HCG3Grammar, imported_productions: Map<any, any>) {
    for (const { node: sym, meta: { mutate } } of traverse(body, "sym").makeMutable()) {

        if (root_grammar != local_grammar) {
            processForeignSymbol(sym, local_grammar, imported_productions, root_grammar);
        }

        if (sym.type == "sym-production-import") {
            const imported = getImportedGrammarFromReference(local_grammar, sym.module);

            //Convert symbol to a local name
            //Find the production that is referenced in the grammar
            const prd = getProductionByName(imported.grammar, sym.production);
            const name = imported.grammar.common_import_name + "__" + prd.name;


            const prod = createProductionSymbol(name, sym.IS_OPTIONAL || false, sym);

            mutate(prod);

            if (imported_productions.has(name)) {
            } else {

                //copy production and convert the copies name to a local name 
                const cp = copy(prd);
                cp.name = name;

                imported_productions.set(name, cp);
                root_grammar.productions.push(cp);

                integrateImportedProductions(root_grammar, imported.grammar, cp, imported_productions);
            }
        }
    }
}
function processForeignSymbol(sym: HCG3Symbol, local_grammar: HCG3Grammar, imported_productions: Map<any, any>, root_grammar: HCG3Grammar) {

    if (sym.type == "list-production") {

        const list_sym = sym.val;

        processForeignSymbol(<any>list_sym, local_grammar, imported_productions, root_grammar);

    } else if (sym.type == "group-production") {

        for (const body of sym.val)
            processImportedBody(body, root_grammar, local_grammar, imported_productions);

    } else if (sym.type == "sym-production" || sym.type == "production_token") {

        const original_name = sym.name;

        const name = local_grammar.common_import_name + "__" + original_name;

        sym.name = name;

        if (imported_productions.has(name)) {
        } else {

            const prd = getProductionByName(local_grammar, original_name);

            if (prd) {
                const cp = copy(prd);
                cp.name = name;
                imported_productions.set(name, cp);
                root_grammar.productions.push(cp);
                integrateImportedProductions(root_grammar, local_grammar, cp, imported_productions);
            }
        }
    }
}
function getImportedGrammarFromReference(local_grammar: HCG3Grammar, module_name: string) {
    return local_grammar.imported_grammars.filter(g => g.reference == module_name)[0];
}
