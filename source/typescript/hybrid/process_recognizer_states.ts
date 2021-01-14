import {
    addSkipCallNew,
    consume_assert_call,
    getIncludeBooleans,
    getSkippableSymbolsFromItems,
    getUniqueSymbolName,
    g_lexer_name,
    isSymAProduction,
    isSymGeneratedId,
    isSymGeneratedNum,
    isSymGeneratedSym,
    itemsToProductions
} from "./utilities/utilities.js";
import { AS, ExprSC, SC } from "./utilities/skribble.js";
import { RenderBodyOptions } from "./types/RenderBodyOptions";
import { processProductionChain } from "./process_production_chain.js";
import { renderItem, renderProductionCall } from "./item_render_functions.js";
import { Item } from "../util/item.js";
import { Symbol, TokenSymbol } from "../types/Symbol.js";
import { RecognizerState, TRANSITION_TYPE } from "./types/RecognizerState.js";


// Translate Transition Type
function ttt(type: TRANSITION_TYPE): string {
    switch (type) {
        case TRANSITION_TYPE.ASSERT: return "assert";
        case TRANSITION_TYPE.IGNORE: return "ignore";
        case TRANSITION_TYPE.CONSUME: return "consume";
        case TRANSITION_TYPE.PEEK: return "peek";
        case TRANSITION_TYPE.ASSERT_END: return "assert-end";
        case TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS: return "assert-production-closure";
        case TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS: return "peek-production-closure";
        default: return "unknown";
    }
}

export type SelectionGroup = {
    syms: Symbol[],
    code: SC,
    items: Item[];
    hash: string;
    FIRST: boolean,
    LAST: boolean;
    prods: number[];
    transition_types: TRANSITION_TYPE[];
};
export type SelectionClauseGenerator = Generator<SelectionGroup>;
function* traverseInteriorNodes(
    group: RecognizerState[],
    options: RenderBodyOptions,
    grouping_fn: (node: RecognizerState, level: number, peeking: boolean) => string
): SelectionClauseGenerator {
    const groups = group.group(g => grouping_fn(g, g.peek_level, g.peek_level >= 0));

    const sel_group: SelectionGroup[] = groups.map((group) => {
        const syms = group.map(s => s.symbol);
        const code = group[0].code;
        const hash = group[0].hash;
        const items = group.flatMap(g => g.items).setFilter(i => i.id);
        const yielders = group.map(i => i.transition_type).setFilter();
        return { transition_types: yielders, syms, code, items, hash, LAST: false, FIRST: false, prods: group.flatMap(g => (g.prods)).setFilter() };
    });
    let i = 0;
    for (const group of sel_group.sort((a, b) => {
        //return 0;
        return getGroupScore(a) - getGroupScore(b);
    })) {
        group.FIRST = i++ == 0;
        group.LAST = i == groups.length;
        yield group;
    }
}

export type MultiItemReturnObject = {
    root: SC;
    leaves: SC[];
    prods: number[];
};

export function defaultMultiItemLeaf(items: Item[], state: RecognizerState, options: RenderBodyOptions): MultiItemReturnObject {
    const { grammar } = options;
    const root = new SC;
    const prods: number[] = [];

    root.addStatement(
        SC.Declare(
            SC.Assignment("mk:int", SC.Call("mark")),
            SC.Assignment("anchor:Lexer", SC.Call(SC.Member(g_lexer_name, "copy")))
        )
    );
    //*

    root.addStatement(
        items.reduce((r, item, i, a) => {

            let code = new SC;

            let leaf = renderItem(code, item, options, false);
            const new_prods = processProductionChain(leaf, options, itemsToProductions([item], grammar));

            if (!r.root) {
                r.root = (new SC).addStatement(code);
                r.leaf = r.root;
                r.prods = new_prods;
            } else {
                const reset = SC.If(SC.Call(
                    "reset:bool",
                    "mk",
                    "anchor:Lexer",
                    g_lexer_name,
                    r.prods.reduce((r, n) => {
                        if (!r) return SC.Binary("prod", "==", n);
                        return SC.Binary(r, "||", SC.Binary("prod", "==", n));
                    }, null)
                )).addStatement(code);
                r.leaf.addStatement(reset, SC.Empty());
                r.leaf = reset;
                r.prods = new_prods;
            }

            return r;
        }, { root: null, leaf: null, prods: [] }).root
    );
    //*/
    return { root, leaves: [], prods: prods.setFilter() };
}

export type SingleItemReturnObject = {
    root: SC;
    leaf: SC;
    prods: number[];
};

