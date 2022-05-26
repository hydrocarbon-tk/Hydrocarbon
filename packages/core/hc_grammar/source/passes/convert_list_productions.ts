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
} from "@hc/common";
import {
    addBodyToProduction,
    addSymbolToBody,
    Body_Has_Parse_Action,
    createProduction,
    createProductionBody,
    createProductionSymbol,
    registerProduction,
    replaceAllBodySymbols,
    setBodyReduceExpressionAction,
    Sym_Is_List_Production
} from "../nodes/common.js";
import { expandOptionalBody, getGeneralProductionSignature, getUniqueProductionSignature } from "./common.js";
import { processGroupSymbol } from "./convert_group_productions.js";

export function convertListProductions(grammar: GrammarObject, error: Error[]): GrammarObject {

    let index = 0;

    for (const production of grammar.productions) {

        grammar.production_hash_lookup = new Map;

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
            if (b.sym.length == 1 && b.sym[0].type == "sym-production" && b.sym[0].name == production.name) { return false; }
            return true;
        });
    }



    return grammar;
}


export function processListSymbol(sym: any, body: HCG3ProductionBody, production: GrammarProduction, meta: any, grammar: GrammarObject, index: number) {

    if (Sym_Is_List_Production(sym)) {

        if (body.sym.length == 1 && !Body_Has_Parse_Action(body) && production.bodies.length == 1) {
            // If the body is simple ( P => a(+) ) and contains no parse actions
            // then unroll the body into two different bodies with synthesized 
            // parse actions that wrap the parsed tokens into an array
            // ( P => a ) and ( P => P a )
            const inner_symbol = sym.val,
                terminal_symbol = sym.terminal_symbol,
                /** Contains the normal pattern */
                new_production_body = createProductionBody(<any>sym),
                /** Contains the left recursive pattern */
                new_production_symbol = createProductionSymbol(production.name, 0, sym),

                TERMINAL_SYMBOL_IS_QUOTE = ["\"", "'", "`"].includes(terminal_symbol?.val);


            if (TERMINAL_SYMBOL_IS_QUOTE) {

                setBodyReduceExpressionAction(body, "str($1)");

                setBodyReduceExpressionAction(new_production_body, "str($__first__) + str($__last__)");
            } else {

                setBodyReduceExpressionAction(body, "[$1]");

                setBodyReduceExpressionAction(new_production_body, "$__first__ + $__last__");
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
                new_production = createProduction(new_production_name, <any>sym),
                new_production_body = createProductionBody(<any>sym);

            new_production_body.priority = body.priority;

            addSymbolToBody(new_production_body, sym);

            addBodyToProduction(new_production, new_production_body);

            new_production = registerProduction(grammar, getGeneralProductionSignature(new_production), new_production);

            const new_production_symbol = createProductionSymbol(new_production.name, sym.IS_OPTIONAL, sym);

            new_production_symbol.IS_OPTIONAL = sym.IS_OPTIONAL;

            meta.mutate(new_production_symbol);
        }

        return true;
    }

    return false;
}
