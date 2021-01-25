import { EOF_SYM, Grammar } from "../../types/grammar.js";
import { RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { TransitionTreeNode } from "../../types/transition_tree_nodes.js";
import { getClosure } from "../../utilities/closure.js";
import { Items_Have_The_Same_Active_Symbol, Item } from "../../utilities/item.js";
import { getTokenSymbolsFromItems, Sym_Is_A_Production } from "../../utilities/symbol.js";
import { getTransitionTree } from "../../utilities/transition_tree.js";
import { createRecognizerState } from "./create_recognizer_state.js";
import { yieldCompletedItemStates } from "./yield_completed_item_states.js";
import { buildPeekSequence } from "./yield_peek_states.js";

export function Leaves_Of_Transition_Contain_One_Root_Item(node: TransitionTreeNode) {

    if (node.next.length > 0)
        return node.next.every(Leaves_Of_Transition_Contain_One_Root_Item);

    return node.roots.length == 1;
}

export function yieldStates(
    in_items: Item[],
    options: RenderBodyOptions,
    offset: number = 0,
): RecognizerState[] {

    const
        { grammar, production } = options,
        output_states: RecognizerState[] = [],
        end_items = in_items.filter(i => i.atEND),
        active_items = in_items.filter(i => !i.atEND);


    /**
    * If all items are from the same production and the current production function is NOT processing
    * that production, simply do a call to that production function.
    *
    * This should only occur if all items are at the initial shift state or peek was used
    * to get to this offset.
    */
    if (active_items.length > 0) {

        const

            max_item_offset = getMaxOffsetOfItems(active_items),

            first_production = (active_items[0]).getProduction(grammar),
            NUMBER_OF_ACTIVE_ITEMS_IS_ONE = active_items.length == 1,
            ITEMS_HAVE_A_MAX_OFFSET_OF_ZERO = max_item_offset == 0,
            ALL_ITEMS_ARE_FROM_SAME_PRODUCTION = Items_Are_From_Same_Production(active_items, grammar),
            ALL_ITEMS_HAVE_SAME_SYMBOL = Items_Have_The_Same_Active_Symbol(active_items, grammar),
            ALL_ITEMS_ARE_FROM_ROOT_PRODUCTION = ALL_ITEMS_ARE_FROM_SAME_PRODUCTION && first_production.id == production.id,
            ITEMS_SHOULD_CREATE_SHIFT_STATES = (offset > 0 || ALL_ITEMS_ARE_FROM_ROOT_PRODUCTION || ALL_ITEMS_ARE_FROM_SAME_PRODUCTION);


        if (NUMBER_OF_ACTIVE_ITEMS_IS_ONE)

            output_states.push(...yieldSingleItemState(active_items, options, offset));

        else if (ALL_ITEMS_ARE_FROM_SAME_PRODUCTION
            && !ALL_ITEMS_ARE_FROM_ROOT_PRODUCTION
            && ITEMS_HAVE_A_MAX_OFFSET_OF_ZERO
        )

            output_states.push(...yieldProductionCallState(active_items, offset));

        else if (ALL_ITEMS_HAVE_SAME_SYMBOL && ITEMS_SHOULD_CREATE_SHIFT_STATES)

            output_states.push(...yieldStatesOfItemsWithSameSymbol(active_items, options, offset));

        else

            output_states.push(...yieldPeekedStates(active_items, options, offset));

    }

    if (end_items.length > 0)

        output_states.push(...yieldCompletedItemStates(end_items, options, offset));


    return output_states;
}


export function getMaxOffsetOfItems(active_items: Item[]) {
    return active_items.reduce((r, i) => Math.max(i.offset, r), 0);
}

export function Items_Are_From_Same_Production(active_items: Item[], grammar: Grammar) {
    return active_items.setFilter(i => i.getProduction(grammar).id).length == 1;
}

function yieldPeekedStates(active_items: Item[], options: RenderBodyOptions, offset: number): RecognizerState[] {

    const
        { grammar, goto_items: production_shift_items } = options,
        { tree_nodes } = getTransitionTree(
            grammar,
            active_items,
            production_shift_items
        );

    return buildPeekSequence(tree_nodes[0].next, options, offset);
}

function yieldStatesOfItemsWithSameSymbol(active_items: Item[], options: RenderBodyOptions, offset: number): RecognizerState[] {

    let leaf_state: RecognizerState = null, root = null;

    const { grammar } = options, output_states = [];

    while (active_items.every(i => !i.atEND && i.sym(grammar).val == active_items[0].sym(grammar).val)) {

        const
            sym = active_items[0].sym(grammar),
            state = createRecognizerState(
                active_items.slice(),
                [sym],
                Sym_Is_A_Production(sym)
                    ? TRANSITION_TYPE.ASSERT
                    : TRANSITION_TYPE.CONSUME, offset++
            );

        if (leaf_state) {
            leaf_state.states.push(state);
            leaf_state = state;
        } else {
            leaf_state = state;
            root = state;
            output_states.push(state);
        }

        active_items = active_items.map(i => i.increment());
    }

    const states = yieldStates(active_items, options, offset);

    if (states.length == 0) {
        throw new Error(
            `Unexpected end of states\n${root.items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")}`);
    }

    leaf_state.states.push(...states);

    return output_states;
}

function yieldProductionCallState(active_items: Item[], offset: number): RecognizerState[] {

    const

        first = active_items[0],

        items = [new Item(first.body, first.len, 0)];

    return [createRecognizerState(items, [EOF_SYM], TRANSITION_TYPE.IGNORE, offset)];
}

function yieldSingleItemState(items: Item[], { grammar }: RenderBodyOptions, offset: number): RecognizerState[] {

    const
        symbols = getTokenSymbolsFromItems(
            getClosure(items.slice(), grammar),
            grammar
        );

    if (symbols.length > 0) {

        const

            IS_SYM_PRODUCTION = Sym_Is_A_Production(items[0].sym(grammar)),

            transition_type: TRANSITION_TYPE = IS_SYM_PRODUCTION
                ? TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS
                : TRANSITION_TYPE.CONSUME;

        return [createRecognizerState(items, symbols, transition_type, offset)];
    }

    return [];
}


