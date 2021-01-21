import { EOF_SYM, Grammar } from "../types/grammar.js";
import { TokenSymbol } from "../types/symbol";
import { Item } from "./item.js";


export function getFollow(production_id: number, grammar: Grammar): TokenSymbol[] {
    const prod = grammar[production_id];


    return prod.bodies
        .map(b => new Item(b.id, b.length, b.length, EOF_SYM))
        .flatMap(i => [...grammar.item_map.get(i.id).follow.values()])
        .setFilter()
        .map(sym => <TokenSymbol>grammar.meta.all_symbols.get(sym));
}
