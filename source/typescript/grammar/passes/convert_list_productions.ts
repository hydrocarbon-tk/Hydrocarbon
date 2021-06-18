import { experimentalConstructRenderers, experimentalRender, traverse } from "@candlelib/conflagrate";
import {
    HCG3Grammar,
    HCG3Production,
    HCGProductionBody
} from "../../types/grammar_nodes";
import {
    addBodyToProduction, addSymbolToBody, Body_Has_Reduce_Action,
    createProduction, createProductionBody, createProductionSymbol,
    registerProduction, replaceAllBodySymbols, setBodyReduceExpressionAction, Sym_Is_List_Production
} from "../nodes/common.js";

import { hcg3_mappings } from "../nodes/mappings.js";
import { getProductionSignature, expandOptionalBody, processGroupSymbol } from "./common.js";


const renderers = experimentalConstructRenderers(hcg3_mappings);
const render = (grammar_node) => experimentalRender(grammar_node, hcg3_mappings, renderers);


export function convertListProductions(grammar: HCG3Grammar, error: Error[]): HCG3Grammar {
    let index = 0;
    for (const production of grammar.productions) {
        for (const body of production.bodies) {
            for (const { node, meta } of traverse(body, "sym").skipRoot().makeMutable()) {

                const sym: any = node;

                if (!processListSymbol(sym, body, production, meta, grammar, index)) {

                    processGroupSymbol(sym, body, meta, production, grammar, index);
                }

                index++;
            }
        }

        expandOptionalBody(production);

        //Remove bodies that are direct recursion: S=>S
        production.bodies = production.bodies.filter(b => {
            if (b.sym.length == 1 && b.sym[0].type == "sym-production" && b.sym[0].name == production.name) {
                return false;
            }
            return true;
        });
    }



    return grammar;
}


export function processListSymbol(sym: any, body: HCGProductionBody, production: HCG3Production, meta: any, grammar: HCG3Grammar, index: number) {
    if (Sym_Is_List_Production(sym)) {

        if (body.sym.length == 1 && !Body_Has_Reduce_Action(body) && production.bodies.length == 1) {
            // If the body is simple ( P => a(+) ) and contains no reduce actions
            // then unroll the body into two different bodies with synthesized 
            // reduce actions that wrap the parsed tokens into an array
            // ( P => a ) and ( P => P a )
            const inner_symbol = sym.val,
                terminal_symbol = sym.terminal_symbol,
                /** Contains the normal pattern */
                new_production_body = createProductionBody(sym),
                /** Contains the left recursive pattern */
                new_production_symbol = createProductionSymbol(production.name),

                TERMINAL_SYMBOL_IS_QUOTE = ["\"", "'", "`"].includes(terminal_symbol?.val);


            if (TERMINAL_SYMBOL_IS_QUOTE) {

                setBodyReduceExpressionAction(body, "$101 + \"\"");

                setBodyReduceExpressionAction(new_production_body, "$1 + $101");
            } else {

                setBodyReduceExpressionAction(body, "[$101]");

                setBodyReduceExpressionAction(new_production_body, "$1.push($101), $1");
            }

            //replaceAllBodySymbols(body, inner_symbol);
            if (terminal_symbol && !TERMINAL_SYMBOL_IS_QUOTE)
                replaceAllBodySymbols(new_production_body, new_production_symbol, terminal_symbol, inner_symbol);

            else
                replaceAllBodySymbols(new_production_body, new_production_symbol, inner_symbol);

            addBodyToProduction(production, new_production_body);

            meta.mutate(inner_symbol, true);

        } else {
            // Otherwise, create a new production with a single body containing 
            // the list symbols, and replace the symbol in the current body with 
            // a reference symbol to the new production. The new production will 
            // subsequently be converted.
            let
                new_production_name = production.name + "_list_" + index,
                new_production = createProduction(new_production_name, sym),
                new_production_body = createProductionBody(sym);

            addSymbolToBody(new_production_body, sym);

            addBodyToProduction(new_production, new_production_body);

            new_production = registerProduction(grammar, getProductionSignature(new_production), new_production);

            const new_production_symbol = createProductionSymbol(new_production.name, sym.IS_OPTIONAL, sym);

            new_production_symbol.IS_OPTIONAL = sym.IS_OPTIONAL;

            meta.mutate(new_production_symbol);
        }

        return true;
    }

    return false;
}