
import { RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options";

import { Item } from "../../utilities/item.js";
import { Sym_Is_A_Production } from "../../utilities/symbol.js";
import { yieldStates } from "./yield_states.js";
import { processRecognizerStates } from "./process_recognizer_states.js";
import { createRecognizerState } from "./create_recognizer_state.js";
import { getProductionID } from "../../utilities/production.js";

export function yieldGotoStates(options: RenderBodyOptions, completed_productions: number[]): RecognizerState[] {

    const { grammar, goto_items, production_ids, extended_goto_items } = options;

    let nonterm_shift_items: Item[] = goto_items;

    const
        PRODUCTION_IS_LEFT_RECURSIVE =
            nonterm_shift_items.some(
                i => {
                    let item_id = i.getProduction(grammar).id;
                    let sym_id = i.getProductionAtSymbol(grammar).id;
                    return production_ids.some(p => p == sym_id && p == item_id);
                }
            ),
        PRODUCTION_IS_NOT_LEFT_RECURSIVE = !PRODUCTION_IS_LEFT_RECURSIVE;

    /** 
     * If left recursive, gather ALL items that transition on the production to ensure the 
     * compiler is aware of shift/reduce ambiguities. Completed items that are added
     * from the GOTO check should not be used for actual parsing, and their code paths 
     * should be discarded.
     */

    if (PRODUCTION_IS_LEFT_RECURSIVE) {


        for (const { item } of grammar.item_map.values()) {
            if (
                !item.atEND
                && Sym_Is_A_Production(item.sym(grammar))
                && production_ids.includes(item.getProductionAtSymbol(grammar).id)
                && !production_ids.includes(getProductionID(item, grammar))
                && !nonterm_shift_items.some(i => i.id == item.id)
            )
                extended_goto_items.push(item);
        }

        nonterm_shift_items = nonterm_shift_items.concat(extended_goto_items).setFilter(i => i.id);
    }

    if (
        PRODUCTION_IS_NOT_LEFT_RECURSIVE

        //There is no left recursion for this production and the only completed production from 
        // the RD section is the production itself.

        && completed_productions.setFilter().length == 1
        && production_ids.includes(completed_productions.setFilter()[0])
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

                    { code, hash, leaves, prods } = processRecognizerStates(options, states),

                    state = createRecognizerState(
                        items_to_process.filter(i => i.offset == 1),
                        [<any>production_id],
                        TRANSITION_TYPE.ASSERT,
                        0
                    );

                state.code = code;
                state.hash = hash;
                state.prods = prods;
                state.leaves = leaves;
                state.states = states;

                output_states.push(state);

                pending_productions.push(...prods.setFilter());

            } else if (!production_ids.includes(production_id)) {
                throw new Error("Missing goto group for " + grammar[production_id].name);
            }
        }

        return output_states;
    }

    options.NO_GOTOS = true;

    return [];
}
