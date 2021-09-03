import { copy, traverse } from "@candlelib/conflagrate";
import {
    ExportPreamble,
    GrammarObject,
    GrammarProduction,
    HCG3Symbol,
    ImportProductionNode,
    ProductionNode
} from '../../types/grammar_nodes';
import { InstructionType, IR_Instruction, IR_State } from '../../types/ir_types';
import { createProductionSymbol, getProductionByName } from "../nodes/common.js";
import { getUniqueSymbolName } from '../nodes/symbol.js';

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

        for (const { node, meta: { mutate } } of traverse(grmmr, "productions").makeMutable()) {

            const production: (GrammarProduction) = <any>node;

            if (production.type == "production-import") {

                const imported = getImportedGrammarFromReference(grmmr, production.name.module);

                const name = imported.grammar.common_import_name + "__" + production.name.production;

                if (imported_productions.has(name)) {

                    // //Integrate the production 
                    integrateImportedProductions(grammar, grmmr, production, imported_productions);
                    //And merge the production body into mthe target production
                    imported_productions.get(name).bodies = [...production.bodies];
                }

            } else if (production.type == "production-merged-import") {

                const imported = getImportedGrammarFromReference(grmmr, production.name.module);

                const name = imported.grammar.common_import_name + "__" + production.name.production;

                if (imported_productions.has(name)) {

                    //  //Integrate the production 
                    integrateImportedProductions(grammar, grmmr, production, imported_productions);
                    //And merge the production body into the target production
                    imported_productions.get(name).bodies.push(...production.bodies);

                    mutate(null);
                }
            } else {
                integrateImportedProductions(grammar, grmmr, production, imported_productions);
            }
        }

        for (const ir_state of grmmr.ir_states) {

            remapImportedIRStates(ir_state, grammar, grmmr, imported_productions);

            if (grammar != grmmr)
                grammar.ir_states.push(ir_state);
        }

        for (const export_preamble of grmmr.preamble.filter((p): p is ExportPreamble => p.type == "export")) {
            //@ts-ignore
            export_preamble.production = processImportedBody([export_preamble.production], grammar, grmmr, imported_productions)[0];
        }
    }


}

function remapImportedIRStates(ir_state: IR_State, grammar: GrammarObject, grmmr: GrammarObject, imported_productions: Map<any, any>) {

    if (typeof ir_state.id != "string") {

        //@ts-ignore
        ir_state.id = processImportedBody([ir_state.id], grammar, grmmr, imported_productions)[0];

        // Replace symbol with the string literal name
        // Append %%%% this state is used for recovery
        // of the target production.
        //@ts-ignore
        ir_state.id = "%%%%" + ir_state.id.name;
    }

    remapImportedIRSymbols(ir_state.instructions, grammar, grmmr, imported_productions);

    if (ir_state.fail) {
        remapImportedIRStates(ir_state.fail, grammar, grammar, imported_productions);
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
            case InstructionType.consume:
            case InstructionType.peek:
            case InstructionType.prod:
            case InstructionType.scan_back_until:
            case InstructionType.scan_until:

                instruction.ids = instruction.ids.map(
                    d => {
                        if (typeof d == "number")
                            return d;
                        return <any>processImportedBody([d], root_grammar, source_grammar, imported_productions)[0];
                    }
                );

                if ("instructions" in instruction) {
                    remapImportedIRSymbols(instruction.instructions, root_grammar, source_grammar, imported_productions);
                } break;
            case InstructionType.set_prod:
                //case InstructionType.set_token:
                if (typeof instruction.id != "number") {
                    //@ts-ignore
                    instruction.id = processImportedBody([instruction.id], root_grammar, source_grammar, imported_productions)[0];
                } break;
            case InstructionType.fork_to:

                instruction.states = instruction.states.map(
                    d => {
                        if (typeof d == "string")
                            return d;
                        //@ts-ignore
                        return <any>processImportedBody([d], root_grammar, source_grammar, imported_productions)[0];
                    }
                ); break;
            case InstructionType.goto:
                if (typeof instruction.state != "string") {
                    //@ts-ignore
                    instruction.state = processImportedBody([instruction.state], root_grammar, source_grammar, imported_productions)[0];
                } break;
        }
    }
}

function integrateImportedProductions(root_grammar: GrammarObject, local_grammar: GrammarObject, production: GrammarProduction, imported_productions: Map<any, any>) {
    for (const body of production.bodies)
        body.sym = processImportedBody(body.sym, root_grammar, local_grammar, imported_productions);
}
function processImportedBody(symbols: HCG3Symbol[], root_grammar: GrammarObject, local_grammar: GrammarObject, imported_productions: Map<any, any>): HCG3Symbol[] {

    const NOT_ORIGIN = root_grammar != local_grammar;

    const syms = [];

    for (const symbol of symbols)
        syms.push(processSymbol(symbol, NOT_ORIGIN, root_grammar, local_grammar, imported_productions));

    return syms;
}
function processSymbol(sym: HCG3Symbol, NOT_ORIGIN: boolean, root_grammar: GrammarObject, local_grammar: GrammarObject, imported_productions: Map<any, any>):
    HCG3Symbol {


    if (NOT_ORIGIN && (sym.type == "sym-production" || sym.type == "production_token")) {

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

    } else if (sym.type == "list-production") {
        sym.val = processImportedBody([sym.val], root_grammar, local_grammar, imported_productions)[0];
    } else if (sym.type == "group-production") {

        for (const body of sym.val)
            body.sym = processImportedBody(body.sym, root_grammar, local_grammar, imported_productions);

    } else if (sym.type == "sym-production-import") {

        const imported = getImportedGrammarFromReference(local_grammar, sym.module);
        //Convert symbol to a local name
        //Find the production that is referenced in the grammar
        const prd = getProductionByName(imported.grammar, sym.production);

        if (!prd) {
            sym.pos.throw(`Unable to import production [${sym.production}] from [${sym.module}]\n ( alias of file://${imported.uri} ):
    Production was not found.`);
        }


        const name = imported.grammar.common_import_name + "__" + prd.name;

        const prod = createProductionSymbol(name, sym.IS_OPTIONAL || 0, sym);

        if (!imported_productions.has(name)) {

            //copy production and convert the copies name to a local name 
            const cp = copy(prd);

            cp.name = name;


            cp.grammar_id = imported.grammar.common_import_name;

            imported_productions.set(name, cp);

            if (name == "html__ATTRIBUTES")
                debugger;

            root_grammar.productions.push(cp);

            integrateImportedProductions(root_grammar, imported.grammar, cp, imported_productions);
        }

        return prod;
    }

    return sym;
}

function getImportedGrammarFromReference(local_grammar: GrammarObject, module_name: string) {
    return local_grammar.imported_grammars.filter(g => g.reference == module_name)[0];
}
