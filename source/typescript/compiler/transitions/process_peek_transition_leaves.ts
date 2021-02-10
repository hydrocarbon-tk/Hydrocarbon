import { Grammar } from "../../types/grammar.js";
import { RenderBodyOptions } from "../../types/render_body_options.js";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { getClosure } from "../../utilities/closure.js";
import { const_EMPTY_ARRAY } from "../../utilities/const_EMPTY_ARRAY.js";
import { Item, Items_Have_The_Same_Active_Symbol } from "../../utilities/item.js";
import { getProductionID } from "../../utilities/production.js";
import { Sym_Is_A_Production, Sym_Is_A_Production_Token } from "../../utilities/symbol.js";
import { getTransitionTree } from "../../utilities/transition_tree.js";
import { createTransitionNode } from "./create_transition_node.js";
import { yieldEndItemTransitions } from "./yield_end_item_transitions.js";
import {
    Every_Leaf_Of_TransitionTree_Contain_One_Root_Item, getMaxOffsetOfItems, Items_Are_From_Same_Production,
    yieldTransitions
} from "./yield_transitions.js";


export function processPeekTransitionLeaves(
    node: TransitionNode,
    options: RenderBodyOptions,
    offset: number = 0,
): void {

    const { grammar } = options;

    if (node.items.length > 0) {

        if (Items_From_Same_Production_Allow_Production_Call(node, options, offset))

            throw new Error("This case should have been handled in yieldNodes");


        if (node.items.length > 1) {

            if (node.items.some(i => i.atEND)) {
                addUnresolvedNode(node, options, offset);
            } else if (We_Can_Call_Single_Production_From_Items(node, options))

                convertStateToProductionCall(node, offset);

            else if (Items_Have_The_Same_Active_Symbol(node.items, grammar))

                addSameActiveSymbolNode(node, options, offset);

            else if (No_Matching_Extended_Goto_Item_In_State_Closure(node, options))

                if (State_Closure_Allows_Production_Call(node, options))

                    convertStateToClosureProductionCall(node, offset);

                else
                    addRegularYieldNode(node, getClosure(node.closure, grammar), options, offset + 1);

            else

                if (
                    Every_Leaf_Of_TransitionTree_Contain_One_Root_Item(
                        getTransitionTree(grammar, node.items, options.global_production_items/*options.goto_items*/, 10, 8).tree_nodes[0]
                    )
                )

                    addRegularYieldNode(node, node.items, options, offset);

                else

                    addUnresolvedNode(node, options, offset);

        }
        else

            convertPeekStateToSingleItemNode(node, options, offset);

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

        } else {

            node.transition_type = TRANSITION_TYPE.ASSERT_CONSUME;

            node.peek_level = -1;
        }
    } else if (getMaxOffsetOfItems(items) == 0) {
        node.transition_type = TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS;
    } if (Sym_Is_A_Production(sym)) {
        node.transition_type = TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS;
    } else if (items[0].atEND) {
        node.transition_type = TRANSITION_TYPE.ASSERT_END;
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

    node.nodes.push(...yieldTransitions(items, options, offset + 1, const_EMPTY_ARRAY, true));

}

function addUnresolvedNode(node: TransitionNode, options: RenderBodyOptions, offset: number) {

    const items = node.items.setFilter(i => i.id);

    if (items.every(i => i.atEND)) {
        node.transition_type == TRANSITION_TYPE.ASSERT_END;
        node.nodes.push(...yieldEndItemTransitions(items, options, offset));
    } else {

        //filter out shift/reduce conflicts
        let filtered_items = items.filter(i => {
            if (i.atEND) {
                if (items.some(j => j != i && j.getProduction(options.grammar).id == i.getProduction(options.grammar).id)) return false;

                const sym = i.decrement().sym(options.grammar);

                if (Sym_Is_A_Production(sym))
                    if (items.some(j => j != i && j.getProduction(options.grammar).id == sym.val)) return false;
            }
            return true;
        });

        if (filtered_items.length == 1) {

            node.items = filtered_items;

            node.nodes.length = 0;

            convertPeekStateToSingleItemNode(node, options, offset);

        } else {


            for (const items_with_same_symbol of filtered_items.group(i => i.sym(options.grammar))) {

                const unresolved_leaf_node = createTransitionNode(items_with_same_symbol, node.symbols, TRANSITION_TYPE.ASSERT, offset, node.peek_level, true);

                unresolved_leaf_node.nodes.push(...yieldTransitions(items_with_same_symbol, options, offset, const_EMPTY_ARRAY, false));

                node.nodes.push(unresolved_leaf_node);
            }

            node.transition_type = TRANSITION_TYPE.PEEK_UNRESOLVED;
        }

    }

}



function Active_Symbol_Of_First_Item_Is_A_Production(node: TransitionNode, grammar: Grammar) {
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
        node.items.every(i => !extended_goto_items.some(s => s.body == i.body))
        &&
        node.items.every(i => !i.atEND);
}

function Items_From_Same_Production_Allow_Production_Call(node: TransitionNode, options: RenderBodyOptions, offset: number) {
    const
        { production_ids, grammar } = options,
        ITEMS_ARE_FROM_SAME_PRODUCTION = Items_Are_From_Same_Production(node.items, grammar),
        [first] = node.items,
        prod = first.getProduction(grammar);

    return offset == 0 && ITEMS_ARE_FROM_SAME_PRODUCTION && !production_ids.includes(prod.id);
}
