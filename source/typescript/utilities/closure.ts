import { getAccompanyingItems, Item, itemsToProductions } from "./item.js";
import { Grammar } from "../types/grammar.js";

export function getClosure(items: Item[], grammar: Grammar): Item[] {
    let closure = [];

    for (const item of items) {
        closure.push(...grammar.item_map.get(item.id).closure);
    }

    if (items.length > 1)
        closure = closure.setFilter(i => i);

    return closure.map(i => grammar.item_map.get(i).item);
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