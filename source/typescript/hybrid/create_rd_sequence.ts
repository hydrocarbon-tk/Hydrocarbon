import { Item, getTransitionTree } from "../util/common.js";
import { SC, VarSC } from "./utilities/skribble.js";
import { RenderBodyOptions } from "./types/RenderBodyOptions";
import { buildPeekSequence } from "./build_peek_sequence.js";
import { EOF_SYM } from "../types/grammar.js";
import { getClosure } from "../util/process_closure.js";
import { RecognizerState } from "./types/RecognizerState.js";
import { doItemsHaveSameSymbol, getUniqueSymbolName, isSymAProduction } from "./utilities/utilities.js";
import { TokenSymbol } from "../types/Symbol.js";
import { TransitionTreeNode } from "../util/TransitionTreeNode.js";
import { g } from "@candlefw/wind/build/types/ascii_code_points";

export function cleanLeaves(node: TransitionTreeNode) {
    if (node.next.length > 0)
        return node.next.every(cleanLeaves);
    return node.roots.length == 1;
}

export function* createStandardRDSequence(
    items: Item[],
    options: RenderBodyOptions,
    lex_name: VarSC,
    offset: number = 0,
    LR_SECTION_START: boolean = false
): Generator<RecognizerState[], SC> {

    const
        { grammar, runner, production, lr_productions } = options,
        SAME_PRODUCTION = items.setFilter(i => i.getProduction(grammar).id).length == 1,
        SAME_SYMBOL = doItemsHaveSameSymbol(items, grammar),
        max_item_offset = items.reduce((r, i) => Math.max(i.offset, r), 0),
        first_production = items[0].getProduction(grammar),
        ROOT_PRODUCTION = SAME_PRODUCTION && first_production.id == production.id;

    try {
        /**
        * If all items are from the same production and the current production function is NOT processing
        * that production, simply do a call to that production function.
        *
        * This should only occur if all items are at the initial shift state or peek was used
        * to get to this offset.
        */
        if (items.length == 1) {

            const
                obj = <RecognizerState>{
                    code: new SC,
                    hash: "not-defined-single-item",
                    yielder: "single-1",
                    items: items,
                    leaf: true,
                    offset,
                    peek_level: -1,
                    sym: EOF_SYM
                };

            yield [obj];

            let prods = obj.prods;

            if (LR_SECTION_START) {
                const code = obj.code,
                    closure = getClosure(items.slice(), grammar),
                    anticipated_syms = [...closure.filter(i => !i.atEND && !isSymAProduction(i.sym(grammar))).map(i => <TokenSymbol>i.sym(grammar))], ;

                if (anticipated_syms.length > 0) {
                    const hash = code.hash();
                    const objs = anticipated_syms.map(sym => (<RecognizerState>{
                        code,
                        hash,
                        items,
                        yielder: "single-2",
                        leaf: false,
                        offset,
                        peek_level: 0,
                        sym: sym,
                        prods
                    }));
                    yield objs;
                    return objs[0].code;
                }
            }
            return obj.code;

        } if (SAME_PRODUCTION && !ROOT_PRODUCTION && (max_item_offset == 0)) {
            const first = items[0];
            items = [new Item(first.body, first.len, 0, first.follow)];
            const obj: RecognizerState = {
                code: new SC,
                hash: "not-defined-production-call",
                yielder: "same-production",
                items: items, leaf: true, offset, peek_level: -1, sym: EOF_SYM
            };
            yield [obj];
            return obj.code;
        } else if (SAME_SYMBOL && (offset > 0 || ROOT_PRODUCTION || SAME_PRODUCTION)) {

            const sequence: RecognizerState[] = [];

            while (items.every(i => !i.atEND && i.sym(grammar).val == items[0].sym(grammar).val)) {

                const sym = items[0].sym(grammar);

                sequence.push({
                    code: new SC,
                    hash: "not-defined-same-symbol-chain",
                    yielder: "same-symbol-chain-2",
                    items: items,
                    leaf: false,
                    offset: offset++,
                    peek_level: -1, sym
                });

                items = items.map(i => i.increment());
            }
            let code = new SC, prods;
            if (items.length > 0) {
                if (items.length == 1) {
                    const obj: RecognizerState =
                        { code: new SC, yielder: "same-symbol-2", hash: "not-defined-same-symbol", items, leaf: true, peek_level: -1, offset, sym: EOF_SYM };
                    yield [obj];
                    code = obj.code;
                    prods = obj.prods;
                } else {
                    const gen = createStandardRDSequence(items, options, lex_name, offset);
                    let val = gen.next();
                    while (!val.done) {
                        yield <RecognizerState[]>val.value;
                        prods = val.value[0].prods;
                        val = gen.next();
                    }
                    code = val.value;
                }

                for (const state of sequence.reverse()) {
                    state.code = code;
                    state.hash = code.hash();
                    state.prods = prods;
                    yield [state];
                    code = state.code;
                }

                return code;
            }

        } else {
            const
                { tree_nodes } = getTransitionTree(grammar, items, lr_productions),
                gen = buildPeekSequence(tree_nodes[0].next, grammar, runner, lex_name, production.id, false);

            let val = gen.next();

            const state_look_up: Map<string, { code: SC, hash: string, prods: number[]; }> = new Map;

            while (!val.done) {
                const group: RecognizerState[] = <RecognizerState[]>val.value;

                group.forEach(g => g.offset = offset);
                //create sequences here

                for (const a of group.filter(a => a.leaf)) {

                    //Set leaf state to false as this will be replaced
                    //with resolution states. 
                    a.leaf = false;

                    //decide what to do with the sub elements

                    const
                        closure = a.closure,
                        items = a.items,
                        [first] = items,
                        max_item_offset = items.reduce((r, i) => Math.max(i.offset, r), 0),
                        SAME_PRODUCTION = items.setFilter(i => i.getProduction(grammar).id).length == 1,
                        prod = first.getProduction(grammar);

                    let
                        code = new SC,
                        prods = null,
                        gen: Generator<RecognizerState[], SC> = null;
                    /**
                     * Reduce redundant RecognizerState's by creating a hash from the states  items and follow symbols 
                     * and using that to cache code, hash, and prods that would otherwise be repeatedly generated.
                     */
                    const state_hash = items.map(i => i.id).sort().join("") + closure.map(i => i.increment()).filter(i => !i.atEND).map(i => i.sym(grammar).val).sort().join();

                    if (state_look_up.has(state_hash)) {
                        const { prods, code, hash } = state_look_up.get(state_hash);
                        a.prods = prods;
                        a.code = code;
                        a.hash = hash;
                        continue;
                    }

                    if (offset == 0 && SAME_PRODUCTION && prod.id !== prod.id) {
                        throw new Error("SAME_PRODUCTION HELP!");
                    } else if (items.length > 1) {

                        const SAME_SYMBOL = doItemsHaveSameSymbol(items, grammar);

                        if (SAME_SYMBOL) {
                            gen = createStandardRDSequence(items.map(i => i), options, lex_name, offset + 1);
                        } else if (max_item_offset == 0) {
                            gen = createStandardRDSequence(getClosure(closure, grammar), options, lex_name, offset + 1);
                        } else {
                            const tree = getTransitionTree(grammar, items, lr_productions, 10, 8);
                            if (cleanLeaves(tree.tree_nodes[0])) {
                                gen = createStandardRDSequence(items.map(i => i), options, lex_name, offset + 1);
                            } else {
                                const
                                    group: RecognizerState[] = [],
                                    item_groups = items.group(i => getUniqueSymbolName(i.sym(grammar)));

                                for (const items of item_groups) {
                                    const
                                        sym = items[0].sym(grammar),
                                        gen = createStandardRDSequence(items.map(i => i.increment()), options, lex_name, offset + 1);

                                    let val = gen.next(), prods = [];

                                    while (!val.done) {
                                        const obj = <RecognizerState[]>val.value;
                                        yield obj;
                                        prods.push(...obj[0].prods);
                                        val = gen.next();
                                    }

                                    const
                                        code = val.value,
                                        hash = code.hash();

                                    group.push({
                                        code,
                                        hash,
                                        items,
                                        sym,
                                        leaf: true,
                                        offset,
                                        peek_level: -1,
                                        yielder: "conflict",
                                        prods: prods.setFilter(),
                                    });
                                }
                                yield group;
                                code = group[0].code;
                                prods = group[0].prods;
                            }
                        }

                    } else {
                        /**
                         * If the item is at the start of the offset, then we can simply call into the items production
                         * to reduce the amount of processing done in the calling function
                         */
                        const obj = <RecognizerState[]>[{
                            yielder: "single-item-post-peek-2",
                            code: new SC, hash: "not-defined-single-item", items, leaf: true, peek_level: -1, offset: offset + 1, sym: EOF_SYM
                        }];
                        yield obj;
                        code = obj[0].code;
                        prods = obj[0].prods;
                    }

                    if (gen) {
                        let val = gen.next();
                        while (!val.done) {
                            const obj = <RecognizerState[]>val.value;
                            yield obj;
                            prods = obj[0].prods;
                            val = gen.next();
                        }
                        code = val.value;
                    }
                    const hash = code.hash();
                    a.prods = prods.setFilter();
                    a.code = code;
                    a.hash = hash;

                    state_look_up.set(state_hash, { prods: prods.setFilter(), code, hash });
                }
                yield group;
                val = gen.next();
            }

            return val.value;
        }
    } catch (e) {
        return SC.Comment(e.stack);
    }
}
