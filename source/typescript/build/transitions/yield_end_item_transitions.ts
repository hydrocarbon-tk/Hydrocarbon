/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { default_EOP } from "../../grammar/nodes/default_symbols.js";
import { getFollowSymbolsFromItems, getSymbolsFromClosure, getUniqueSymbolName, Sym_Is_A_Production, Sym_Is_EOF } from "../../grammar/nodes/symbol.js";
import { HCG3Grammar } from "../../types/grammar_nodes";
import { RenderBodyOptions } from "../../types/render_body_options";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { getClosure, getFollowClosure } from "../../utilities/closure.js";
import { const_EMPTY_ARRAY } from "../../utilities/const_EMPTY_ARRAY.js";
import { getFollow } from "../../utilities/follow.js";
import { getGotoItems, Item, itemsToProductionIDs } from "../../utilities/item.js";
import { processProductionChain } from "../../utilities/process_production_reduction_sequences.js";
import { getTransitionTree } from "../../utilities/transition_tree.js";
import { createTransitionNode } from "./create_transition_node.js";
import { buildPeekTransitions } from "./yield_peek_transitions.js";
import { yieldTransitions } from "./yield_transitions.js";
export function yieldEndItemTransitions(end_items: Item[], options: RenderBodyOptions, offset: number): TransitionNode[] {

    if (end_items.length == 0) return [];


    const

        output_nodes: TransitionNode[] = [],

        { grammar, goto_items, production_ids, productions } = options;


    let
        default_end_items: Item[] = [];

    if (goto_items.length > 0 && end_items.length > 1) {

        const
            original_prods = itemsToProductionIDs(end_items, grammar),
            prods = end_items.map(i => processProductionChain([], options, itemsToProductionIDs([i], grammar))[0]),
            active_items = getGotoItems(grammar, prods, goto_items).map(i => i.increment());

        if (active_items.length == 1) {

            const
                prod = active_items[0].decrement().getProductionAtSymbol(grammar).id,
                item_index = prods.indexOf(prod),
                item = end_items[item_index],
                symbols = getSymbolsFromClosure(getClosure(active_items, grammar), grammar);

            output_nodes.push(createTransitionNode([item], symbols, TRANSITION_TYPE.ASSERT_END, offset));

            end_items.splice(item_index, 1);

            default_end_items = end_items;

        } else {

            let { tree_nodes } = getTransitionTree(
                grammar,
                end_items,
                goto_items,
                {
                    expanded_limit: 5,
                    max_tree_depth: 10,
                    max_no_progress: 8,
                    max_time_limit: 200,
                },
                0,
                goto_items.filter(i => original_prods.includes(+(i.sym(grammar).val))).map(i => {

                    let
                        item = i.increment(),
                        shift_closure = getFollowClosure(getClosure([item], grammar), goto_items, grammar).filter(i => !i.atEND),
                        closure = [item];

                    const
                        index = original_prods.indexOf(i.getProductionAtSymbol(grammar).id),
                        c = closure.slice();

                    c.unshift(end_items[index]);

                    return { final: 0, sym: null, index, closure: closure, production_shift_items: goto_items /* shift_closure.filter(i => Sym_Is_A_Production(i.sym(grammar)) )*/ };
                }));

            let used_items = new Set;

            if (tree_nodes.length > 0) {
                output_nodes.push(...buildPeekTransitions(
                    tree_nodes,
                    options,
                    offset,
                    (state, options, offset, peek_depth) => {

                        const { items, closure, symbols } = state;

                        if (items.length > 1) {
                            state.transition_type = TRANSITION_TYPE.PEEK_UNRESOLVED;
                            for (const item of items) {


                                const unresolved_leaf_node = createTransitionNode([item], symbols, TRANSITION_TYPE.ASSERT_END, offset, state.peek_level, true);

                                unresolved_leaf_node.nodes.push(...yieldTransitions([item], options, offset, const_EMPTY_ARRAY, false));

                                state.nodes.push(unresolved_leaf_node);

                            }
                        } else {

                            state.transition_type = TRANSITION_TYPE.ASSERT_END;
                        }

                        for (const item of items)
                            used_items.add(item.id);
                    },
                    const_EMPTY_ARRAY,
                    -1));
            }

            default_end_items = end_items.filter(i => !used_items.has(i.id));
        }
    } else {
        default_end_items = end_items;
    }

    default_end_items = default_end_items.setFilter(i => i.id);

    for (const item of default_end_items) {

        const symbols = getFollow(item.getProduction(grammar).id, grammar);

        if (symbols.length == 0) symbols.push(default_EOP);

        output_nodes.push(createTransitionNode([item], symbols, TRANSITION_TYPE.ASSERT_END, offset + 1, 0, false, 66));
    }


    return output_nodes;
}

function DoesItemReduceTo(production_id: number, item: Item, grammar: HCG3Grammar, goto_items: Item[], visited = new Set): boolean {
    if (item.atEND) {

        const id = item.getProduction(grammar).id;
        if (id == production_id)
            return true;

        if (!visited.has(id)) {

            visited.add(id);


            for (let i of goto_items.filter(i => i.getProductionAtSymbol(grammar).id == id)) {

                if (DoesItemReduceTo(production_id, i.increment(), grammar, goto_items, visited))
                    return true;
            }
        }
    }

    return false;
}