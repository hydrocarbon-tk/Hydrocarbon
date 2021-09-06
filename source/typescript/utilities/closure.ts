/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { GrammarObject } from "../types/grammar_nodes.js";
import { getGotoItems, Item, itemsToProductionIDs } from "./item.js";

/**
 * Get set of all items that can be derived from the parameter items.
 * If the symbol of a parameter item is a Production, the initial items
 * of the production are added to the closure, and the process repeats
 * until no new items are added. 
 * 
 * If ENTER_TOKEN_PRODUCTIONS is `true`, then the closure of the production
 * referenced by the production token will be included. The item containing
 * the production token will not be included. 
 * 
 * @param items 
 * @param grammar 
 * @param ENTER_TOKEN_PRODUCTIONS 
 */
export function getClosure(
    items: Item[],
    grammar: GrammarObject,
    depth: number = 0
): Item[] {

    let closure = [];

    for (const item of items) {

        const item_id = item.id;

        closure.push(
            ...(
                grammar.item_map.get(item_id).closure
            )
        );
    }

    closure = closure.setFilter();

    return items.concat(closure.map(i => {
        const item = grammar.item_map.get(i).item;
        return new Item(
            item.body,
            item.len,
            item.offset,
            depth
        );
    })).setFilter();
}

/**
 * Get a closure that includes items that transition from productions of completed items
 * @param closure 
 * @param goto_transition_items 
 * @param grammar 
 * @param productions 
 */
export function getFollowClosure(
    closure: Item[],
    goto_transition_items: Item[],
    grammar: GrammarObject,
    productions: Set<number> = new Set,
    internal$item_track: Set<string> = new Set,
    KEEP_END_ITEMS = false
) {
    closure = closure.setFilter(i => i.id);

    const new_closure = closure.slice();
    const prods = itemsToProductionIDs(closure.filter(i => i.atEND),
        grammar);

    for (let prod of prods) {

        if (productions.has(prod))
            continue;

        productions.add(prod);

        const items = getGotoItems(grammar, [prod], goto_transition_items).map(i => i.increment());

        const c = getClosure(items, grammar, false);

        new_closure.push(...getFollowClosure(c, goto_transition_items, grammar, productions, internal$item_track, KEEP_END_ITEMS));
    }

    if (KEEP_END_ITEMS)
        return new_closure.setFilter(i => i.id);
    return new_closure.setFilter(i => i.id);
}