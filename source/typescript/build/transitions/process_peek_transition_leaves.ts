/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { HCG3Grammar } from "source/typescript/types/grammar_nodes.js";
import { getFollowSymbolsFromItems, getUniqueSymbolName, Sym_Is_A_Production } from "../../grammar/nodes/symbol.js";
import { RenderBodyOptions } from "../../types/render_body_options.js";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { getClosure } from "../../utilities/closure.js";
import { Item, Items_Have_The_Same_Active_Symbol } from "../../utilities/item.js";
import { getProductionID } from "../../utilities/production.js";
import { getTransitionTree } from "../../utilities/transition_tree.js";
import { createTransitionNode } from "./create_transition_node.js";
import { yieldEndItemTransitions } from "./yield_end_item_transitions.js";
import { buildPeekTransitions } from "./yield_peek_transitions.js";
import {
    Every_Leaf_Of_TransitionTree_Contain_One_Root_Item, getMaxOffsetOfItems, Items_Are_From_Same_Production,
    yieldTransitions
} from "./yield_transitions.js";

//*
export function processPeekTransitionLeaves(
    node: TransitionNode,
    options: RenderBodyOptions,
    root_depth: number = 0,
    leaf_depth: number = 0
): void {

    const { grammar } = options;

    if (node.items.length > 0) {

        if (Items_From_Same_Production_Allow_Production_Call(node, options, root_depth))

            throw new Error("This case should have been handled in yieldNodes");

        if (node.items.length > 1) {

            if (node.items.some(i => i.atEND))

                addUnresolvedNode(node, options, root_depth);

            else if (We_Can_Call_Single_Production_From_Items(node, options))

                convertStateToProductionCall(node, root_depth);

            else if (Items_Have_The_Same_Active_Symbol(node.items, grammar))

                addSameActiveSymbolNode(node, options, root_depth);

            else if (No_Matching_Extended_Goto_Item_In_State_Closure(node, options)) {

                if (State_Closure_Allows_Production_Call(node, options)) {

                    convertStateToClosureProductionCall(node, root_depth);

                } else if (leaf_depth <= 0 && root_depth == 0) {

                    addRegularYieldNode(node, getClosure(node.closure, grammar), options, root_depth + 1);

                } else {

                    addUnresolvedNode(node, options, root_depth);
                }

            } else

                if (
                    Every_Leaf_Of_TransitionTree_Contain_One_Root_Item(
                        getTransitionTree(grammar, node.items, options.goto_items, {
                            expanded_limit: 0,
                            max_tree_depth: 0,
                            max_no_progress: 10,
                            max_time_limit: 8,
                        }).tree_nodes[0]
                    )
                )

                    addRegularYieldNode(node, node.items, options, root_depth);

                else

                    addUnresolvedNode(node, options, root_depth);

        } else {

            convertPeekStateToSingleItemNode(node, options, root_depth);
        }

    }
}

function addSameActiveSymbolNode(node: TransitionNode, options: RenderBodyOptions, offset: number) {

    if (Active_Symbol_Of_First_Item_Is_A_Production(node, options.grammar))
        node.transition_type = TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS;

    addRegularYieldNode(node, node.items, options, offset + 1);
}
function convertPeekStateToSingleItemNode(node: TransitionNode, { grammar }: RenderBodyOptions, offset: number) {

    const { items } = node;

    const sym = items[0].sym(grammar);

    if (node.peek_level == 0) {
        if (Sym_Is_A_Production(sym)) {

            node.transition_type = TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS;

        } else if (items[0].atEND) {
            node.symbols = node.symbols.concat(
                getFollowSymbolsFromItems(items, grammar)
            ).setFilter(getUniqueSymbolName);
            node.transition_type = TRANSITION_TYPE.ASSERT_END;
        } else {

            node.transition_type = TRANSITION_TYPE.ASSERT_CONSUME;

            node.peek_level = -1;
        }
    } else if (getMaxOffsetOfItems(items) == 0) {
        node.transition_type = TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS;
    } if (Sym_Is_A_Production(sym)) {
        node.transition_type = TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS;
    } else if (items[0].atEND) {
        node.symbols = node.symbols.concat(
            getFollowSymbolsFromItems(items, grammar)
        ).setFilter(getUniqueSymbolName);
        node.transition_type = TRANSITION_TYPE.ASSERT_END;
    } else if (node.peek_level > 0) {
        node.transition_type = TRANSITION_TYPE.ASSERT_PEEK;
    } else {
        node.transition_type = TRANSITION_TYPE.ASSERT;
    }


    node.offset = offset;
}

