/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { SKExpression } from "../skribble/types/node";
import { RenderBodyOptions } from "../types/render_body_options";

import { getGotoItems, Item, itemsToProductionIDs } from "./item.js";
import { renderItemReduction } from "./render_item.js";

export function processProductionChain(
    expression_block: SKExpression[],
    options: RenderBodyOptions,
    /**
     * List of production id numbers that have been generated from
     * the proceeding code sequence.
     */
    active_productions: number[]
): number[] {
    let active_items: Item[] = [], { grammar, goto_items } = options;

    let prod = active_productions || []/*, visited_prods: Set<string> = new Set*/;

    const items = (goto_items);

    active_items = getGotoItems(grammar, active_productions, items);

    if (active_items.length == 0)
        return prod;

    if (active_items.length == 1 && active_items.every(i => i.len == 1)) {

        prod.length = 1;
        while (active_items.length == 1 && active_items.every(i => i.len == 1)) {
            prod[0] = active_items[0].getProduction(grammar).id;
            renderItemReduction(expression_block, active_items[0], options, false);
            active_items = getGotoItems(grammar, itemsToProductionIDs(active_items, grammar), goto_items);
        }
    }
    /*
    if (active_items.length > 0) {
        while (active_items.length > 0) {
            const new_items = active_items.filter(i => !visited_prods.has(i.id));
            new_items.forEach(i => visited_prods.add(i.id));
            active_items = getGotoItems(grammar, itemsToProductions(new_items, grammar), goto_items);
        }
    }
    */
    return prod;
}
