import { EOF_SYM, Grammar } from "../types/grammar.js";
import { ProductionSymbol, ProductionTokenSymbol } from "../types/symbol";
import { SymbolType } from "../types/symbol_type";
import { getClosure } from "./closure.js";
import { Item } from "./item.js";


export function getProductionClosure(production_id: number, grammar: Grammar, ENTER_TOKEN_PRODUCTIONS: boolean = false) {
    const prod = grammar[production_id];
    return getClosure(prod.bodies.map(b => new Item(b.id, b.length, 0, EOF_SYM)), grammar, ENTER_TOKEN_PRODUCTIONS);
}

export function doesProductionHaveEmpty(production_id: number, grammar: Grammar) {
    const production = grammar[production_id];

    if (production.CHECKED_FOR_EMPTY)
        return production.HAS_EMPTY;

    const HAS_EMPTY = getProductionClosure(production_id, grammar).some(i => i.len == 0 || (i.len == 1 && i.offset == 0 && i.sym(grammar).type == SymbolType.EMPTY));

    production.CHECKED_FOR_EMPTY = true;
    production.HAS_EMPTY = HAS_EMPTY;

    return HAS_EMPTY;
}
/**
 * Retrieve the numerical production id from either a ProductionTokenSymbol or a ProductionSymbol
 * @param symbol
 * @param grammar
 */
export function getProductionID(symbol: ProductionTokenSymbol | ProductionSymbol, grammar: Grammar): number {
    return symbol.val;
}
