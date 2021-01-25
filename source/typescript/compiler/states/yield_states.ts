import { EOF_SYM, Grammar } from "../../types/grammar.js";
import { RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { TransitionTreeNode } from "../../types/transition_tree_nodes.js";
import { getClosure } from "../../utilities/closure.js";
import { doItemsHaveSameSymbol, Item } from "../../utilities/item.js";
import { SC } from "../../utilities/skribble.js";
import { getTokenSymbolsFromItems, symIsAProduction } from "../../utilities/symbol.js";
import { getTransitionTree } from "../../utilities/transition_tree.js";
import { yieldCompletedItemStates } from "./yield_completed_item_states.js";
import { buildPeekSequence } from "./yield_peek_states.js";

export function cleanLeaves(node: TransitionTreeNode) {

    if (node.next.length > 0)
        return node.next.every(cleanLeaves);

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

            SAME_PRODUCTION = areItemsFromSameProduction(active_items, grammar),

            SAME_SYMBOL = doItemsHaveSameSymbol(active_items, grammar),

            max_item_offset = getMaxOffsetOfItems(active_items),

            first_production = (active_items[0]).getProduction(grammar),

            ROOT_PRODUCTION = SAME_PRODUCTION && first_production.id == production.id;


        if (active_items.length == 1)

            output_states.push(...yieldSingleItemState(active_items, options, offset));

        else if (SAME_PRODUCTION && !ROOT_PRODUCTION && (max_item_offset == 0))

            output_states.push(...yieldProductionCallState(active_items, offset));

        else if (SAME_SYMBOL && (offset > 0 || ROOT_PRODUCTION || SAME_PRODUCTION))

            output_states.push(...yieldStatesOfItemsWithSameSymbol(active_items, options, offset));

        else

            output_states.push(...yieldPeekedStates(active_items, options, offset));

    }

    if (end_items.length > 0)

        output_states.push(...yieldCompletedItemStates(end_items, options, offset));


    return output_states;
}


function getMaxOffsetOfItems(active_items: Item[]) {
    return active_items.reduce((r, i) => Math.max(i.offset, r), 0);
}

function areItemsFromSameProduction(active_items: Item[], grammar: Grammar) {
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

            state = <RecognizerState>{
                code: new SC,
                hash: "not-defined-same-symbol-chain",
                transition_type: symIsAProduction(sym)
                    ? TRANSITION_TYPE.ASSERT
                    : TRANSITION_TYPE.CONSUME,
                items: active_items.slice(),
                completing: false,
                offset: offset++,
                peek_level: -1,
                symbols: [sym],
                states: []
            };

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

    return [<RecognizerState>{
        code: new SC,
        hash: "not-defined-production-call",
        transition_type: TRANSITION_TYPE.IGNORE,
        items,
        completing: true,
        offset,
        peek_level: -1,
        symbols: [EOF_SYM],
        states: []
    }];
}

function yieldSingleItemState(active_items: Item[], options: RenderBodyOptions, offset: number): RecognizerState[] {

    const
        { grammar } = options,
        anticipated_syms = getTokenSymbolsFromItems(
            getClosure(active_items.slice(), grammar),
            grammar
        );

    if (anticipated_syms.length > 0) {

        const

            IS_SYM_PRODUCTION = symIsAProduction(active_items[0].sym(grammar)),

            transition_type: TRANSITION_TYPE = IS_SYM_PRODUCTION
                ? TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS
                : TRANSITION_TYPE.CONSUME;

        return [<RecognizerState>{
            code: new SC,
            hash: "",
            symbols: anticipated_syms,
            transition_type,
            items: active_items,
            completing: true,
            offset,
            peek_level: -1,
            states: []
        }];
    }

    return [];
}

