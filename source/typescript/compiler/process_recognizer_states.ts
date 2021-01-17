import {
    addSkipCallNew,
    getIncludeBooleans,
    getSkippableSymbolsFromItems,
    getUniqueSymbolName,
    rec_glob_lex_name,
    isSymAProduction,
    isSymGeneratedId,
    isSymGeneratedNum,
    isSymGeneratedSym,
    itemsToProductions,
    createAssertionShiftManual,
    rec_state_prod,
    rec_state
} from "../util/utilities.js";
import { AS, ExprSC, SC } from "../util/skribble.js";
import { RenderBodyOptions } from "../types/render_body_options";
import { processProductionChain } from "./process_production_chain.js";
import { renderItem, renderProductionCall } from "./item_render_functions.js";
import { Item } from "../util/item.js";
import { Symbol, TokenSymbol } from "../types/symbol.js";
import { RecognizerState, TRANSITION_TYPE } from "../types/recognizer_state.js";


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

        const
            syms = group.map(s => s.symbol),
            code = group[0].code,
            hash = group[0].hash,
            items = group.flatMap(g => g.items).setFilter(i => i.id),
            yielders = group.map(i => i.transition_type).setFilter();

        return { transition_types: yielders, syms, code, items, hash, LAST: false, FIRST: false, prods: group.flatMap(g => g.prods).setFilter() };
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


export function defaultMultiItemLeaf(state: RecognizerState, states: RecognizerState[], options: RenderBodyOptions): MultiItemReturnObject {
    const
        { production } = options,
        root = (new SC).addStatement(
            SC.Declare(
                SC.Assignment("mk:int", SC.Call("mark")),
                SC.Assignment("anchor:Lexer", SC.Call(SC.Member(rec_glob_lex_name, "copy")))
            )
        ),
        IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS
            = states.some(i => i.transition_type == TRANSITION_TYPE.IGNORE),
        out_prods: number[] = [];

    let leaf = root, FIRST = true, prev_prods = [];

    for (const { code, items, prods } of states.filter(i => i.transition_type !== TRANSITION_TYPE.IGNORE)
    ) {

        out_prods.push(...prods);

        leaf.addStatement(SC.Comment(items));

        if (FIRST) {
            leaf.addStatement(
                SC.Comment(prods),
                code
            );
        } else {

            const reset = SC.If(SC.Call(
                "reset:bool",
                "mk",
                "anchor:Lexer",
                rec_glob_lex_name,
                rec_state,
                prev_prods.reduce((r, n) => {
                    if (!r) return SC.Binary(rec_state_prod, "==", n);
                    return SC.Binary(r, "||", SC.Binary(rec_state_prod, "==", n));
                }, null)
            )).addStatement(SC.Assignment(rec_state_prod, IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS ? production.id : "-1"), code);
            leaf.addStatement(reset, SC.Empty());
            leaf = reset;

        }
        prev_prods = prods;

        FIRST = false;
    }

    if (IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS) {
        //ADD a fall back 
        const reset = SC.If(SC.Call(
            "reset:bool",
            "mk",
            "anchor:Lexer",
            rec_glob_lex_name,
            rec_state,
            prev_prods.reduce((r, n) => {
                if (!r) return SC.Binary(rec_state_prod, "==", n);
                return SC.Binary(r, "||", SC.Binary(rec_state_prod, "==", n));
            }, null)
        )).addStatement(SC.Assignment(rec_state_prod, production.id));
        leaf.addStatement(reset, SC.Empty());
        leaf = reset;
    }


    //*/
    return { root, leaves: [], prods: out_prods.setFilter() };
}

export type SingleItemReturnObject = {
    root: SC;
    leaf: SC;
    prods: number[];
};

