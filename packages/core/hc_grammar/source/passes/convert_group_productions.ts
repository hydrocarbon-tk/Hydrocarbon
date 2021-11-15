/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { traverse } from "@candlelib/conflagrate";
import {
    GrammarObject,
    GrammarProduction,
    HCG3ProductionBody
} from "@hctoolkit/common";
import {
    addBodyToProduction,
    Body_Has_Reduce_Action,
    copyBody,
    createProduction,
    createProductionSymbol,
    offsetReduceFunctionSymRefs,
    registerProduction,
    removeBodySymbol,
    replaceBodySymbol,
    Sym_Is_Group_Production
} from "../nodes/common.js";
import { getProductionSignature } from "./common.js";



export function convertGroupProductions(grammar: GrammarObject): GrammarObject {
    let i = 0;
    for (const production of grammar.productions) {

        for (const { node } of traverse(production, "bodies").makeMutable()) {

            const body: HCG3ProductionBody = <any>node;

            for (const { node, meta } of traverse(body, "sym").makeMutable()) {
                const sym: any = node;

                processGroupSymbol(sym, <any>body, meta, production, grammar, i++);
            }
        }
    }
    return grammar;
}


export function processGroupSymbol(sym: any, body: HCG3ProductionBody, meta: any, production: GrammarProduction, grammar: GrammarObject, index: number) {


    if (Sym_Is_Group_Production(sym)) {

        if (sym.IS_OPTIONAL) {

            const new_body = copyBody(body);

            removeBodySymbol(new_body, meta.index);

            addBodyToProduction(production, new_body);
        }

        let i = 0;

        for (const group_body of sym.val) {

            const new_body: HCG3ProductionBody = (i == sym.val.length - 1) ? body : copyBody(body);

            if (Body_Has_Reduce_Action(group_body)) {

                // Complex grouped productions (those with reduce actions) will need to be
                // turned into new productions
                const
                    new_production_name = production.name + "_group_" + index + "_" + i + "_";

                let new_production = createProduction(new_production_name, sym);

                addBodyToProduction(new_production, group_body);

                new_production.priority = group_body.priority || 0;

                new_production = registerProduction(grammar, getProductionSignature(new_production), new_production);

                const new_production_symbol = createProductionSymbol(new_production.name, sym.IS_OPTIONAL, sym);


                if (new_body == body) {
                    meta.mutate(new_production_symbol, true);
                }
                else
                    replaceBodySymbol(new_body, meta.index, new_production_symbol);

            } else {
                // Simple grouped productions bodies with no reduce actions can rolled into the original
                // production as new bodies. Script refs will need to updated to point to the correct
                // symbol indexes after this process is completed. 
                if (new_body == body) {


                    offsetReduceFunctionSymRefs(body, meta.index, group_body.sym.length - 1);

                    meta.mutate(group_body.sym, true);
                }

                else
                    replaceBodySymbol(new_body, meta.index, ...group_body.sym);

            }


            if (new_body != body)
                addBodyToProduction(production, new_body);


            i++;
        }
    }
}
