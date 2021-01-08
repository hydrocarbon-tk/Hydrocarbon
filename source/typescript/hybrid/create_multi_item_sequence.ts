import { TokenSymbol } from "../types/Symbol";
import { Item, getTransitionTree } from "../util/common.js";
import {
    getIncludeBooleans,
    isSymAProduction
} from "./utilities/utilities.js";
import { SC, VarSC } from "./utilities/skribble.js";
import { getClosure } from "../util/process_closure.js";
import { RenderBodyOptions } from "./types/RenderBodyOptions";
import { addEndItemSequence } from "./add_end_item_sequence.js";
import { buildPeekSequence } from "./build_peek_sequence.js";
import { addItemListComment } from "./add_item_list_comment.js";
import {
    createSkipCallFromItems,
    doItemsHaveSameSymbol,
    createSingleItemSequence,
    renderItemSym,
    renderProduction,
    createClosureSequence,
    cleanLeaves,
    createBacktrackingSequence,
    renderItem
} from "./hybrid_function_constructor.js";

export function* createMultiItemSequence(
    items: Item[],
    code_node: SC,
    options: RenderBodyOptions,
    lex_name: VarSC,
    offset: number = 0,
    RD_SECTION_START: boolean = false,
    ALLOW_FALL_THROUGH: boolean = true,
    LR_SECTION_START = false): Generator<{ prods: number[]; _if: SC; filter_productions: number[]; }, SC> {

    const {
        grammar,
        runner,
        production,
        productions,
        lr_productions
    } = options;

    if (runner.ANNOTATED)
        addItemListComment(code_node, items, grammar, "MULTI-ITEM initial:" + RD_SECTION_START);
    let
        filter_productions = [],
        root_if_statement: SC = null,
        last_if_statement: SC = code_node;

    const end_items = items.filter(i => i.atEND);
    let act_items = items.filter(i => !i.atEND);


    if (!RD_SECTION_START && !LR_SECTION_START)
        code_node.addStatement(createSkipCallFromItems(act_items, grammar, runner, lex_name));

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
    if (SAME_PRODUCTION && !ROOT_PRODUCTION && (max_item_offset == 0)) {

        const first = act_items[0];


        act_items = [new Item(first.body, first.len, 0, first.follow)];

        if (end_items.length > 0) {
            const closure_syms = getClosure(act_items, grammar).filter(i => !i.atEND && !isSymAProduction(i.sym(grammar))).map(i => <TokenSymbol>i.sym(grammar));
            const expr = getIncludeBooleans(closure_syms, grammar, runner, lex_name, []);
            const _if = SC.If(expr);
            code_node.addStatement(_if);
            code_node = _if;
        }

        const gen = createSingleItemSequence(act_items, code_node, options, lex_name);
        //@ts-ignore
        yield gen.next().value;

        //@ts-ignore
        root_if_statement = last_if_statement = gen.next().value;

    } else if (SAME_SYMBOL && (offset > 0 || ROOT_PRODUCTION || SAME_PRODUCTION)) {

        let NO_CHECK = !RD_SECTION_START && !LR_SECTION_START || false, FIRST = true;

        if (end_items.length > 0) {
            const closure = getClosure(act_items, grammar).filter(i => !i.atEND && !isSymAProduction(i.sym(grammar)));
            const closure_syms = closure.map(i => <TokenSymbol>i.sym(grammar));
            const expr = getIncludeBooleans(closure_syms, grammar, runner, lex_name, []);
            const _if = SC.If(expr);

            code_node.addStatement(_if);
            code_node = _if;
            root_if_statement = _if;
        }

        while (act_items.every(i => !i.atEND && i.sym(grammar).val == act_items[0].sym(grammar).val)) {

            if (!FIRST)
                code_node.addStatement(createSkipCallFromItems(act_items, grammar, runner, lex_name));

            code_node = renderItemSym(code_node, act_items[0], grammar, runner, productions, NO_CHECK, lex_name).code_node;

            if (!root_if_statement)
                root_if_statement = code_node;

            act_items = act_items.map(i => i.increment());
            FIRST = false;
            NO_CHECK = false;
        }

        try {
            if (act_items.length > 0) {
                if (act_items.length == 1)
                    yield* createSingleItemSequence(act_items, code_node, options, lex_name);

                else
                    yield* createMultiItemSequence(act_items, code_node, options, lex_name, offset);
            }
        } catch (e) {
            code_node.addStatement(SC.Comment(e.stack), SC.Empty());
            yield { _if: code_node, filter_productions, prods: [] };
        }
    } else {

        const
            { tree_nodes } = getTransitionTree(grammar, act_items, lr_productions),
            gen = buildPeekSequence(tree_nodes[0].next, grammar, runner, lex_name, production.id, ALLOW_FALL_THROUGH && end_items.length < 1);

        let val = gen.next(), block_count = 0;

        while (!val.done) {

            block_count++;

            //@ts-ignore
            const { _if: __if, items, closure, depth, starts } = val.value, [first] = items,

                max_item_offset = act_items.reduce((r, i) => Math.max(i.offset, r), 0),
                SAME_PRODUCTION = items.setFilter(i => i.getProduction(grammar).id).length == 1;


            addItemListComment(__if, items, grammar, `ACTUAL_ITEMS offset:${items.length} SAME_PRODUCTION:${SAME_PRODUCTION}`);

            const prod = first.getProduction(grammar);

            if (offset == 0 && SAME_PRODUCTION && RD_SECTION_START && prod.id !== prod.id) {
                __if.addStatement(SC.Comment("A"));
                filter_productions.push((first.getProduction(grammar).id != production.id) ? items[0].getProduction(grammar).id : -1);
                renderProduction(__if, prod, productions, lex_name, false);
            } else if (items.length > 1) {
                const SAME_SYMBOL = doItemsHaveSameSymbol(items, grammar);

                if (SAME_SYMBOL) {
                    __if.addStatement(SC.Comment("B"));
                    yield* createMultiItemSequence(items, __if, options, lex_name, offset);
                } else {

                    if (max_item_offset == 0) {
                        __if.addStatement(SC.Comment("C"));
                        yield* createClosureSequence(starts, __if, options, lex_name, offset);
                    } else {
                        const tree = getTransitionTree(grammar, items, lr_productions, 10, 8);
                        if (cleanLeaves(tree.tree_nodes[0])) {
                            __if.addStatement(SC.Comment("D"));
                            yield* createMultiItemSequence(items, __if, options, lex_name, offset);
                        } else {
                            __if.addStatement(SC.Comment("E"));
                            yield* createBacktrackingSequence(items, __if, options, lex_name);
                        }
                    }

                }
            } else {
                //__if.addStatement(SC.Comment("F"));
                const prod_id = prod.id;
                filter_productions.push((prod_id != production.id) ? prod_id : -1);
                /**
                 * If the item is at the start of the offset, then we can simply call into the items production
                 * to reduce the amount of processing done in the calling function
                 */
                const _if = renderItem(__if, first, grammar, runner, productions, depth < 1, lex_name);
                yield { _if, filter_productions, prods: [prod_id] };
            }

            val = gen.next();
        }

        if (block_count > 1 || LR_SECTION_START) {
            const __if = val.value.leaf;
            code_node.addStatement(val.value._if);
            code_node.addStatement(SC.Empty());
            code_node = last_if_statement = __if;
        } else {
            code_node.addStatement(...val.value._if.statements);
            const __if = val.value.leaf;
            last_if_statement = code_node = __if;
        }

        code_node.addStatement(SC.Empty());

        root_if_statement = last_if_statement = val.value.leaf;
    }


    last_if_statement.addStatement(SC.Empty());
    //*
    if (end_items.length > 0) {

        // Any items at end can be checked by seeing if follow items are present
        const end_gen = addEndItemSequence(end_items, options, true);
        let end_val = null;
        while (!(end_val = end_gen.next()).done) {
            yield end_val.value;
        }

        root_if_statement.addStatement(end_val.value);
    }
    //*/
    return root_if_statement;
}
