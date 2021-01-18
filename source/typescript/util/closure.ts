import { getAccompanyingItems, Item, itemsToProductions } from "./item.js";

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

/**
 * Get a closure that includes items that transition from completed item productions
 * @param closure 
 * @param lr_transition_items 
 * @param grammar 
 * @param productions 
 */
export function getFollowClosure(closure: Item[], lr_transition_items: Item[], grammar: Grammar, productions: Set<number> = new Set) {
    const new_closure = closure.slice();
    if (closure.some(i => i.atEND)) {
        const prods = itemsToProductions(closure.filter(i => i.atEND), grammar);
        for (let prod of prods) {
            if (productions.has(prod))
                continue;
            productions.add(prod);
            const items = getAccompanyingItems(grammar, [prod], lr_transition_items).map(i => i.increment());
            const c = getClosure(items, grammar);
            new_closure.push(...getFollowClosure(c, lr_transition_items, grammar, productions));

        }
    }
    return new_closure.setFilter(i => i.id).filter(i => !i.atEND);
}