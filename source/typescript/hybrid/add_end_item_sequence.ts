import { Item, getTransitionTree, getSymbolsFromClosure, getFollowClosure } from "../util/common.js";
import {
    getIncludeBooleans,
    g_lexer_name,
    addFollowCheckCall
} from "./utilities/utilities.js";
import { SC } from "./utilities/skribble.js";
import { getClosure } from "../util/process_closure.js";
import { RenderBodyOptions } from "./types/RenderBodyOptions";
import { itemsToProductions, processProductionChain, getAccompanyingItems, renderItem } from "./hybrid_function_constructor.js";
import { buildPeekSequence } from "./build_peek_sequence.js";




/**
 * Create code that handles cases of items reaching their end point. If multiple items
 * are found to be completed, then follow is used to determine which production should
 * be used.
 */
export function* addEndItemSequence(
    end_items: Item[],
    options: RenderBodyOptions,
    USE_IF: boolean): Generator<{ prods: number[]; _if: SC; }, SC> {

    const { grammar, productions, runner, lr_productions } = options;

    let node = null, root = null, default_end_items: Item[] = [];
    let jr = 0, roots = [], closures = [];

    if (lr_productions.length > 0 && end_items.length > 1) {
        const original_prods = itemsToProductions(end_items, grammar);
        const prods = end_items.map(i => processProductionChain(new SC, options, lr_productions, itemsToProductions([i], grammar), [], true)[0]);

        const active_items = getAccompanyingItems(grammar, prods, lr_productions).map(i => i.increment());


        if (end_items.length > 1) {
            if (active_items.length == 1) {
                const prod = active_items[0].decrement().getProductionAtSymbol(grammar).id;
                const item_index = prods.indexOf(prod);
                const item = end_items[item_index];
                const syms = getSymbolsFromClosure(getClosure(active_items, grammar), grammar);
                const boolean = getIncludeBooleans(syms, grammar, runner);
                node = root = SC.If(boolean).addStatement();
                renderItem(node, item, grammar, runner, productions, true);
                yield { prods: itemsToProductions([item], grammar), _if: node };
                end_items.splice(item_index, 1);
                default_end_items = end_items;
            } else {

                let { tree_nodes } = getTransitionTree(grammar, end_items, lr_productions, 10, 8, 100, 0, lr_productions.filter(i => original_prods.includes(i.sym(grammar).val)).map(i => {
                    let item = i.increment();
                    let closure = getFollowClosure(getClosure([item], grammar), lr_productions, grammar);
                    const index = original_prods.indexOf(i.getProductionAtSymbol(grammar).id);
                    roots.push(index);
                    const c = closure.slice();
                    c.unshift(end_items[index]);
                    closures.push(c);
                    return { final: 0, sym: null, index, closure: closure };
                }));
                /*
                tree_nodes = [
                    {
                        item_ids: [],
                        unskippable: [],
                        depth: -1,
                        next: tree_nodes,
                        roots: end_items,
                        sym: { val: "@@" },
                        closure: [],
                        final_count: 0
                    }
                ];
                //*/
                //*
                const gen = buildPeekSequence(tree_nodes, grammar, runner, g_lexer_name, -1, true);
                let val = gen.next();

                while (!val.done) {
                    //@ts-ignore
                    const { _if: __if, items } = val.value, [first] = items;
                    jr++;
                    const selected = items.sort((a, b) => a.body - b.body);
                    const item = selected[0];
                    renderItem(__if, item, grammar, runner, productions, true);
                    yield { prods: itemsToProductions([item], grammar), _if: __if };
                    val = gen.next();

                    if (val.done) { __if.expressions = []; }
                }

                node = val.value.leaf;
                root = val.value._if;
                //*/
            }
        }
    } else
        default_end_items = end_items;

    default_end_items = default_end_items.setFilter(i => i.id);

    USE_IF = USE_IF && default_end_items.length > 1;

    for (let i = 0; i < default_end_items.length; i++) {
        const item = default_end_items[i];
        const _if = SC.If(
            (i == default_end_items.length - 1 || default_end_items.length == 1) ? undefined :
                addFollowCheckCall(grammar, runner, item.getProduction(grammar), <any>SC.Call(SC.Member(g_lexer_name, "copy")))
        );
        const sc = renderItem(_if, item, grammar, runner, productions, true);

        yield { prods: itemsToProductions([item], grammar), _if };
        if (!node) {
            node = _if;
            root = _if;

        } else {
            node.addStatement(_if);
            node = _if;
        }
    }


    return root;
}