function convertStateToClosureProductionCall(node: TransitionNode, offset: number) {

    node.items = node.closure.slice(0, 1);

    node.offset = offset;

    node.transition_type = TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS;
}

function convertStateToProductionCall(node: TransitionNode, offset: number) {

    node.items = [node.items[0]];

    node.offset = offset;

    node.transition_type = TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS;
}


function addRegularYieldNode(node: TransitionNode, items: Item[], options: RenderBodyOptions, offset: number) {

    const nodes = yieldTransitions(items, options, offset + 1, true);

    node.nodes.push(...nodes);

}

function addUnresolvedNode(node: TransitionNode, options: RenderBodyOptions, offset: number) {

    const items = node.items.setFilter(i => i.id);

    if (items.every(i => i.atEND)) {

        node.transition_type = TRANSITION_TYPE.ASSERT_END;

        node.nodes.push(...yieldEndItemTransitions(items, options, offset));

    } else {

        //filter out shift/reduce conflicts
        let filtered_items = items.filter(i => !i.atEND);

        if (filtered_items.length == 1) {

            node.items = filtered_items;

            node.nodes.length = 0;

            convertPeekStateToSingleItemNode(node, options, offset);

            node.transition_type = TRANSITION_TYPE.ASSERT_PEEK_VP;
        } else {
            console.log(items.map(i => i.renderUnformattedWithProduction(options.grammar)));

            for (const items_with_same_symbol of filtered_items.group(i => getUniqueSymbolName(i.sym(options.grammar)))) {

                const unresolved_leaf_node = createTransitionNode(items_with_same_symbol, node.symbols, TRANSITION_TYPE.ASSERT, offset, node.peek_level, true);

                unresolved_leaf_node.nodes.push(...yieldTransitions(items_with_same_symbol, options, offset, false));

                node.nodes.push(unresolved_leaf_node);
            }

            node.transition_type = TRANSITION_TYPE.PEEK_UNRESOLVED;
        }

    }

}



function Active_Symbol_Of_First_Item_Is_A_Production(node: TransitionNode, grammar: HCG3Grammar) {
    return Sym_Is_A_Production(node.items[0].sym(grammar));
}

function We_Can_Call_Single_Production_From_Items({ items }: TransitionNode, { grammar, production_ids }: RenderBodyOptions) {

    return getMaxOffsetOfItems(items) == 0
        && Items_Are_From_Same_Production(items, grammar)
        && items.every(i => !i.atEND)

        && !production_ids.includes(getProductionID(items[0], grammar));
}

function State_Closure_Allows_Production_Call({ closure }: TransitionNode, { grammar }: RenderBodyOptions) {
    return getMaxOffsetOfItems(closure) == 0 && Items_Are_From_Same_Production(closure, grammar);
}

function No_Matching_Extended_Goto_Item_In_State_Closure(node: TransitionNode, options: RenderBodyOptions) {

    const { extended_goto_items } = options;

    return getMaxOffsetOfItems(node.items) == 0
        &&
        node.items.every(i => !extended_goto_items.has(i.body))
        &&
        !node.items.some(i => i.atEND);
}

function Items_From_Same_Production_Allow_Production_Call(node: TransitionNode, options: RenderBodyOptions, offset: number) {
    const
        { production_ids, grammar } = options,
        ITEMS_ARE_FROM_SAME_PRODUCTION = Items_Are_From_Same_Production(node.items, grammar),
        [first] = node.items,
        prod = first.getProduction(grammar);

    return offset == 0 && ITEMS_ARE_FROM_SAME_PRODUCTION && !production_ids.includes(prod.id);
}

export function yieldPeekedNodes(
    active_items: Item[],
    options: RenderBodyOptions,
    offset: number,
    leaf_handler = processPeekTransitionLeaves,
    peek_depth: number = 0,
): TransitionNode[] {

    const
        { grammar, goto_items } = options,
        { tree_nodes } = getTransitionTree(
            grammar,
            active_items,
            goto_items,
            {
                expanded_limit: 10,
                max_tree_depth: 10,
                max_no_progress: 3,
                max_time_limit: 300,
            }
        );


    const nodes = buildPeekTransitions(
        tree_nodes[0].next,
        options,
        offset,
        leaf_handler,
        peek_depth
    );


    return nodes;
}