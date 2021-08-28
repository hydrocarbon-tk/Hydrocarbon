/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { default_EOF } from "../../grammar/nodes/default_symbols.js";
import { getTokenSymbolsFromItems, Symbols_Are_The_Same, Sym_Is_A_Production } from "../../grammar/nodes/symbol.js";
import { HCG3Grammar, HCG3Symbol } from "../../types/grammar_nodes.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { TransitionTreeNode } from "../../types/transition_tree_nodes.js";
import { getClosure } from "../../utilities/closure.js";
import { const_EMPTY_ARRAY } from "../../utilities/const_EMPTY_ARRAY.js";
import { Item, Items_Have_The_Same_Active_Symbol } from "../../utilities/item.js";
import { getTransitionTree } from "../../utilities/transition_tree.js";
import { createTransitionNode } from "./create_transition_node.js";
import { processPeekTransitionLeaves, yieldPeekedNodes } from "./process_peek_transition_leaves.js";
import { yieldEndItemTransitions } from "./yield_end_item_transitions.js";
import { buildPeekTransitions } from "./yield_peek_transitions.js";

export function Every_Leaf_Of_TransitionTree_Contain_One_Root_Item(node: TransitionTreeNode) {

    if (node.next.length > 0)
        return node.next.every(Every_Leaf_Of_TransitionTree_Contain_One_Root_Item);

    return node.roots.length == 1;
}


export function yieldTransitions(

    in_items: Item[],

    options: RenderBodyOptions,

    offset: number = 0,

    filter_symbols: HCG3Symbol[] = const_EMPTY_ARRAY,

    FROM_PEEKED_TRANSITION: boolean = false

): TransitionNode[] {

    const
        { grammar, production_ids } = options,
        output_nodes: TransitionNode[] = [],
        active_items = in_items;

    /**
    * If all items are from the same production and the current production function is NOT processing
    * that production, simply do a call to that production function.
    *
    * This should only occur if all items are at the initial shift node or peek was used
    * to get to this offset.
    */
    if (active_items.length > 0) {


        const

            max_item_offset = getMaxOffsetOfItems(active_items),

            first_production = (active_items[0]).getProduction(grammar),

            NO_END_ITEMS_PRESENT = !active_items.some(i => i.atEND),

            THERE_IS_ONLY_ONE_ACTIVE_ITEM = active_items.length == 1,

            ITEMS_HAVE_A_MAX_OFFSET_OF_ZERO = max_item_offset == 0,

            ALL_ITEMS_ARE_FROM_SAME_PRODUCTION = Items_Are_From_Same_Production(active_items, grammar),

            ALL_ITEMS_HAVE_SAME_SYMBOL = Items_Have_The_Same_Active_Symbol(active_items, grammar),

            ALL_ITEMS_ARE_FROM_ROOT_PRODUCTION = ALL_ITEMS_ARE_FROM_SAME_PRODUCTION && production_ids.includes(first_production.id),

            ALL_ITEMS_ARE_END_ITEMS = active_items.every(i => i.atEND),

            ITEMS_SHOULD_CREATE_SHIFT_NODES = (offset > 0 || ALL_ITEMS_ARE_FROM_ROOT_PRODUCTION || ALL_ITEMS_ARE_FROM_SAME_PRODUCTION);

        if (ALL_ITEMS_ARE_END_ITEMS) {
            output_nodes.push(...yieldEndItemTransitions(active_items, options, offset));
        } else if (THERE_IS_ONLY_ONE_ACTIVE_ITEM && NO_END_ITEMS_PRESENT) {

            output_nodes.push(...yieldSingleItemNode(active_items, options, offset));

        } else if (ALL_ITEMS_ARE_FROM_SAME_PRODUCTION
            && !ALL_ITEMS_ARE_FROM_ROOT_PRODUCTION
            && NO_END_ITEMS_PRESENT
            //&& ITEMS_HAVE_A_MAX_OFFSET_OF_ZERO
        ) {
            output_nodes.push(...yieldProductionCallNode(active_items, offset));

        } else if (ALL_ITEMS_HAVE_SAME_SYMBOL && ITEMS_SHOULD_CREATE_SHIFT_NODES && NO_END_ITEMS_PRESENT) {

            output_nodes.push(...yieldNodesOfItemsWithSameSymbol(active_items, options, offset, FROM_PEEKED_TRANSITION));

        } else {

            output_nodes.push(...yieldPeekedNodes(active_items, options, offset));
        }

    }

    return output_nodes;
}


