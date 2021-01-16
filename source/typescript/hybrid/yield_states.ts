import { Item, getTransitionTree } from "../util/common.js";
import { SC, VarSC } from "./utilities/skribble.js";
import { RenderBodyOptions } from "./types/RenderBodyOptions";
import { buildPeekSequence } from "./yield_peek_states.js";
import { EOF_SYM } from "../types/grammar.js";
import { getClosure } from "../util/process_closure.js";
import { RecognizerState, TRANSITION_TYPE } from "./types/RecognizerState.js";
import { doItemsHaveSameSymbol, isSymAProduction } from "./utilities/utilities.js";
import { TokenSymbol } from "../types/Symbol.js";
import { TransitionTreeNode } from "../util/TransitionTreeNode.js";
import { yieldCompletedItemStates } from "./yield_completed_item_states.js";

export function cleanLeaves(node: TransitionTreeNode) {
    if (node.next.length > 0)
        return node.next.every(cleanLeaves);
    return node.roots.length == 1;
}


export function* yieldStates(
    in_items: Item[],
    options: RenderBodyOptions,
    lex_name: VarSC,
    offset: number = 0,
): Generator<RecognizerState[], { code: SC, prods: number[]; hash: string; }> {

    const
        { grammar, runner, production, production_shift_items, cache } = options,
        state_id = in_items.map(i => i.id).sort().join("-") + "$",
        main_groups: RecognizerState[] = [];

    let
        end_items = in_items.filter(i => i.atEND),
        active_items = in_items.filter(i => !i.atEND);

    //if (cache.has(state_id))
    //    return cache.get(state_id);

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
                    anticipated_syms = [...closure.filter(i => !i.atEND && !isSymAProduction(i.sym(grammar))).map(i => <TokenSymbol>i.sym(grammar))];

                if (anticipated_syms.length > 0) {
                    const
                        IS_SYM_PRODUCTION = isSymAProduction(active_items[0].sym(grammar)),
                        transition_type: TRANSITION_TYPE = IS_SYM_PRODUCTION
                            ? TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS
                            : TRANSITION_TYPE.CONSUME,
                        objs = anticipated_syms.map(sym => (<RecognizerState>{
                            code: new SC,
                            hash: "",
                            transition_type,
                            items: active_items,
                            completing: true,
                            offset,
                            peek_level: -1,
                            symbol: sym
                        }));



                    main_groups.push(...objs);
                }
            } else if (SAME_PRODUCTION && !ROOT_PRODUCTION && (max_item_offset == 0)) {

                const
                    first = active_items[0],
                    items = [new Item(first.body, first.len, 0, first.follow)],
                    obj: RecognizerState = {
                        code: new SC,
                        hash: "not-defined-production-call",
                        transition_type: TRANSITION_TYPE.IGNORE,
                        items,
                        completing: true,
                        offset,
                        peek_level: -1,
                        symbol: EOF_SYM
                    };

                main_groups.push(obj);

            } else if (SAME_SYMBOL && (offset > 0 || ROOT_PRODUCTION || SAME_PRODUCTION)) {


                const sequence: RecognizerState[] = [];

                while (active_items.every(i => !i.atEND && i.sym(grammar).val == active_items[0].sym(grammar).val)) {

                    const sym = active_items[0].sym(grammar);

                    sequence.push(<RecognizerState>{
                        code: new SC,
                        hash: "not-defined-same-symbol-chain",
                        transition_type: isSymAProduction(sym)
                            ? TRANSITION_TYPE.ASSERT
                            : TRANSITION_TYPE.CONSUME,
                        items: active_items.slice(),
                        completing: false,
                        offset: offset++,
                        peek_level: -1,
                        symbol: sym
                    });

                    active_items = active_items.map(i => i.increment());
                }
                let code = new SC, hash = "", prods = [];

                if (active_items.length > 0) {
                    if (active_items.length == 1) {
                        const leaf = sequence.slice().reverse()[0];
                        leaf.completing = true;
                    } else {
                        const gen = yieldStates(active_items, options, lex_name, offset);
                        let val = gen.next();
                        while (!val.done) {
                            yield <RecognizerState[]>val.value;
                            val = gen.next();
                        }
                        ({ code, prods, hash } = val.value);
                    }

                    for (const state of sequence.slice().reverse().slice(0, -1)) {
                        state.code = code;
                        state.hash = hash;
                        state.prods = prods;
                        yield [state];
                        prods.push(...state.prods);
                        ({ code, hash } = state);
                    }
                    sequence[0].code = code;
                    sequence[0].hash = hash;
                    sequence[0].prods = prods.setFilter();

                    main_groups.push(sequence[0]);
                }

            } else {
                const
                    { tree_nodes } = getTransitionTree(
                        grammar,
                        active_items,
                        production_shift_items
                    ),
                    gen = buildPeekSequence(tree_nodes[0].next, grammar, runner, lex_name, production.id, false);

                let val = gen.next();

                const state_look_up: Map<string, { code: SC, hash: string, prods: number[]; }> = new Map;

                while (!val.done) {

                    const group: RecognizerState[] = <RecognizerState[]>val.value;

                    group.forEach(g => g.offset = offset);

                    yield* processPeekStates(group, options, state_look_up, offset, lex_name);

                    yield group;

                    val = gen.next();
                }

                yield* processPeekStates(val.value, options, state_look_up, offset, lex_name);

                main_groups.push(...val.value);
            }
        }

        const gen = yieldCompletedItemStates(end_items, options, offset);

        let val;

        while (!(val = gen.next()).done) {
            yield val.value;
        }

        main_groups.push(...val.value);

        if (main_groups.length > 0) {

            yield main_groups;

            cache.set(state_id, { code: main_groups[0].code, prods: main_groups[0].prods, hash: main_groups[0].hash });

            return { code: main_groups[0].code, hash: main_groups[0].hash, prods: main_groups[0].prods };
        } else {
            return { code: null, hash: "undefined", prods: [] };
        }

    } catch (e) {
        return { code: SC.Comment(e.stack), hash: "error", prods: [] };
    }
}