export function defaultSingleItemLeaf(item: Item, state: RecognizerState, options: RenderBodyOptions): SingleItemReturnObject {
    const { grammar, runner, leaf_productions, production } = options;
    const code = state.code || new SC;

    let sc = code, prods = [];

    if (item) {
        if (item.len > 0 && item.offset == 0 && (item.getProduction(grammar).id != production.id || state.offset > 0)) {
            const bool = renderProductionCall(item.getProduction(grammar), options, g_lexer_name);
            sc = SC.If(bool);
            // Unnecessary comment
            //sc.addStatement(SC.Comment(item.renderUnformattedWithProduction(grammar)));
            //
            code.addStatement(sc);
            prods = processProductionChain(sc, options, itemsToProductions([item], grammar));
        } else {
            sc = renderItem(code, item, options, state.offset > 0 || state.peek_level >= 0);
            prods = processProductionChain(sc, options, itemsToProductions([item], grammar));
        }
        for (const prod of prods)
            leaf_productions.add(prod);
    }

    return { root: code, leaf: sc, prods };
}

export function defaultGrouping(g) {
    return g.hash;
}
function getGroupScore(a: SelectionGroup) {
    const tt = a.transition_types[0];
    let transition_penalty = 1;

    switch (tt) {
        case TRANSITION_TYPE.ASSERT_END:
            transition_penalty = 10000;
            break;
    }

    const a_end = transition_penalty;
    const a_syms = a.syms.length * (a_end);
    const a_id = (+a.syms.some(isSymGeneratedId)) * (a_end);;
    const a_num = (+a.syms.some(isSymGeneratedNum)) * 50000 * (a_end);
    const a_sym = (+a.syms.some(isSymGeneratedSym)) * 5000 * (a_end);

    return a_syms + a_id + a_num + a_sym + a_end;
}


export function defaultSelectionClause(
    gen: SelectionClauseGenerator,
    state: RecognizerState,
    items: Item[],
    level: number,
    options: RenderBodyOptions,
    FORCE_ASSERTIONS: boolean = false
): SC {
    const
        { grammar, runner } = options,
        groups = [...gen],
        all_syms = groups.flatMap(({ syms }) => syms).setFilter(getUniqueSymbolName);

    if (
        groups.length == 1
        && !FORCE_ASSERTIONS
        && (groups[0].transition_types.includes(TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS))
    ) return groups[0].code;

    let root = new SC, leaf = null, mid = root, lex_name = g_lexer_name;

    const skippable = getSkippableSymbolsFromItems(items, grammar).filter(i => !all_syms.some(j => getUniqueSymbolName(i) == getUniqueSymbolName(j)));

    let peek_name = g_lexer_name;

    if (state.peek_level >= 0) {
        if (state.peek_level == 1) {
            peek_name = SC.Variable("pk:Lexer");
            root.addStatement(SC.Declare(SC.Assignment(peek_name, SC.Call(SC.Member(lex_name, "copy")))));
        }

        if (state.offset > 0 && state.peek_level == 0) {
            root.addStatement(addSkipCallNew(skippable, grammar, runner, lex_name));
        } else if (state.peek_level >= 1) {
            peek_name = SC.Variable("pk:Lexer");
            root.addStatement(addSkipCallNew(skippable, grammar, runner, SC.Call(SC.Member(peek_name, "next"))));
        }
    } else if (state.offset > 0) {
        //Consume
        root.addStatement(addSkipCallNew(skippable, grammar, runner));
    }

    for (const { syms, items, code, LAST, FIRST, transition_types } of groups) {

        let gate_block: SC = SC.Empty(), ADD_SKIP_STATEMENT = false;

        const transition_type: TRANSITION_TYPE = transition_types[0];

        switch (transition_type) {
            case TRANSITION_TYPE.ASSERT:
            case TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS:
            case TRANSITION_TYPE.ASSERT_END:
                gate_block = (isSymAProduction(syms[0]))
                    ? renderProductionCall(grammar[syms[0].val], options)
                    : getIncludeBooleans(<TokenSymbol[]>syms, grammar, runner, lex_name);
                break;
            case TRANSITION_TYPE.CONSUME:
                gate_block = (isSymAProduction(syms[0]))
                    ? SC.Call(consume_assert_call, g_lexer_name, renderProductionCall(grammar[syms[0].val], options))
                    : SC.Call(consume_assert_call, g_lexer_name, getIncludeBooleans(<TokenSymbol[]>syms, grammar, runner, lex_name));
                ADD_SKIP_STATEMENT = true;
                break;
            case TRANSITION_TYPE.IGNORE:
                gate_block = SC.Empty();
                break;
            case TRANSITION_TYPE.PEEK:
            case TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS:
                gate_block = (isSymAProduction(syms[0]))
                    ? renderProductionCall(grammar[syms[0].val], options, peek_name)
                    : getIncludeBooleans(<TokenSymbol[]>syms, grammar, runner, peek_name);
                break;
        }

        let if_stmt = SC.If(<ExprSC>gate_block);

        const SKIP_BOOL_EXPRESSION = (LAST && !FIRST)
            && (
                transition_type == TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS
                || transition_type == TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS
                //|| transition_type == TRANSITION_TYPE.PEEK
                || transition_type == TRANSITION_TYPE.ASSERT_END
            ),

            PEEKING_TRANSITION = transition_type == TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS
                || transition_type == TRANSITION_TYPE.PEEK;


        if (SKIP_BOOL_EXPRESSION) if_stmt = SC.If();

        let skip;
        if (ADD_SKIP_STATEMENT) {
            const skippable = getSkippableSymbolsFromItems(items, grammar).filter(i => !all_syms.some(j => getUniqueSymbolName(i) == getUniqueSymbolName(j)));
            skip = addSkipCallNew(skippable, grammar, runner, g_lexer_name);
        }

        if_stmt.addStatement(
            runner.ANNOTATED ?
                SC.Comment(transition_types.map(ttt)) : undefined,
            runner.ANNOTATED ?
                SC.Comment("\n   " + items.map(i => ((i.atEND || PEEKING_TRANSITION) ? i : i.increment()).renderUnformattedWithProduction(grammar)).join("\n   ") + "\n")
                : undefined,
            skip,
            code,
            SC.Empty()
        );

        if (leaf) {
            leaf.addStatement(if_stmt);
        } else {
            mid.addStatement(if_stmt);
        }
        leaf = if_stmt;
    }
    root.addStatement(SC.Empty());
    mid.addStatement(SC.Empty());
    if (leaf) leaf.addStatement(SC.Empty());
    return root;
}


