import { RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options.js";
import { getClosure } from "../../utilities/closure.js";
import { doItemsHaveSameSymbol } from "../../utilities/item.js";
import { symIsAProduction, symIsAProductionToken } from "../../utilities/symbol.js";
import { getTransitionTree } from "../../utilities/transition_tree.js";
import { cleanLeaves, yieldStates } from "./yield_states.js";


export function processPeekStateLeaf(
    state: RecognizerState,
    options: RenderBodyOptions,
    offset: number = 0,
): void {

    const { grammar, goto_items: production_shift_items, extended_goto_items: extended_production_shift_items, production } = options;

    //Set leaf state to false as this will likely be replaced
    //with resolution states. 
    state.completing = false;

    const
        closure = state.closure,
        items = state.items,
        [first] = state.items,
        max_item_offset = state.items.reduce((r, i) => Math.max(i.offset, r), 0),
        SAME_PRODUCTION = state.items.setFilter(i => i.getProduction(grammar).id).length == 1,
        prod = first.getProduction(grammar);

    if (items.length > 0) {

        const SAME_SYMBOL = doItemsHaveSameSymbol(items, grammar);

        if (offset == 0 && SAME_PRODUCTION && prod.id !== production.id) {

            throw new Error("SAME_PRODUCTION HELP!");

        } else if (items.length > 1) {

            if (SAME_SYMBOL) {

                if (symIsAProduction(state.items[0].sym(grammar)))
                    state.transition_type = TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS;

                state.states.push(...yieldStates(items, options, offset + 1));

            } else if (
                max_item_offset == 0
                &&
                items.every(i => !extended_production_shift_items.some(s => s.body == i.body))
            ) {
                if (closure.every(i => i.offset == 0) && closure.map(i => i.getProduction(grammar).id).setFilter().length == 1) {

                    //Just begun parsing production and can simply make a direct call of another production function
                    state.items = state.closure.slice(0, 1);

                    state.completing = true;

                    state.offset = offset;

                    state.transition_type = TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS;
                }
                else
                    state.states.push(...yieldStates(getClosure(closure, grammar).map(i => i), options, offset + 1));

            } else {

                const tree = getTransitionTree(grammar, items, production_shift_items, 10, 8);

                if (cleanLeaves(tree.tree_nodes[0])) {

                    state.states.push(...yieldStates(items, options, offset + 1));

                } else {
                    //Multi Item resolution
                    for (const group of items.group(i => i.sym(grammar))) {
                        state.states.push({
                            symbols: null,
                            states: yieldStates(group, options, offset),
                            code: null,
                            completing: false,
                            hash: "",
                            offset,
                            peek_level: state.peek_level,
                            items,
                            transition_type: TRANSITION_TYPE.ASSERT
                        });
                    }
                }
            }
        } else {

            const sym = items[0].sym(grammar);

            if (state.peek_level == 0) {
                state.transition_type = symIsAProduction(sym)
                    ? TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS
                    : TRANSITION_TYPE.CONSUME;

                if (!symIsAProduction(sym))
                    state.transition_type = TRANSITION_TYPE.CONSUME;

                if (symIsAProductionToken(sym))
                    state.symbols = [sym];

            } else {
                if (symIsAProduction(sym)) {
                    state.transition_type = TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS;
                }
            }

            state.completing = true;

            state.offset = offset;
        }
    }
}