function* processPeekStates(
    group: RecognizerState[],
    options: RenderBodyOptions,
    state_look_up: Map<string, { code: SC, hash: string, prods: number[]; }>,
    offset: number = 0,
    lex_name: VarSC,
): Generator<RecognizerState[]> {
    const { grammar, production_shift_items, extended_production_shift_items, production } = options;

    for (const a of group.filter(a => a.completing)) {

        //Set leaf state to false as this will likely be replaced
        //with resolution states. 

        a.completing = false;

        const
            closure = a.closure,
            items = a.items,
            [first] = a.items,
            max_item_offset = a.items.reduce((r, i) => Math.max(i.offset, r), 0),
            SAME_PRODUCTION = a.items.setFilter(i => i.getProduction(grammar).id).length == 1,
            prod = first.getProduction(grammar);

        let
            code = null,
            hash = "undefined",
            prods = [],
            gen: Generator<RecognizerState[], { code: SC, prods: number[]; }> = null;

        if (items.length > 0) {

            const SAME_SYMBOL = doItemsHaveSameSymbol(items, grammar);

            if (offset == 0 && SAME_PRODUCTION && prod.id !== production.id) {
                throw new Error("SAME_PRODUCTION HELP!");
            } else if (items.length > 1) {

                if (SAME_SYMBOL) {
                    if (isSymAProduction(a.items[0].sym(grammar)))
                        a.transition_type = TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS;
                    gen = yieldStates(items, options, lex_name, offset + 1);
                } else if (max_item_offset == 0 && items.every(i => !extended_production_shift_items.some(s => s.body == i.body))) {

                    if (closure.every(i => i.offset == 0) && closure.map(i => i.getProduction(grammar).id).setFilter().length == 1) {
                        a.items = a.closure.slice(0, 1);
                        a.completing = true;
                        a.offset = offset;
                        a.transition_type = TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS;
                    } else
                        gen = yieldStates(getClosure(closure, grammar).map(i => i), options, lex_name, offset + 1);

                } else {

                    const tree = getTransitionTree(grammar, items, production_shift_items, 10, 8);

                    if (cleanLeaves(tree.tree_nodes[0])) {

                        gen = yieldStates(items, options, lex_name, offset + 1);
                    } else {
                        //Multi Item resolution
                        const states: RecognizerState[] = [];

                        for (const group of items.group(i => i.sym(grammar))) {

                            const gen = yieldStates(group, options, lex_name, offset);

                            let val = gen.next(), i = 0;

                            while (!val.done) {
                                yield <RecognizerState[]>val.value;
                                val = gen.next();
                            }
                            states.push(<RecognizerState>{
                                symbol: null,
                                code: val.value.code,
                                prods: val.value.prods,
                                hash: val.value.hash,
                                completing: false,
                                items,
                                offset,
                                peek_level: a.peek_level,
                                transition_type: TRANSITION_TYPE.ASSERT,
                            });
                        }
                        yield states;
                        code = states[0].code;
                        prods = states[0].prods;
                        a.offset = offset + 1;
                    }
                }

                if (gen) {
                    let val = gen.next();
                    while (!val.done) {
                        const obj = <RecognizerState[]>val.value;
                        yield obj;
                        val = gen.next();
                    }
                    ({ code, prods, hash } = val.value);
                }

                a.prods = prods.setFilter();
                a.code = code;
                a.hash = hash;

            } else {

                const sym = items[0].sym(grammar);
                if (a.peek_level == 0) {
                    a.transition_type = isSymAProduction(sym)
                        ? TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS
                        : TRANSITION_TYPE.CONSUME;

                    if (!isSymAProduction(sym))
                        a.transition_type = TRANSITION_TYPE.CONSUME;

                } else {
                    if (isSymAProduction(sym)) {
                        a.transition_type = TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS;
                    }
                }
                a.completing = true;
                a.offset = offset;
            }
        }
    }
}