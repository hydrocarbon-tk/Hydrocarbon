import { Item } from "./item.js";

import { EOF_SYM, Grammar } from "../types/grammar.js";
import { TokenSymbol } from "../types/symbol";


export function getClosure(items: Item[], grammar: Grammar): Item[] {
    let closure = [];

    for (const item of items) {
        closure.push(...grammar.item_map.get(item.id).closure);
    }

    if (items.length > 1)
        closure = closure.setFilter(i => i);

    return closure.map(i => grammar.item_map.get(i).item);
}

export function getFollow(production_id: number, grammar: Grammar): TokenSymbol[] {
    const prod = grammar[production_id];

    return prod.bodies
        .map(b => new Item(b.id, b.length, b.length, EOF_SYM))
        .flatMap(i => [...grammar.item_map.get(i.id).follow.values()])
        .setFilter()
        .map(sym => <TokenSymbol>grammar.meta.all_symbols.get(sym));
}