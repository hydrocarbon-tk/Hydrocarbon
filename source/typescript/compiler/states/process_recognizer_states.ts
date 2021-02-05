import { bidirectionalTraverse, TraverseState } from "@candlefw/conflagrate";
import { GeneratorStateReturn, RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { MultiItemReturnObject, SelectionClauseGenerator, SelectionGroup, SingleItemReturnObject } from "../../types/state_generating";
import { TokenSymbol } from "../../types/symbol.js";
import { Item } from "../../utilities/item.js";
import { SC } from "../../utilities/skribble.js";
import {
    Defined_Symbols_Occlude, Sym_Is_An_Identifier_Generic,
    Sym_Is_A_Numeric_Generic,
    Sym_Is_A_Symbol_Character
} from "../../utilities/symbol.js";
import { default_getSelectionClause } from "./default_getSelectionClause.js";
import { default_getMultiItemLeaf, default_getSingleItemLeaf } from "./default_state_build.js";



export function defaultGrouping(g) {
    return g.hash;
}
function getGroupScore(a: SelectionGroup) {
    const tt = a.transition_types[0];
    let transition_penalty = 1;

    switch (tt) {
        case TRANSITION_TYPE.ASSERT_END:
            transition_penalty = 10000;
            break;
    }

    const
        a_end = transition_penalty,
        a_syms = a.syms.length * (a_end),
        a_id = (+a.syms.some(Sym_Is_An_Identifier_Generic)) * 50 * (a_end),
        a_num = (+a.syms.some(Sym_Is_A_Numeric_Generic)) * 25 * (a_end),
        a_sym = (+a.syms.some(Sym_Is_A_Symbol_Character)) * 5 * (a_end);

    return a_syms + a_id + a_num + a_sym + a_end;
}
export function processRecognizerStates(
    options: RenderBodyOptions,
    states: RecognizerState[],
    selection_clause_fn:
        (gen: SelectionClauseGenerator, state: RecognizerState, items: Item[], level: number, options: RenderBodyOptions) => SC =
        default_getSelectionClause,
    multi_item_leaf_fn:
        (state: RecognizerState, states: RecognizerState[], options: RenderBodyOptions) => MultiItemReturnObject =
        default_getMultiItemLeaf,
    single_item_leaf_fn:
        (item: Item, group: RecognizerState, options: RenderBodyOptions) => SingleItemReturnObject =
        default_getSingleItemLeaf,
    grouping_fn: (node: RecognizerState, level: number, peeking: boolean) => string = defaultGrouping
): GeneratorStateReturn {

    if (states.length == 0)
        return { code: new SC, prods: [], leaves: [], hash: "" };

    const finale_state = { ast: <RecognizerState>null };

    for (const { node: state, meta: { traverse_state, skip } } of bidirectionalTraverse<RecognizerState, "states">(<RecognizerState>{ states }, "states", true)
        .extract(finale_state)
        .makeSkippable()
    ) {

        if (state.PROCESSED) {
            skip();
            continue;
        }

        state.PROCESSED = true;

        switch (traverse_state) {

            case TraverseState.EXIT:

                const
                    states = state.states,
                    leaves = states.flatMap(g => g.leaves),
                    prods = states.flatMap(g => g.prods).setFilter(),
                    items = states.flatMap(g => g.items).setFilter(i => i.id),
                    filtered_states = states.filter(s => s.transition_type !== TRANSITION_TYPE.IGNORE && !!s.code);

                //Set the transition type of any state with a null code property to IGNORE
                states.forEach(g => { if (!g.code) g.transition_type = TRANSITION_TYPE.IGNORE; });

                let
                    root: SC = null, hash = "ignore";

                if (filtered_states.length > 0) {

                    const virtual_state: RecognizerState = {
                        PROCESSED: false,
                        states: [],
                        symbols: [],
                        code: filtered_states[0].code,
                        hash: filtered_states[0].hash,
                        prods,
                        items,
                        completing: false,
                        peek_level: filtered_states[0].peek_level,
                        offset: filtered_states[0].offset,
                        transition_type: filtered_states[0].transition_type,
                        leaves
                    };

                    if (states.some(g => g.symbols == null)) {
                        ({ root } = multi_item_leaf_fn(virtual_state, states, options));
                    } else {
                        root = selection_clause_fn(
                            traverseInteriorNodes(filtered_states, options, grouping_fn),
                            virtual_state,
                            items,
                            states[0].peek_level,
                            options
                        );
                    }
                    hash = root.hash();
                } else {
                    root = null;
                }

                state.leaves = leaves;
                state.prods = prods;
                state.code = root;
                state.hash = hash;

                break;

            case TraverseState.LEAF:

                if (state.items.length > 1)
                    throw new Error("Flow should not enter this block: Multi-item moved to group section");

                if (state.items.length == 0)
                    throw new Error("Flow should not enter this block: Multi-item moved to group section");

                const { leaf } = single_item_leaf_fn(state.items[0], state, options);
                state.code = leaf.root;
                state.hash = leaf.hash;
                state.prods = leaf.prods;
                state.leaves = [leaf];

                break;

        }
    }

    const { code, prods, hash, leaves } = finale_state.ast;

    return { code, prods, hash, leaves };
}

function* traverseInteriorNodes(
    group: RecognizerState[],
    options: RenderBodyOptions,
    grouping_fn: (node: RecognizerState, level: number, peeking: boolean) => string
): SelectionClauseGenerator {

    const
        groups = group.group(g => grouping_fn(g, g.peek_level, g.peek_level >= 0)),

        sel_group: SelectionGroup[] = groups.map((group) => {

            const
                syms = group.flatMap(s => s.symbols),
                code = group[0].code,
                hash = group[0].hash,
                items = group.flatMap(g => g.items).setFilter(i => i.id),
                leaves = group.flatMap(g => g.leaves),
                yielders = group.map(i => i.transition_type).setFilter();

            return { leaves, transition_types: yielders, syms, code, items, hash, LAST: false, FIRST: false, prods: group.flatMap(g => g.prods).setFilter() };
        });
    let i = 0;
    for (const group of sel_group.sort((a, b) => {

        for (const sym_a of a.syms)
            for (const sym_b of b.syms)
                if (Defined_Symbols_Occlude(<TokenSymbol>sym_a, <TokenSymbol>sym_b))
                    return -1;


        return getGroupScore(a) - getGroupScore(b);
    })) {
        group.FIRST = i++ == 0;
        group.LAST = i == groups.length;
        yield group;
    }
}