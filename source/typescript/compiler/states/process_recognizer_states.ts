import { RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options";

import { Item } from "../../utilities/item.js";
import { SC } from "../../utilities/skribble.js";
import {
    isSymGeneratedId,
    isSymGeneratedNum,
    isSymGeneratedSym
} from "../../utilities/symbol.js";
import { MultiItemReturnObject, SingleItemReturnObject, SelectionClauseGenerator, SelectionGroup } from "../../types/state_generating";
import { defaultSelectionClause, defaultMultiItemLeaf, defaultSingleItemLeaf } from "./default_state_build.js";

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
        a_id = (+a.syms.some(isSymGeneratedId)) * 50 * (a_end),
        a_num = (+a.syms.some(isSymGeneratedNum)) * (a_end),
        a_sym = (+a.syms.some(isSymGeneratedSym)) * 5 * (a_end);

    return a_syms + a_id + a_num + a_sym + a_end;
}
export function processRecognizerStates(
    options: RenderBodyOptions,
    gen: Generator<RecognizerState[], { hash: string, code: SC, prods: number[]; }>,
    selection_clause_fn:
        (gen: SelectionClauseGenerator, state: RecognizerState, items: Item[], level: number, options: RenderBodyOptions) => SC =
        defaultSelectionClause,
    multi_item_leaf_fn:
        (state: RecognizerState, states: RecognizerState[], options: RenderBodyOptions) => MultiItemReturnObject =
        defaultMultiItemLeaf,
    single_item_leaf_fn:
        (item: Item, group: RecognizerState, options: RenderBodyOptions) => SingleItemReturnObject =
        defaultSingleItemLeaf,
    grouping_fn: (node: RecognizerState, level: number, peeking: boolean) => string = defaultGrouping
): { hash: string, code: SC, prods: number[]; } {
    let val = gen.next();

    while (!val.done) {

        const states: RecognizerState[] = <RecognizerState[]>val.value;

        if (states.length > 0) {


            if (states.some(i => !i)) throw new Error("UNDEFINED");

            for (const member of states) {
                if (member.completing) {
                    if (member.items.length == 1) {
                        const { root, prods } = single_item_leaf_fn(member.items[0], member, options);
                        member.code = root;
                        member.hash = root.hash();
                        member.prods = prods;
                    } else
                        throw new Error("Flow should not enter this block: Multi-item moved to group section");
                }
            }

            const
                prods = states.flatMap(g => g.prods).setFilter(),
                items = states.flatMap(g => g.items).setFilter(i => i.id),
                filtered_states = states.filter(s => s.transition_type !== TRANSITION_TYPE.IGNORE && !!s.code);

            //Set the transition type of any state with a null code property to IGNORE
            states.forEach(g => { if (!g.code) g.transition_type = TRANSITION_TYPE.IGNORE; });

            let
                root: SC = null, hash = "ignore";

            if (filtered_states.length > 0) {

                const virtual_state: RecognizerState = {
                    symbol: null,
                    code: filtered_states[0].code,
                    hash: filtered_states[0].hash,
                    prods,
                    items,
                    completing: false,
                    peek_level: filtered_states[0].peek_level,
                    offset: filtered_states[0].offset,
                    transition_type: filtered_states[0].transition_type,
                };

                if (states.some(g => g.symbol == null)) {
                    ({ root } = defaultMultiItemLeaf(virtual_state, states, options));
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

            states.forEach(g => {
                g.prods = prods;
                g.code = root;
                g.hash = hash;
            });
        }

        val = gen.next();
    }

    return { code: val.value.code, prods: val.value.prods, hash: val.value.hash };
}

function* traverseInteriorNodes(
    group: RecognizerState[],
    options: RenderBodyOptions,
    grouping_fn: (node: RecognizerState, level: number, peeking: boolean) => string
): SelectionClauseGenerator {
    const groups = group.group(g => grouping_fn(g, g.peek_level, g.peek_level >= 0));

    const sel_group: SelectionGroup[] = groups.map((group) => {

        const
            syms = group.map(s => s.symbol),
            code = group[0].code,
            hash = group[0].hash,
            items = group.flatMap(g => g.items).setFilter(i => i.id),
            yielders = group.map(i => i.transition_type).setFilter();

        return { transition_types: yielders, syms, code, items, hash, LAST: false, FIRST: false, prods: group.flatMap(g => g.prods).setFilter() };
    });
    let i = 0;
    for (const group of sel_group.sort((a, b) => {
        //return 0;
        return getGroupScore(a) - getGroupScore(b);
    })) {
        group.FIRST = i++ == 0;
        group.LAST = i == groups.length;
        yield group;
    }
}