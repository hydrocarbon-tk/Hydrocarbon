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
): Generator<RecognizerState[], SC> {
    const
        { grammar, runner, production, lr_productions } = options;
    let
        end_items = in_items.filter(i => i.atEND),
        active_items = in_items.filter(i => !i.atEND);

    const main_groups: RecognizerState[] = [];


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
                const closure = getClosure(active_items.slice(), grammar),
                    anticipated_syms = [...closure.filter(i => !i.atEND && !isSymAProduction(i.sym(grammar))).map(i => <TokenSymbol>i.sym(grammar))];

                if (anticipated_syms.length > 0) {

                    main_groups.length = 0;

                    const transition_type: TRANSITION_TYPE =
                        isSymAProduction(active_items[0].sym(grammar))
                            ? TRANSITION_TYPE.ASSERT
                            : TRANSITION_TYPE.CONSUME;

                    if (anticipated_syms.length == 1) {
                        active_items = active_items.map(a => a.increment());
                    }

                    const objs = anticipated_syms.map(sym => (<RecognizerState>{
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

                // Call the root production 

                const first = active_items[0];
                const items = [new Item(first.body, first.len, 0, first.follow)];
                const obj: RecognizerState = {
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
                        items: active_items,
                        completing: false,
                        offset: offset++,
                        peek_level: -1,
                        symbol: sym
                    });

                    active_items = active_items.map(i => i.increment());
                }
                let code = new SC, prods;
                if (active_items.length > 0) {
                    if (active_items.length == 1) {
                        const leaf = sequence.slice().reverse()[0];
                        leaf.completing = true;
                    } else {
                        const gen = yieldStates(active_items, options, lex_name, offset);
                        let val = gen.next();
                        while (!val.done) {
                            yield <RecognizerState[]>val.value;
                            prods = val.value[0].prods;
                            code = val.value[0].code;
                            val = gen.next();
                        }
                    }

                    for (const state of sequence.slice().reverse().slice(0, -1)) {
                        state.code = code;
                        state.hash = code.hash();
                        state.prods = prods;
                        yield [state];
                        code = state.code;
                    }

                    sequence[0].code = code;
                    sequence[0].hash = code.hash();
                    sequence[0].prods = prods;

                    main_groups.push(sequence[0]);
                }

            } else {
                const
                    { tree_nodes } = getTransitionTree(
                        grammar,
                        active_items,
                        lr_productions
                    ),
                    gen = buildPeekSequence(tree_nodes[0].next, grammar, runner, lex_name, production.id, false);

                let val = gen.next();

                const state_look_up: Map<string, { code: SC, hash: string, prods: number[]; }> = new Map;

                while (!val.done) {
                    const group: RecognizerState[] = <RecognizerState[]>val.value;
                    group.forEach(g => g.offset = offset);
                    //create sequences here
                    yield* processRecognizerState(group, options, state_look_up, offset, lex_name);
                    yield group;
                    val = gen.next();
                }

                yield* processRecognizerState(val.value, options, state_look_up, offset, lex_name);

                main_groups.push(...val.value);
            }
        }

        const gen = yieldCompletedItemStates(end_items, options, offset);

        let val;

        while (!(val = gen.next()).done) {
            yield val.value;
        }

        main_groups.push(...val.value);

        yield main_groups;

        return main_groups[0].code;

    } catch (e) {
        return SC.Comment(e.stack);
    }
}

function* processRecognizerState(
    group: RecognizerState[],
    options: RenderBodyOptions,
    state_look_up: Map<string, { code: SC, hash: string, prods: number[]; }>,
    offset: number = 0,
    lex_name: VarSC,
): Generator<RecognizerState[]> {
    const { grammar, lr_productions, production } = options;

    for (const a of group.filter(a => a.completing)) {

        //Set leaf state to false as this will be replaced
        //with resolution states. 
        a.completing = false;

        const
            closure = a.closure,
            items = a.items,
            syms = a.symbol,
            [first] = a.items,
            max_item_offset = a.items.reduce((r, i) => Math.max(i.offset, r), 0),
            SAME_PRODUCTION = a.items.setFilter(i => i.getProduction(grammar).id).length == 1,
            prod = first.getProduction(grammar);

        let
            code = new SC,
            prods = [],
            gen: Generator<RecognizerState[], SC> = null;
        /**
         * Reduce redundant RecognizerState's by creating a hash from the states  items and follow symbols 
         * and using that to cache code, hash, and prods that would otherwise be repeatedly generated.
         */
        const state_hash = items.map(i => i.id).sort().join("") + closure.map(i => i).filter(i => !i.atEND).map(i => i.sym(grammar).val).setFilter().sort().join();

        if (state_look_up.has(state_hash)) {
            const { prods, code, hash } = state_look_up.get(state_hash);
            a.prods = prods;
            a.code = code;
            a.hash = hash;
            continue;
        }

        if (items.length > 0) {
            const SAME_SYMBOL = doItemsHaveSameSymbol(items, grammar);

            if (offset == 0 && SAME_PRODUCTION && prod.id !== production.id) {
                throw new Error("SAME_PRODUCTION HELP!");
            } else if (items.length > 1) {

                if (SAME_SYMBOL) {
                    gen = yieldStates(items.map(i => i), options, lex_name, offset + 1);
                } else if (max_item_offset == 0) {
                    if (closure.every(i => i.offset == 0) && closure.map(i => i.getProduction(grammar).id).setFilter().length == 1) {
                        a.items = a.closure.slice(0, 1);
                        a.completing = true;
                        a.offset = offset;
                    } else {
                        gen = yieldStates(getClosure(closure, grammar).map(i => i), options, lex_name, offset + 1);
                    }
                } else {

                    const tree = getTransitionTree(grammar, items, lr_productions, 10, 8);
                    if (cleanLeaves(tree.tree_nodes[0])) {
                        gen = yieldStates(items, options, lex_name, offset + 1);
                    } else {
                        a.completing = true;
                        a.offset = offset + 1;
                    }
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
            } else {
                a.completing = true;
                a.offset = offset;
            }
        }
    }
}