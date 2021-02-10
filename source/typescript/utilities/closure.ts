import { getGotoItems, Item, itemsToProductions } from "./item.js";
import { Grammar } from "../types/grammar.js";
import { getSymbolsFromClosure, Sym_Is_A_Production_Token } from "./symbol.js";
import { getProductionClosure, getProductionID } from "./production.js";
import { getStartItemsFromProduction } from "../compiler/function_constructor.js";

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
 */
export function getClosure(items: Item[], grammar: Grammar, internal$item_track: Set<string> = new Set): Item[] {

    let closure = [];

    for (const item of items) {

        const item_id = item.id;

        closure.push(...grammar.item_map.get(item_id).closure);
    }
    
    closure = closure.setFilter(i => i);

    return closure.map(i => grammar.item_map.get(i).item);
}

/**
 * Get a closure that includes items that transition from completed item productions
 * @param closure 
 * @param goto_transition_items 
 * @param grammar 
 * @param productions 
 */
export function getFollowClosure(closure: Item[], goto_transition_items: Item[], grammar: Grammar, productions: Set<number> = new Set) {

    const new_closure = closure.slice();


    const prods = itemsToProductions(closure.filter(i => i.atEND), grammar);

    for (let prod of prods) {

        if (productions.has(prod))
            continue;

        productions.add(prod);

        const items = getGotoItems(grammar, [prod], goto_transition_items).map(i => i.increment());

        const c = getClosure(items, grammar);

        new_closure.push(...getFollowClosure(c, goto_transition_items, grammar, productions));
    }

    return new_closure.setFilter(i => i.id).filter(i => !i.atEND);
}