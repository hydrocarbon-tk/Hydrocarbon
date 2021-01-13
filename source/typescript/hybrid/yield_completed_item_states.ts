import { Item, getTransitionTree, getSymbolsFromClosure, getFollowClosure } from "../util/common.js";
import {
    g_lexer_name,
    getAccompanyingItems,
    itemsToProductions,
    isSymAProduction
} from "./utilities/utilities.js";
import { SC } from "./utilities/skribble.js";
import { getClosure, getFollow } from "../util/process_closure.js";
import { RenderBodyOptions } from "./types/RenderBodyOptions";
import { buildPeekSequence } from "./yield_peek_states.js";
import { RecognizerState, TRANSITION_TYPE } from "./types/RecognizerState.js";
import { processProductionChain } from "./process_production_chain.js";
import { EOF_SYM } from "../types/grammar.js";

export function* yieldCompletedItemStates(end_items: Item[], options: RenderBodyOptions, offset: number): Generator<RecognizerState[], RecognizerState[]> {

    if (end_items.length == 0) return [];

    const
        main_groups: RecognizerState[] = [],
        { grammar, runner, lr_productions } = options;

    let
        default_end_items: Item[] = [],
        roots = [],
        closures = [];

    if (lr_productions.length > 0 && end_items.length > 1) {

        const
            original_prods = itemsToProductions(end_items, grammar),
            prods = end_items.map(i => processProductionChain(new SC, options, itemsToProductions([i], grammar))[0]),
            active_items = getAccompanyingItems(grammar, prods, lr_productions).map(i => i.increment());

        if (active_items.length == 1) {

            const
                prod = active_items[0].decrement().getProductionAtSymbol(grammar).id,
                item_index = prods.indexOf(prod),
                item = end_items[item_index],
                syms = getSymbolsFromClosure(getClosure(active_items, grammar), grammar);

            main_groups.push(...syms.map(sym => (<RecognizerState>{
                code: null,
                hash: "",
                symbol: sym,
                completing: true,
                items: [item],
                peek_level: -1,
                offset,
                transition_type: isSymAProduction(sym)
                    ? TRANSITION_TYPE.CONSUME
                    : TRANSITION_TYPE.ASSERT,
                prods: []
            })));

            end_items.splice(item_index, 1);

            default_end_items = end_items;

        } else {

            let { tree_nodes } = getTransitionTree(grammar, end_items, lr_productions, 10, 8, 100, 0, lr_productions.filter(i => original_prods.includes(i.sym(grammar).val)).map(i => {

                let
                    item = i.increment(),
                    closure = getFollowClosure(getClosure([item], grammar), lr_productions, grammar);

                const
                    index = original_prods.indexOf(i.getProductionAtSymbol(grammar).id),
                    c = closure.slice();

                roots.push(index);

                c.unshift(end_items[index]);

                closures.push(c);

                return { final: 0, sym: null, index, closure: closure };
            }));
            const gen = buildPeekSequence(tree_nodes, grammar, runner, g_lexer_name, -1, true);
            let val = gen.next();

            while (!val.done) {
                //@ts-ignore
                const group: RecognizerState[] = <RecognizerState[]>val.value;
                group.forEach(g => g.offset = offset);

                for (const a of group) {

                    if (a.completing) {
                        const { items } = a;
                        const selected = items.sort((a, b) => a.body - b.body);
                        a.items = selected.slice(0, 1);
                        yield [a];
                    }
                }

                yield group;

                val = gen.next();
            }

            main_groups.push(...val.value.map(a => {
                if (a.completing) {
                    const { items } = a;
                    const selected = items.sort((a, b) => a.body - b.body);
                    a.items = selected.slice(0, 1);

                }
                return a;
            }));;
        }
    } else {
        default_end_items = end_items;
    }

    default_end_items = default_end_items.setFilter(i => i.id);

    for (const item of default_end_items) {

        const syms = getFollow(item.getProduction(grammar).id, grammar);

        if (syms.length == 0) syms.push(EOF_SYM);

        for (const sym of syms) {
            const obj: RecognizerState = {
                symbol: sym,
                items: [item],
                code: new SC,
                completing: true,
                hash: "",
                offset: offset + 1,
                peek_level: 0,
                transition_type: isSymAProduction(sym)
                    ? TRANSITION_TYPE.CONSUME
                    : TRANSITION_TYPE.ASSERT,
                prods: []
            };
            main_groups.push(obj);
        }
    }

    return main_groups;
}