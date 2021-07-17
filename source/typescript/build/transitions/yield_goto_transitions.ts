/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { RenderBodyOptions } from "../../types/render_body_options";

import { Item } from "../../utilities/item.js";
import { Sym_Is_A_Production } from "../../grammar/nodes/symbol.js";
import { yieldTransitions } from "./yield_transitions.js";
import { processTransitionNodes } from "./process_transition_nodes.js";
import { createTransitionNode } from "./create_transition_node.js";
import { getProductionID } from "../../utilities/production.js";

export function yieldGOTOTransitions(options: RenderBodyOptions, completed_productions: number[]): TransitionNode[] {

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
            ) {

                extended_goto_items.push(item);
            }
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

        const output_nodes = [];

        // Select all nodes that transition on item 
        // Record all nodes gathered from id.
        // Process those nodes
        // Get all completed productions
        // Repeat
        const active_productions: Set<number> = new Set;
        const pending_productions: number[] = completed_productions.setFilter();
        const goto_groups = nonterm_shift_items.setFilter(i=>i.id).groupMap(i => i.getProductionAtSymbol(grammar).id);

        for (let i = 0; i < pending_productions.length; i++) {

            const production_id = pending_productions[i];

            if (active_productions.has(production_id))
                continue;

            active_productions.add(production_id);

            if (goto_groups.has(production_id)) {


                const

                    items_to_process = goto_groups.get(production_id).map(i => i.increment()).setFilter(i => i.id);
                const

                    nodes = yieldTransitions(items_to_process, options, 1),

                    { code, hash, leaves, prods } = processTransitionNodes(options, nodes),

                    node = createTransitionNode(
                        items_to_process.filter(i => i.offset == 1),
                        [<any>production_id],
                        TRANSITION_TYPE.ASSERT,
                        0
                    );

                node.code = code;
                node.hash = hash;
                node.prods = prods;
                node.leaves = leaves;
                node.nodes = nodes;
                node.PROCESSED = true;

                output_nodes.push(node);

                pending_productions.push(...prods.setFilter());

            } else if (!production_ids.includes(production_id)) {
                throw new Error("Missing goto group for " + grammar.productions[production_id].name);
            }
        }

        return output_nodes;
    }

    options.NO_GOTOS = true;

    return [];
}