export function Some_Items_Are_In_Extended_Goto(active_items: Item[], options: RenderBodyOptions) {

    return active_items.some(s => options.extended_goto_items.has(s.body));
}

export function getMaxOffsetOfItems(active_items: Item[]) {
    return active_items.reduce((r, i) => Math.max(i.offset, r), 0);
}

export function Items_Are_From_Same_Production(active_items: Item[], grammar: HCG3Grammar) {
    return active_items.setFilter(i => i.getProduction(grammar).id).length == 1;
}

function yieldNodesOfItemsWithSameSymbol(active_items: Item[],
    options: RenderBodyOptions,
    offset: number,
    FROM_PEEKED_TRANSITION: boolean
): TransitionNode[] {


    const { grammar } = options, output_nodes = [];

    let leaf_node: TransitionNode = output_nodes, root = null;

    const roots = active_items.slice();
    // If there are extended items (added through the goto path initialization) we 
    // we should not consume the token if ANY of the items are from one of the extended
    // goto set. 
    const HAVE_GOTO = Some_Items_Are_In_Extended_Goto(active_items, options);

    let peek_depth = HAVE_GOTO ? 0 : -1;

    if (HAVE_GOTO && FROM_PEEKED_TRANSITION) {

        peek_depth++;
        active_items = active_items.map(i => i.increment());
    }

    while (

        Items_Have_The_Same_Active_Symbol(active_items, grammar)

    ) {
        const
            sym = active_items[0].sym(grammar),
            node = createTransitionNode(
                active_items.slice(),
                [sym],
                HAVE_GOTO
                    ? TRANSITION_TYPE.ASSERT_PEEK
                    : Sym_Is_A_Production(sym)
                        ? TRANSITION_TYPE.ASSERT_PRODUCTION_CALL
                        : (FROM_PEEKED_TRANSITION)
                            ? TRANSITION_TYPE.POST_PEEK_CONSUME
                            : TRANSITION_TYPE.ASSERT_CONSUME,
                offset++
            );

        node.peek_level = peek_depth;

        peek_depth += HAVE_GOTO ? 1 : 0;

        if (root) {
            leaf_node.nodes.push(node);
            leaf_node = node;
        } else {
            leaf_node = node;
            root = node;
            output_nodes.push(node);
        }

        active_items = active_items.map(i => i.increment());

        FROM_PEEKED_TRANSITION = false;
    }

    if (HAVE_GOTO) {

        const root_map = new Map(roots.map(i => [i.body, i]));

        const nodes = yieldPeekedNodes(active_items, options, offset, (
            node: TransitionNode,
            options: RenderBodyOptions,
            root_depth: number,
            leaf_depth: number
        ) => {
            const ignored = node.items.filter(i => Some_Items_Are_In_Extended_Goto([i], options));
            const active = node.items.filter(i => !Some_Items_Are_In_Extended_Goto([i], options));

            if (active.length < 1) {
                node.transition_type == TRANSITION_TYPE.IGNORE;
                node.leaves = [];
                node.items = [ignored[0]];
                return;
            }

            node.items = active.map(i => root_map.get(i.body));

            return processPeekTransitionLeaves(node, options, root_depth, leaf_depth - peek_depth);
        }, peek_depth);

        if (leaf_node.nodes)
            leaf_node.nodes.push(...nodes);
        else
            output_nodes.push(...nodes);
    } else {

        const nodes = yieldTransitions(active_items, options, offset);

        if (nodes.length == 0) {
            throw new Error(
                `Unexpected end of nodes\n${root.items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")}`);
        }

        leaf_node.nodes.push(...nodes);

    }

    return output_nodes;
}

function yieldProductionCallNode(active_items: Item[], offset: number): TransitionNode[] {

    const

        first = active_items[0],

        items = [new Item(first.body, first.len, 0)];

    return [createTransitionNode(items, [default_EOF], TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS, offset)];
}

function yieldSingleItemNode(items: Item[], { grammar }: RenderBodyOptions, offset: number): TransitionNode[] {


    const
        symbols = getTokenSymbolsFromItems(
            getClosure(items.slice(), grammar, true),
            grammar
        );

    if (symbols.length > 0) {

        const

            IS_SYM_PRODUCTION = Sym_Is_A_Production(items[0].sym(grammar)),

            transition_type: TRANSITION_TYPE = IS_SYM_PRODUCTION
                ? TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS
                : TRANSITION_TYPE.ASSERT_CONSUME;

        return [createTransitionNode(items, symbols, transition_type, offset)];
    }

    return [];
}


