import { getStartItemsFromProduction } from "../compiler/function_constructor.js";
import { EOF_SYM, Grammar } from "../types/grammar.js";
import { Production, TrivialProduction } from "../types/production.js";
import { ProductionSymbol, ProductionTokenSymbol } from "../types/symbol";
import { SymbolType } from "../types/symbol_type";
import { getClosure } from "./closure.js";
import { Item } from "./item.js";
import { Sym_Is_A_Production } from "./symbol.js";


export function getProductionClosure(production_id: number, grammar: Grammar, ENTER_TOKEN_PRODUCTIONS: boolean = false) {
    const prod = grammar[production_id];
    return getClosure(getStartItemsFromProduction(prod), grammar, ENTER_TOKEN_PRODUCTIONS);
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
 * @param object
 * @param grammar
 */
export function getProductionID(object: ProductionTokenSymbol | ProductionSymbol | Item, grammar: Grammar): number {
    if (object instanceof Item)
        return object.getProduction(grammar).id;
    else
        return object.val;
}

export function Production_Is_Trivial(production: Production): production is TrivialProduction {

    if (production.bodies.every(b => b.sym.length == 1 && !Sym_Is_A_Production(b.sym[0]) && b.functions.length == 0 && !b.reduce_function)) {
        (<TrivialProduction>production).IS_TRIVIAL == true;
        return true;
    }

    return false;

}