export function defaultSingleItemLeaf(item: Item, state: RecognizerState, options: RenderBodyOptions): SingleItemReturnObject {

    const
        { grammar, runner, leaf_productions, production, extended_production_shift_items } = options,
        code = state.code || new SC,
        SHOULD_IGNORE = extended_production_shift_items.some(i => i.body == item.body);

    let sc = code, prods = [];

    if (SHOULD_IGNORE) {
        sc.addStatement(SC.Comment("SHOULD IGNORE"));
        state.transition_type = TRANSITION_TYPE.IGNORE;
        return { root: sc, leaf: sc, prods: [] };
    }

    if (state.transition_type == TRANSITION_TYPE.CONSUME && !item.atEND)
        item = item.increment();

    if (item) {
        if (item.len > 0 && item.offset == 0 && (item.getProduction(grammar).id != production.id || state.offset > 0)) {

            const bool = renderProductionCall(item.getProduction(grammar), options, rec_glob_lex_name);
            sc = SC.If(bool);
            code.addStatement(sc);
            prods = processProductionChain(sc, options, itemsToProductions([item], grammar));
        } else {

            const
                skippable = getSkippableSymbolsFromItems([item], grammar),
                skip =
                    state.transition_type == TRANSITION_TYPE.CONSUME && !item.atEND
                        ? addSkipCallNew(skippable, grammar, runner, rec_glob_lex_name)
                        : undefined;

            code.addStatement(skip);
            sc = renderItem(code, item, options, false);
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

    const
        a_end = transition_penalty,
        a_syms = a.syms.length * (a_end),
        a_id = (+a.syms.some(isSymGeneratedId)) * 50 * (a_end),
        a_num = (+a.syms.some(isSymGeneratedNum)) * (a_end),
        a_sym = (+a.syms.some(isSymGeneratedSym)) * 5 * (a_end);

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

    let
        root = new SC,
        leaf = null,
        mid = root,
        lex_name = rec_glob_lex_name,
        peek_name = rec_glob_lex_name;

    const skippable = getSkippableSymbolsFromItems(items, grammar).filter(i => !all_syms.some(j => getUniqueSymbolName(i) == getUniqueSymbolName(j)));

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

        let gate_block: SC = SC.Empty();

        const transition_type: TRANSITION_TYPE = transition_types[0];

        switch (transition_type) {
            case TRANSITION_TYPE.PEEK:
            case TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS:
                gate_block = (isSymAProduction(syms[0]))
                    ? renderProductionCall(grammar[syms[0].val], options, peek_name)
                    : getIncludeBooleans(<TokenSymbol[]>syms, grammar, runner, peek_name, <TokenSymbol[]>all_syms);
                break;
            case TRANSITION_TYPE.ASSERT:
            case TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS:
            case TRANSITION_TYPE.ASSERT_END:
                gate_block = (isSymAProduction(syms[0]))
                    ? renderProductionCall(grammar[syms[0].val], options)
                    : getIncludeBooleans(<TokenSymbol[]>syms, grammar, runner, peek_name, <TokenSymbol[]>all_syms);
                break;
            case TRANSITION_TYPE.CONSUME:
                gate_block = (isSymAProduction(syms[0]))
                    ? createAssertionShiftManual(rec_glob_lex_name, renderProductionCall(grammar[syms[0].val], options))
                    : createAssertionShiftManual(rec_glob_lex_name, getIncludeBooleans(<TokenSymbol[]>syms, grammar, runner, lex_name, <TokenSymbol[]>all_syms));
                break;
            case TRANSITION_TYPE.IGNORE:
                gate_block = SC.Empty();
                break;
        }

        let if_stmt = SC.If(<ExprSC>gate_block);

        const SKIP_BOOL_EXPRESSION =
            (!FORCE_ASSERTIONS || transition_type == TRANSITION_TYPE.ASSERT_END)
            && (LAST && !FIRST)
            && (
                transition_type == TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS
                || transition_type == TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS
                || transition_type == TRANSITION_TYPE.ASSERT_END
            );

        if (SKIP_BOOL_EXPRESSION) if_stmt = SC.If();

        if_stmt.addStatement(
            runner.ANNOTATED ?
                SC.Comment(transition_types.map(ttt))
                : undefined,
            runner.ANNOTATED ?
                SC.Comment("\n   " + items.map(i =>
                    ((transition_type == TRANSITION_TYPE.CONSUME && !i.atEND) ? i.increment() : i)
                        .renderUnformattedWithProduction(grammar)).join("\n   ") + "\n")
                : undefined,
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
    gen: Generator<RecognizerState[], { hash: string, code: SC, prods: number[]; }>,
    selection_clause_fn:
        (gen: SelectionClauseGenerator, state: RecognizerState, items: Item[], level: number, options: RenderBodyOptions) => SC =
        defaultSelectionClause,
    multi_item_leaf_fn:
        (state: RecognizerState, states: RecognizerState[], options: RenderBodyOptions) => MultiItemReturnObject =
        defaultMultiItemLeaf,
    single_item_leaf_fn:
        (item: Item, group: RecognizerState, options: RenderBodyOptions) => SingleItemReturnObject =
        defaultSingleItemLeaf,
    grouping_fn: (node: RecognizerState, level: number, peeking: boolean) => string = defaultGrouping
): SC {
    let val = gen.next();

    while (!val.done) {

        const states: RecognizerState[] = <RecognizerState[]>val.value;

        if (states.length > 0) {


            if (states.some(i => !i)) throw new Error("UNDEFINED");

            for (const member of states) {
                if (member.completing) {
                    if (member.items.length == 1) {
                        const { root, prods } = single_item_leaf_fn(member.items[0], member, options);
                        member.code = root;
                        member.hash = root.hash();
                        member.prods = prods;
                    } else
                        throw new Error("Flow should not enter this block: Multi-item moved to group section");
                }
            }

            const
                prods = states.flatMap(g => g.prods).setFilter(),
                items = states.flatMap(g => g.items).setFilter(i => i.id),
                filtered_states = states.filter(s => s.transition_type !== TRANSITION_TYPE.IGNORE && !!s.code);

            //Set the transition type of any state with a null code property to IGNORE
            states.forEach(g => { if (!g.code) g.transition_type = TRANSITION_TYPE.IGNORE; });

            let
                root: SC = null, hash = "ignore";

            if (filtered_states.length > 0) {

                const virtual_state: RecognizerState = {
                    symbol: null,
                    code: filtered_states[0].code,
                    hash: filtered_states[0].hash,
                    prods,
                    items,
                    completing: false,
                    peek_level: filtered_states[0].peek_level,
                    offset: filtered_states[0].offset,
                    transition_type: filtered_states[0].transition_type,
                };

                if (states.some(g => g.symbol == null)) {
                    ({ root } = defaultMultiItemLeaf(virtual_state, states, options));
                } else {
                    root = selection_clause_fn(
                        traverseInteriorNodes(filtered_states, options, grouping_fn),
                        virtual_state,
                        items,
                        states[0].peek_level,
                        options
                    );
                }
                hash = root.hash();
            } else {
                root = null;

            }

            states.forEach(g => {
                g.prods = prods;
                g.code = root;
                g.hash = hash;
            });
        }

        val = gen.next();
    }

    return val.value.code;
}