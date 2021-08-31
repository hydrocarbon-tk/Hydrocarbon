/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { getStartItemsFromProduction } from '../build/table_constructor.js';
import { GrammarObject, ProductionTokenSymbol, ProductionSymbol, SymbolType } from "../types/grammar_nodes.js";
import { getClosure } from "./closure.js";
import { Item } from "./item.js";


export function getProductionClosure(production_id: number, grammar: GrammarObject, ENTER_TOKEN_PRODUCTIONS: boolean = false) {
    const prod = grammar.productions[production_id];
    return getClosure(getStartItemsFromProduction(prod), grammar, ENTER_TOKEN_PRODUCTIONS);
}

export function doesProductionHaveEmpty(production_id: number, grammar: GrammarObject) {
    const production = grammar.productions[production_id];

    if (production.CHECKED_FOR_EMPTY)
        return production.HAS_EMPTY;

    const HAS_EMPTY = getProductionClosure(production_id, grammar).some(i => i.len == 0 || (i.len == 1 && i.offset == 0 && i.sym(grammar).type == SymbolType.EMPTY));

    production.CHECKED_FOR_EMPTY = true;
    production.HAS_EMPTY = HAS_EMPTY;

    return HAS_EMPTY;
}
/**
 * Retrieve the numerical production id from either a ProductionTokenSymbol, a ProductionSymbol,
 * or an Item
 * @param object
 * @param grammar
 */
export function getProductionID(object: ProductionTokenSymbol | ProductionSymbol | Item, grammar: GrammarObject): number {
    if (object instanceof Item)
        return object.getProduction(grammar).id;
    else
        return object.val;
}