export function processRecognizerStates(
    options: RenderBodyOptions,
    gen: Generator<RecognizerState[], { code: SC, prods: number[]; }>,
    selection_clause_fn:
        (gen: SelectionClauseGenerator, state: RecognizerState, items: Item[], level: number, options: RenderBodyOptions) => SC =
        defaultSelectionClause,
    multi_item_leaf_fn:
        (items: Item[], groups: RecognizerState, options: RenderBodyOptions) => MultiItemReturnObject =
        defaultMultiItemLeaf,
    single_item_leaf_fn:
        (item: Item, group: RecognizerState, options: RenderBodyOptions) => SingleItemReturnObject =
        defaultSingleItemLeaf,
    grouping_fn: (node: RecognizerState, level: number, peeking: boolean) => string = defaultGrouping
): SC {
    let val = gen.next();

    while (!val.done) {

        const group: RecognizerState[] = <RecognizerState[]>val.value;

        if (group.length > 0) {

            if (group.some(i => !i)) throw new Error("UNDEFINED");

            for (const member of group) {
                if (member.completing) {
                    if (member.items.length == 1) {
                        const { root, prods } = single_item_leaf_fn(member.items[0], member, options);
                        member.code = root;
                        member.hash = root.hash();
                        member.prods = prods;
                    } else {
                        const { root, prods } = multi_item_leaf_fn(member.items, member, options);
                        member.code = root;
                        member.hash = root.hash();
                        member.prods = prods;
                    }
                }
            }

            group.map(g => g.prods = g.prods || []);

            const
                prods = group.flatMap(g => g.prods).setFilter(),
                items = group.flatMap(g => g.items).setFilter(i => i.id),
                virtual_group: RecognizerState = {
                    symbol: null,
                    code: group[0].code,
                    hash: group[0].hash,
                    prods,
                    items,
                    completing: false,
                    peek_level: group[0].peek_level,
                    offset: group[0].offset,
                    transition_type: group[0].transition_type,
                },
                root = selection_clause_fn(
                    traverseInteriorNodes(group, options, grouping_fn),
                    virtual_group,
                    items,
                    group[0].peek_level,
                    options
                );

            group.forEach(g => {
                g.prods = prods;
                g.code = root;
                g.hash = root.hash();
            });

        }

        val = gen.next();
    }

    return val.value.code;
}