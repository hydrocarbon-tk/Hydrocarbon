import { Item, getTransitionTree, getFollowClosure } from "../util/common.js";
import {
    g_lexer_name,
    getAccompanyingItems,
    itemsToProductions,
    addFollowCheckCall
} from "./utilities/utilities.js";
import { SC } from "./utilities/skribble.js";
import { getClosure, getFollow } from "../util/process_closure.js";
import { RenderBodyOptions } from "./types/RenderBodyOptions";
import { buildPeekSequence } from "./build_peek_sequence.js";
import { RecognizerState } from "./types/RecognizerState.js";
import { processProductionChain } from "./process_production_chain.js";
import { EOF_SYM } from "../types/grammar.js";




/**
 * Create code that handles cases of items reaching their end point. If multiple items
 * are found to be completed, then follow is used to determine which production should
 * be used.
 */
export function* addEndItemSequence(
    end_items: Item[],
    options: RenderBodyOptions,
    offset: number = 0
): Generator<RecognizerState[], RecognizerState[]> {

    const { grammar, runner, lr_productions } = options;

    let default_end_items: Item[] = [], roots = [], closures = [], out_group = [];

    if (lr_productions.length > 0 && end_items.length > 1) {
        const
            original_prods = itemsToProductions(end_items, grammar),
            prods = end_items.map(i => processProductionChain(new SC, options, itemsToProductions([i], grammar))[0]),
            active_items = getAccompanyingItems(grammar, prods, lr_productions).map(i => i.increment());

        if (end_items.length > 1) {

            if (active_items.length == 1) {

                const
                    prod = active_items[0].decrement().getProductionAtSymbol(grammar).id,
                    item_index = prods.indexOf(prod),
                    item = end_items[item_index];
                default_end_items.push(item);
            } else {

                let { tree_nodes } = getTransitionTree(grammar, end_items, lr_productions, 10, 8, 100, 0,
                    lr_productions.filter(i => original_prods.includes(i.sym(grammar).val)).map(i => {
                        let
                            item = i.increment(),
                            closure = getFollowClosure(getClosure([item], grammar), lr_productions, grammar);
                        const index = original_prods.indexOf(i.getProductionAtSymbol(grammar).id);
                        roots.push(index);
                        const c = closure.slice();
                        c.unshift(end_items[index]);
                        closures.push(c);
                        return { final: 0, sym: null, index, closure: closure };
                    }));

                const gen = buildPeekSequence(tree_nodes, grammar, runner, g_lexer_name, -1, true);
                let val = gen.next();

                while (!val.done) {
                    const group: RecognizerState[] = <RecognizerState[]>val.value;
                    group.forEach(g => g.offset = offset);
                    for (const a of group.filter(a => a.leaf)) {
                        a.leaf = false;
                        const
                            items = a.items,
                            selected = items.sort((a, b) => a.body - b.body),
                            item = selected[0],
                            obj = <RecognizerState>{
                                code: new SC,
                                hash: "not-defined-single-item",
                                yielder: "single-1",
                                items: [item],
                                leaf: true,
                                offset,
                                peek_level: -1,
                                sym: EOF_SYM
                            };
                        yield [obj];
                        a.code = obj.code;
                        a.hash = a.code.hash();
                    }

                    if (group.some(g => g.peek_level == 0)) {
                        out_group.push(...group);
                    } else yield group;
                }
            }
        }
    } else
        default_end_items = end_items;

    default_end_items = default_end_items.setFilter(i => i.id);

    for (let i = 0; i < default_end_items.length; i++) {

        const
            item = default_end_items[i],
            follow = [...getFollow(item.getProduction(grammar).id, grammar)],
            item_out_groups = follow.map(sym => ({
                code: new SC,
                hash: "not-defined-single-item",
                yielder: "single-1",
                items: [item],
                leaf: false,
                offset,
                peek_level: -1,
                sym
            }));

        const obj = <RecognizerState>{
            code: new SC,
            hash: "not-defined-single-item",
            yielder: "single-1",
            items: [item],
            leaf: true,
            offset: offset + 1,
            peek_level: -1,
            sym: EOF_SYM
        };

        yield [obj];

        const
            hash = obj.code.hash(),
            code = obj.code;

        item_out_groups.forEach(i => {
            i.code = code;
            i.hash = hash;
        });

        out_group.push(...item_out_groups);
    }

    return out_group;
}
