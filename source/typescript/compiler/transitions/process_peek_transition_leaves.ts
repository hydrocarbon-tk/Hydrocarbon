import { Grammar } from "../../types/grammar.js";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { RenderBodyOptions } from "../../types/render_body_options.js";
import { getClosure } from "../../utilities/closure.js";
import { Items_Have_The_Same_Active_Symbol, Item } from "../../utilities/item.js";
import { getProductionID } from "../../utilities/production.js";
import { Sym_Is_A_Production, Sym_Is_A_Production_Token } from "../../utilities/symbol.js";
import { getTransitionTree } from "../../utilities/transition_tree.js";
import { const_EMPTY_ARRAY } from "../../utilities/const_EMPTY_ARRAY.js";
import { createTransitionNode } from "./create_transition_node.js";
import { yieldEndItemTransitions } from "./yield_end_item_transitions.js";
import { getMaxOffsetOfItems, Items_Are_From_Same_Production, Leaves_Of_Transition_Contain_One_Root_Item as Every_Leaf_Of_TransitionTree_Contain_One_Root_Item, yieldTransitions } from "./yield_transitions.js";
export function processPeekTransitionLeaves(
    state: TransitionNode,
    options: RenderBodyOptions,
    offset: number = 0,
): void {

    const { grammar } = options;

    if (state.items.length > 0) {

        if (Items_From_Same_Production_Allow_Production_Call(state, options, offset))

            throw new Error("This case should have been handled in yieldStates");


        if (state.items.length > 1) {

            if (state.items.some(i => i.atEND)) {
                addUnresolvedStates(state, options, offset);
            } else if (We_Can_Call_Single_Production_From_Items(state, options))

                convertStateToProductionCall(state, offset);

            else if (Items_Have_The_Same_Active_Symbol(state.items, grammar))

                addSameActiveSymbolStates(state, options, offset);

            else if (No_Matching_Extended_Goto_Item_In_State_Closure(state, options))

                if (State_Closure_Allows_Production_Call(state, options))

                    convertStateToClosureProductionCall(state, offset);

                else
                    addRegularYieldStates(state, getClosure(state.closure, grammar), options, offset + 1);

            else

                if (
                    Every_Leaf_Of_TransitionTree_Contain_One_Root_Item(
                        getTransitionTree(grammar, state.items, options.global_production_items/*options.goto_items*/, 10, 8).tree_nodes[0]
                    )
                )

                    addRegularYieldStates(state, state.items, options, offset);

                else

                    addUnresolvedStates(state, options, offset);

        }
        else

            convertPeekStateToSingleItemState(state, options, offset);

    }
}

function addSameActiveSymbolStates(state: TransitionNode, options: RenderBodyOptions, offset: number) {

    if (Active_Symbol_Of_First_Item_Is_A_Production(state, options.grammar))
        state.transition_type = TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS;

    addRegularYieldStates(state, state.items, options, offset + 1);
}
function convertPeekStateToSingleItemState(state: TransitionNode, { grammar }: RenderBodyOptions, offset: number) {

    const { items } = state;

    const sym = items[0].sym(grammar);

    if (state.peek_level == 0) {
        if (Sym_Is_A_Production(sym)) {

            state.transition_type = TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS;

        } else {

            if (Sym_Is_A_Production_Token(sym)) {
                state.symbols = [sym];
            }

            state.transition_type = TRANSITION_TYPE.ASSERT_CONSUME;

            state.peek_level = -1;
        }
    } else if (getMaxOffsetOfItems(items) == 0) {
        state.transition_type = TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS;
    } if (Sym_Is_A_Production(sym)) {
        state.transition_type = TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS;
    } else if (items[0].atEND) {
        state.transition_type = TRANSITION_TYPE.ASSERT_END;
    } else {
        state.transition_type = TRANSITION_TYPE.ASSERT;
    }


    state.offset = offset;
}

function convertStateToClosureProductionCall(state: TransitionNode, offset: number) {

    state.items = state.closure.slice(0, 1);

    state.offset = offset;

    state.transition_type = TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS;
}

function convertStateToProductionCall(state: TransitionNode, offset: number) {

    state.items = [state.items[0]];

    state.offset = offset;

    state.transition_type = TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS;
}


function addRegularYieldStates(state: TransitionNode, items: Item[], options: RenderBodyOptions, offset: number) {

    state.states.push(...yieldTransitions(items, options, offset + 1, const_EMPTY_ARRAY, true));

}

function addUnresolvedStates(state: TransitionNode, options: RenderBodyOptions, offset: number) {

    const items = state.items.setFilter(i => i.id);



    if (items.every(i => i.atEND)) {
        state.transition_type == TRANSITION_TYPE.ASSERT_END;
        state.states.push(...yieldEndItemTransitions(items, options, offset));
    } else {

        //filter out shift/reduce conflicts
        let filtered_items = items.filter(i => {
            const sym = i.decrement().sym(options.grammar);

            if (Sym_Is_A_Production(sym))
                if (items.some(j => j != i && j.getProduction(options.grammar).id == sym.val)) return false;

            return true;
        });

        if (filtered_items.length == 1) {
            state.items = filtered_items;
            return convertPeekStateToSingleItemState(state, options, offset);
        } else {


            for (const items_with_same_symbol of items.group(i => i.sym(options.grammar))) {

                const unresolved_leaf_node = createTransitionNode(items_with_same_symbol, state.symbols, TRANSITION_TYPE.ASSERT, offset, state.peek_level, true);

                unresolved_leaf_node.states.push(...yieldTransitions(items_with_same_symbol, options, offset, const_EMPTY_ARRAY, false));

                state.states.push(unresolved_leaf_node);
            }
        }

    }

}



function Active_Symbol_Of_First_Item_Is_A_Production(state: TransitionNode, grammar: Grammar) {
    return Sym_Is_A_Production(state.items[0].sym(grammar));
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

function No_Matching_Extended_Goto_Item_In_State_Closure(state: TransitionNode, options: RenderBodyOptions) {

    const { extended_goto_items } = options;

    return getMaxOffsetOfItems(state.items) == 0
        &&
        state.items.every(i => !extended_goto_items.some(s => s.body == i.body))
        &&
        state.items.every(i => !i.atEND);
}

function Items_From_Same_Production_Allow_Production_Call(state: TransitionNode, options: RenderBodyOptions, offset: number) {
    const
        { production_ids, grammar } = options,
        ITEMS_ARE_FROM_SAME_PRODUCTION = Items_Are_From_Same_Production(state.items, grammar),
        [first] = state.items,
        prod = first.getProduction(grammar);

    return offset == 0 && ITEMS_ARE_FROM_SAME_PRODUCTION && !production_ids.includes(prod.id);
}
