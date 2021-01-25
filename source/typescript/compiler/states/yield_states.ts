import { EOF_SYM } from "../../types/grammar.js";
import { RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { TokenSymbol } from "../../types/symbol.js";
import { TransitionTreeNode } from "../../types/transition_tree_nodes.js";

import { getClosure } from "../../utilities/closure.js";
import { doItemsHaveSameSymbol, Item } from "../../utilities/item.js";
import { SC, VarSC } from "../../utilities/skribble.js";
import { symIsAProduction } from "../../utilities/symbol.js";
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
    lex_name: VarSC,
    offset: number = 0,
): RecognizerState[] {
    const
        { grammar, helper: runner, production, goto_items: production_shift_items } = options,
        output_states: RecognizerState[] = [];

    let
        end_items = in_items.filter(i => i.atEND),
        active_items = in_items.filter(i => !i.atEND);

    try {

        /**
        * If all items are from the same production and the current production function is NOT processing
        * that production, simply do a call to that production function.
        *
        * This should only occur if all items are at the initial shift state or peek was used
        * to get to this offset.
        */
        if (active_items.length > 0) {

            const
                SAME_PRODUCTION = active_items.setFilter(i => i.getProduction(grammar).id).length == 1,
                SAME_SYMBOL = doItemsHaveSameSymbol(active_items, grammar),
                max_item_offset = active_items.reduce((r, i) => Math.max(i.offset, r), 0),
                first_production = (active_items[0]).getProduction(grammar),
                ROOT_PRODUCTION = SAME_PRODUCTION && first_production.id == production.id;

            if (active_items.length == 1) {

                const
                    closure = getClosure(active_items.slice(), grammar),
                    anticipated_syms = [...closure.filter(i => !i.atEND && !symIsAProduction(i.sym(grammar))).map(i => <TokenSymbol>i.sym(grammar))];


                if (anticipated_syms.length > 0) {

                    const
                        IS_SYM_PRODUCTION = symIsAProduction(active_items[0].sym(grammar)),
                        transition_type: TRANSITION_TYPE = IS_SYM_PRODUCTION
                            ? TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS
                            : TRANSITION_TYPE.CONSUME;

                    output_states.push(<RecognizerState>{
                        code: new SC,
                        hash: "",
                        symbols: anticipated_syms,
                        transition_type,
                        items: active_items,
                        completing: true,
                        offset,
                        peek_level: -1,
                        states: []
                    });
                }
            } else if (SAME_PRODUCTION && !ROOT_PRODUCTION && (max_item_offset == 0)) {

                const

                    first = active_items[0],

                    items = [new Item(first.body, first.len, 0)];

                output_states.push(<RecognizerState>{
                    code: new SC,
                    hash: "not-defined-production-call",
                    transition_type: TRANSITION_TYPE.IGNORE,
                    items,
                    completing: true,
                    offset,
                    peek_level: -1,
                    symbols: [EOF_SYM],
                    states: []
                });

            } else if (SAME_SYMBOL && (offset > 0 || ROOT_PRODUCTION || SAME_PRODUCTION)) {

                let leaf_state: RecognizerState = null, root = null;

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

                const states = yieldStates(active_items, options, lex_name, offset);

                if (states.length == 0) {
                    throw new Error(
                        `Unexpected end of states\n${root.items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")}`);
                }

                leaf_state.states.push(...states);

            } else {

                const
                    { tree_nodes } = getTransitionTree(
                        grammar,
                        active_items,
                        production_shift_items
                    );

                output_states.push(...buildPeekSequence(tree_nodes[0].next, options, lex_name, offset));
            }
        }

        output_states.push(...yieldCompletedItemStates(end_items, options, offset));

        return output_states;

    } catch (e) {
        return <RecognizerState[]>[{
            symbol: EOF_SYM,
            code: SC.Comment(e.stack),
            hash: "error-hash"
        }];
    }
}
