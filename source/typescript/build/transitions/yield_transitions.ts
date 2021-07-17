/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { getTokenSymbolsFromItems, Symbols_Are_The_Same, Sym_Is_A_Production } from "../../grammar/nodes/symbol.js";
import { EOF_SYM, Grammar } from "../../types/grammar.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { Symbol } from "../../types/symbol.js";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { TransitionTreeNode } from "../../types/transition_tree_nodes.js";
import { getClosure } from "../../utilities/closure.js";
import { const_EMPTY_ARRAY } from "../../utilities/const_EMPTY_ARRAY.js";
import { Item, Items_Have_The_Same_Active_Symbol } from "../../utilities/item.js";
import { getTransitionTree } from "../../utilities/transition_tree.js";
import { createTransitionNode } from "./create_transition_node.js";
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

    filter_symbols: Symbol[] = const_EMPTY_ARRAY,

    FROM_PEEKED_TRANSITION: boolean = false

): TransitionNode[] {

    const
        { grammar, production_ids } = options,
        output_nodes: TransitionNode[] = [],
        active_items = in_items.filter(item => {
            const sym = item.sym(grammar) || EOF_SYM;

            return Sym_Is_A_Production(sym)
                || item.atEND
                || filter_symbols.length == 0
                || filter_symbols.some(f => Symbols_Are_The_Same(f, sym));
        });


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
        } else if (THERE_IS_ONLY_ONE_ACTIVE_ITEM && NO_END_ITEMS_PRESENT)

            output_nodes.push(...yieldSingleItemNode(active_items, options, offset));

        else if (ALL_ITEMS_ARE_FROM_SAME_PRODUCTION
            && !ALL_ITEMS_ARE_FROM_ROOT_PRODUCTION
            && NO_END_ITEMS_PRESENT
            && ITEMS_HAVE_A_MAX_OFFSET_OF_ZERO
        )

            output_nodes.push(...yieldProductionCallNode(active_items, offset));

        else if (ALL_ITEMS_HAVE_SAME_SYMBOL && ITEMS_SHOULD_CREATE_SHIFT_NODES && NO_END_ITEMS_PRESENT)

            output_nodes.push(...yieldNodesOfItemsWithSameSymbol(active_items, options, offset, FROM_PEEKED_TRANSITION));

        else

            output_nodes.push(...yieldPeekedNodes(active_items, options, offset, filter_symbols));

    }

    return output_nodes;
}


export function getMaxOffsetOfItems(active_items: Item[]) {
    return active_items.reduce((r, i) => Math.max(i.offset, r), 0);
}

export function Items_Are_From_Same_Production(active_items: Item[], grammar: Grammar) {
    return active_items.setFilter(i => i.getProduction(grammar).id).length == 1;
}

function yieldPeekedNodes(active_items: Item[], options: RenderBodyOptions, offset: number, filter_symbols: Symbol[] = const_EMPTY_ARRAY): TransitionNode[] {

    const
        { grammar, goto_items: production_shift_items } = options,
        { tree_nodes } = getTransitionTree(
            grammar,
            active_items,
            options.global_production_items/*production_shift_items*/,
            10,
            10,
            200
        );

    return buildPeekTransitions(tree_nodes[0].next, options, offset, undefined, filter_symbols, 0);
}

function yieldNodesOfItemsWithSameSymbol(active_items: Item[], options: RenderBodyOptions, offset: number, FROM_PEEKED_TRANSITION: boolean): TransitionNode[] {

    let leaf_node: TransitionNode = null, root = null;

    const { grammar } = options, output_nodes = [];

    while (active_items.every(i => !i.atEND && i.sym(grammar).val == active_items[0].sym(grammar).val)) {

        const
            sym = active_items[0].sym(grammar),
            node = createTransitionNode(
                active_items.slice(),
                [sym],
                Sym_Is_A_Production(sym)
                    ? TRANSITION_TYPE.ASSERT_PRODUCTION_CALL
                    : (FROM_PEEKED_TRANSITION)
                        ? TRANSITION_TYPE.POST_PEEK_CONSUME
                        : TRANSITION_TYPE.ASSERT_CONSUME,
                offset++
            );

        if (leaf_node) {
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

    const nodes = yieldTransitions(active_items, options, offset);

    if (nodes.length == 0) {
        throw new Error(
            `Unexpected end of nodes\n${root.items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")}`);
    }

    leaf_node.nodes.push(...nodes);

    return output_nodes;
}

function yieldProductionCallNode(active_items: Item[], offset: number): TransitionNode[] {

    const

        first = active_items[0],

        items = [new Item(first.body, first.len, 0)];

    return [createTransitionNode(items, [EOF_SYM], TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS, offset)];
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


