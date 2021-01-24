import { EOF_SYM } from "../../types/grammar.js";
import { RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { getClosure, getFollowClosure } from "../../utilities/closure.js";
import { getFollow } from "../../utilities/follow.js";
import {
    rec_glob_lex_name
} from "../../utilities/global_names.js";
import { getAccompanyingItems, Item, itemsToProductions } from "../../utilities/item.js";
import { SC } from "../../utilities/skribble.js";
import { getSymbolsFromClosure } from "../../utilities/symbol.js";
import { getTransitionTree } from "../../utilities/transition_tree.js";
import { processProductionChain } from "./process_production_chain.js";
import { buildPeekSequence } from "./yield_peek_states.js";


export function yieldCompletedItemStates(end_items: Item[], options: RenderBodyOptions, offset: number): RecognizerState[] {

    if (end_items.length == 0) return [];

    const
        output_states: RecognizerState[] = [],
        { grammar, goto_items } = options;

    let
        default_end_items: Item[] = [],
        roots = [],
        closures = [];

    if (goto_items.length > 0 && end_items.length > 1) {

        const
            original_prods = itemsToProductions(end_items, grammar),
            prods = end_items.map(i => processProductionChain(new SC, options, itemsToProductions([i], grammar))[0]),
            active_items = getAccompanyingItems(grammar, prods, goto_items).map(i => i.increment());

        if (active_items.length == 1) {

            const
                prod = active_items[0].decrement().getProductionAtSymbol(grammar).id,
                item_index = prods.indexOf(prod),
                item = end_items[item_index],
                syms = getSymbolsFromClosure(getClosure(active_items, grammar), grammar);


            output_states.push(<RecognizerState>{
                code: null,
                hash: "",
                symbols: syms,
                completing: true,
                items: [item],
                peek_level: -1,
                offset,
                transition_type: TRANSITION_TYPE.ASSERT_END,
                prods: [],
                leaves: []
            });

            end_items.splice(item_index, 1);

            default_end_items = end_items;

        } else {

            let { tree_nodes } = getTransitionTree(
                grammar,
                end_items,
                goto_items,
                10, 8, 200, 0,
                goto_items.filter(i => original_prods.includes(+(i.sym(grammar).val))).map(i => {

                    let
                        item = i.increment(),
                        closure = getFollowClosure(getClosure([item], grammar), goto_items, grammar);

                    const
                        index = original_prods.indexOf(i.getProductionAtSymbol(grammar).id),
                        c = closure.slice();

                    roots.push(index);

                    c.unshift(end_items[index]);

                    closures.push(c);

                    return { final: 0, sym: null, index, closure: closure };
                }));

            if (tree_nodes.length > 0) {
                output_states.push(...buildPeekSequence(
                    tree_nodes,
                    options,
                    rec_glob_lex_name,
                    offset,
                    -1,
                    (state, options, offset, lex_name) => {
                        const { items } = state;
                        const selected = items.sort((a, b) => a.body - b.body);
                        state.transition_type = TRANSITION_TYPE.ASSERT_END;
                        state.items = selected.slice(0, 1);
                        state.completing = true;
                    }));
            } else {
                default_end_items = end_items;
            }
        }
    } else {
        default_end_items = end_items;
    }

    default_end_items = default_end_items.setFilter(i => i.id);

    for (const item of default_end_items) {

        const syms = getFollow(item.getProduction(grammar).id, grammar);

        if (syms.length == 0) syms.push(EOF_SYM);

        output_states.push({
            symbols: syms,
            items: [item],
            code: new SC,
            completing: true,
            hash: "",
            offset: offset + 1,
            peek_level: 0,
            transition_type: TRANSITION_TYPE.ASSERT_END,
            prods: [],
            leaves: [],
            states: []
        });
    }

    return output_states;
}