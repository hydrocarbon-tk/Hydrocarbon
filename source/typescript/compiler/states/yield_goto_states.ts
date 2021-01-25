
import { RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options";

import { Item } from "../../utilities/item.js";
import { symIsAProduction } from "../../utilities/symbol.js";
import { yieldStates } from "./yield_states.js";
import { TokenSymbol } from "../../types/symbol.js";
import { processRecognizerStates } from "./process_recognizer_states.js";

export function yieldGotoStates(options: RenderBodyOptions, completed_productions: number[]): RecognizerState[] {

    const { grammar, goto_items: production_shift_items, production, extended_goto_items: extended_production_shift_items } = options;

    let nonterm_shift_items: Item[] = production_shift_items;

    const
        PRODUCTION_IS_LEFT_RECURSIVE =
            nonterm_shift_items.some(
                i =>
                    i.getProduction(grammar).id == production.id
                    && i.getProductionAtSymbol(grammar).id == production.id
            ),
        PRODUCTION_IS_NOT_LEFT_RECURSIVE = !PRODUCTION_IS_LEFT_RECURSIVE;

    /** 
     * If left recursive, gather ALL items that transition on the production to ensure the 
     * processor is aware of shift/reduce ambiguities. Completed items that are added
     * from the GOTO check should not be used for actual parsing, and instead their code paths 
     * should be discarded.
     */

    if (PRODUCTION_IS_LEFT_RECURSIVE) {
        //gather all items that transition on the production
        const prod_id = production.id;

        for (const { item } of grammar.item_map.values()) {
            if (
                !item.atEND
                && symIsAProduction(item.sym(grammar))
                && item.getProductionAtSymbol(grammar).id == prod_id
                && item.getProduction(grammar).id != prod_id
                && !nonterm_shift_items.some(i => i.id == item.id)
            )
                extended_production_shift_items.push(item);
        }

        nonterm_shift_items = nonterm_shift_items.concat(extended_production_shift_items).setFilter(i => i.id);
    }

    if (
        PRODUCTION_IS_NOT_LEFT_RECURSIVE

        //There is no left recursion for this production and the only completed production from 
        // the RD section is the production itself.

        && completed_productions.setFilter().length == 1
        && completed_productions.setFilter()[0] == production.id
    ) {
        /* pass through */
    } else if (nonterm_shift_items.length > 0) {

        const output_states = [];

        // Select all states that transition on item 
        // Record all states gathered from id.
        // Process those states
        // Get all completed productions
        // Repeat
        const active_productions: Set<number> = new Set;
        const pending_productions: number[] = completed_productions.setFilter();
        const goto_groups = nonterm_shift_items.groupMap(i => i.getProductionAtSymbol(grammar).id);

        for (let i = 0; i < pending_productions.length; i++) {

            const production_id = pending_productions[i];

            if (active_productions.has(production_id))
                continue;

            active_productions.add(production_id);

            if (goto_groups.has(production_id)) {

                const
                    items_to_process = goto_groups.get(production_id).map(i => i.increment()),
                    states = yieldStates(items_to_process, options, 1),
                    { code, hash, leaves, prods } = processRecognizerStates(options, states);

                pending_productions.push(...prods.setFilter());

                output_states.push(<RecognizerState>{
                    code,
                    hash,
                    transition_type: TRANSITION_TYPE.ASSERT,
                    symbols: [<TokenSymbol><any>production_id],
                    items: items_to_process.filter(i => i.offset == 1),
                    completing: false,
                    offset: 0,
                    peek_level: -1,
                    prods,
                    leaves,
                    states: states
                });


            } else if (production_id !== production.id) {
                throw new Error("Missing goto group for " + grammar[production_id].name);
            }
        }

        return output_states;
    }

    options.NO_GOTOS = true;

    return [];
}
