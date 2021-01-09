import { Item, getTransitionTree } from "../util/common.js";
import { SC, VarSC } from "./utilities/skribble.js";
import { RenderBodyOptions } from "./types/RenderBodyOptions";
import { buildPeekSequence } from "./build_peek_sequence.js";
import {
    doItemsHaveSameSymbol,
    cleanLeaves
} from "./hybrid_function_constructor.js";
import { EOF_SYM } from "../types/grammar.js";
import { createClosureSequence } from "./create_closure_sequence.js";
import { getClosure } from "../util/process_closure.js";
import { NewType } from "./types/RecognizerState.js";

export function* createMultiItemSequence(
    items: Item[],
    options: RenderBodyOptions,
    lex_name: VarSC,
    offset: number = 0,
    RD_SECTION_START: boolean = false
): Generator<NewType[], SC> {

    const { grammar, runner, production, lr_productions } = options;

    let act_items = items;

    const
        SAME_PRODUCTION = act_items.setFilter(i => i.getProduction(grammar).id).length == 1,
        SAME_SYMBOL = doItemsHaveSameSymbol(act_items, grammar),
        max_item_offset = act_items.reduce((r, i) => Math.max(i.offset, r), 0),
        first_production = act_items[0].getProduction(grammar),
        ROOT_PRODUCTION = SAME_PRODUCTION && first_production.id == production.id;

    /**
    * If all items are from the same production and the current production function is NOT processing
    * that production, simply do a call to that production function.
    *
    * This should only occur if all items are at the initial shift state or peek was used
    * to get to this offset.
    */
    if (act_items.length == 1) {
        const obj = <NewType[]>[{
            code: new SC,
            hash: "not-defined-single-item",
            state: { items: act_items, leaf: true, peeking: false, level: offset, sym: EOF_SYM }
        }];
        yield obj;
        return obj[0].code;
    } if (SAME_PRODUCTION && !ROOT_PRODUCTION && (max_item_offset == 0)) {
        const first = act_items[0];
        act_items = [new Item(first.body, first.len, 0, first.follow)];

        const obj = <NewType[]>[{
            code: new SC,
            hash: "not-defined-production-call",
            state: { items: act_items, leaf: true, peeking: false, level: offset, sym: EOF_SYM }
        }];
        yield obj;
        return obj[0].code;

    } else if (SAME_SYMBOL && (offset > 0 || ROOT_PRODUCTION || SAME_PRODUCTION)) {
        const sequence: NewType[] = [];

        while (act_items.every(i => !i.atEND && i.sym(grammar).val == act_items[0].sym(grammar).val)) {

            const sym = act_items[0].sym(grammar);

            sequence.push({
                code: new SC,
                hash: "not-defined-same-symbol-chain",
                state: { items: act_items, leaf: false, peeking: false, level: offset++, sym }
            });

            act_items = act_items.map(i => i.increment());
        }

        try {
            let code = null;
            if (act_items.length > 0) {
                if (act_items.length == 1) {
                    const obj = <NewType>{
                        code: new SC,
                        hash: "not-defined-same-symbol",
                        state: { items, leaf: true, peeking: false, level: offset, sym: EOF_SYM }
                    };
                    yield [obj];
                    code = obj.code;
                    obj.hash = code.hash();

                } else {
                    const gen = createMultiItemSequence(act_items, options, lex_name, offset);
                    let val = gen.next();
                    while (!val.done) {
                        yield <NewType[]>val.value;
                        val = gen.next();
                    }
                    code = val.value;
                }

                for (const state of sequence.reverse()) {
                    state.code = code;
                    state.hash = code.hash();
                    yield [state];
                    code = state.code;
                }

                return code;
            }
        } catch (e) {
            return SC.Comment(e.stack);
        }
    } else {
        const
            { tree_nodes } = getTransitionTree(grammar, act_items, lr_productions);

        const
            gen = buildPeekSequence(tree_nodes[0].next, grammar, runner, lex_name, production.id, false);

        let val = gen.next();

        while (!val.done) {
            const group: NewType[] = <NewType[]>val.value;

            group.forEach(g => g.state.level += offset);
            //create sequences here

            //decide how the group should be combined
            const groups = group.group(g => { return g.state.items.map(i => i.id).sort() + "-" + g.state.leaf; });

            for (const a of group) {
                const g = [a];
                const IS_LEAF = g.some(g => g.state.leaf);
                const items = g[0].state.items;
                if (IS_LEAF) {

                    //Set leaf state to false as this will be replaced
                    //with the resolution states. 
                    g.forEach(g => g.state.leaf = false);

                    //decide what to do with the sub elements
                    let code = new SC;
                    const [first] = items;
                    const max_item_offset = items.reduce((r, i) => Math.max(i.offset, r), 0);
                    const SAME_PRODUCTION = items.setFilter(i => i.getProduction(grammar).id).length == 1;
                    const prod = first.getProduction(grammar);
                    let gen: Generator<NewType[], SC> = null;

                    if (offset == 0 && SAME_PRODUCTION && RD_SECTION_START && prod.id !== prod.id) {
                        // if_stmt.addStatement(SC.Comment("A"));
                        // filter_productions.push((first.getProduction(grammar).id != production.id) ? items[0].getProduction(grammar).id : -1);
                        // renderProduction(if_stmt, prod, productions, lex_name, false);
                    } else if (items.length > 1) {

                        const SAME_SYMBOL = doItemsHaveSameSymbol(items, grammar);

                        if (SAME_SYMBOL) {
                            gen = createMultiItemSequence(items.map(i => i.increment()), options, lex_name, offset + 1);
                        } else {

                            if (items.every(i => i.atEND)) {
                                code = SC.Comment(items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n"));
                            } else if (max_item_offset == 0) {
                                gen = createClosureSequence(getClosure(items, grammar), options, lex_name, offset + 1);

                            } else {
                                const tree = getTransitionTree(grammar, items, lr_productions, 10, 8);
                                if (cleanLeaves(tree.tree_nodes[0])) {
                                    gen = createMultiItemSequence(items.map(i => i.increment()), options, lex_name, offset + 1);
                                } else {
                                    const obj = <NewType[]>[{
                                        code: new SC,
                                        hash: "not-defined-collision",
                                        state: { items, leaf: true, peeking: false, level: offset + 1, sym: EOF_SYM }
                                    }];
                                    yield obj;
                                    code = obj[0].code;
                                    obj[0].hash = code.hash();
                                }
                            }
                        }

                    } else {
                        /**
                         * If the item is at the start of the offset, then we can simply call into the items production
                         * to reduce the amount of processing done in the calling function
                         */
                        const obj = <NewType[]>[{
                            code: new SC,
                            hash: "not-defined-single-item",
                            state: { items, leaf: true, peeking: false, level: offset + 1, sym: EOF_SYM }
                        }];
                        yield obj;
                        code = obj[0].code;
                        obj[0].hash = code.hash();
                    }//*/

                    if (gen) {
                        let val = gen.next();
                        while (!val.done) {
                            yield <NewType[]>val.value;
                            val = gen.next();
                        }
                        code = val.value;
                    }
                    const hash = code.hash();
                    g.forEach(
                        g => {
                            g.code = code;
                            g.hash = hash;
                        }
                    );
                }
            }
            yield group;
            val = gen.next();
        }

        return val.value;
    }
}
