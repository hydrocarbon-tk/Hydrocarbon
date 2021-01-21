import { RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { MultiItemReturnObject, SelectionClauseGenerator, SingleItemReturnObject } from "../../types/state_generating";
import { TokenSymbol } from "../../types/symbol.js";
import { getClosure } from "../../utilities/closure.js";
import { addSkipCallNew, getIncludeBooleans } from "../../utilities/code_generating.js";
import { getFollow } from "../../utilities/follow.js";
import { rec_glob_lex_name, rec_state, rec_state_prod } from "../../utilities/global_names.js";
import { Item, itemsToProductions } from "../../utilities/item.js";
import { renderItem, renderProductionCall } from "../../utilities/render_item.js";
import { ExprSC, SC } from "../../utilities/skribble.js";
import {
    createAssertionShiftManual, getExcludeSymbolSet, getSkippableSymbolsFromItems,
    getSymbolName,
    getSymbolsFromClosure,
    getUniqueSymbolName,
    isSymAProduction,
    isSymGeneratedId,
    isSymGeneratedNL,
    isSymGeneratedNum,
    isSymGeneratedSym,
    isSymGeneratedWS,
    isSymSpecifiedIdentifier,
    isSymSpecifiedNumeric,
    isSymSpecifiedSymbol
} from "../../utilities/symbol.js";
import { accept_loop_flag } from "../function_constructor.js";
import { processProductionChain } from "./process_production_chain.js";


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
                skip = state.transition_type == TRANSITION_TYPE.CONSUME && !item.atEND
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

export function defaultMultiItemLeaf(state: RecognizerState, states: RecognizerState[], options: RenderBodyOptions): MultiItemReturnObject {
    const
        { production } = options,
        root = (new SC).addStatement(
            SC.Declare(
                SC.Assignment("mk:int", SC.Call("mark")),
                SC.Assignment("anchor:Lexer", SC.Call(SC.Member(rec_glob_lex_name, "copy")))
            )
        ),
        IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS = states.some(i => i.transition_type == TRANSITION_TYPE.IGNORE),
        out_prods: number[] = [];

    let leaf = root, FIRST = true, prev_prods = [];

    for (const { code, items, prods } of states.filter(i => i.transition_type !== TRANSITION_TYPE.IGNORE)) {

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
                    if (!r)
                        return SC.Binary(rec_state_prod, "==", n);
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
                if (!r)
                    return SC.Binary(rec_state_prod, "==", n);
                return SC.Binary(r, "||", SC.Binary(rec_state_prod, "==", n));
            }, null)
        )).addStatement(SC.Assignment(rec_state_prod, production.id));
        leaf.addStatement(reset, SC.Empty());
        leaf = reset;
    }


    //*/
    return { root, leaves: [], prods: out_prods.setFilter() };
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

    if (groups.length == 1
        && !FORCE_ASSERTIONS
        && (groups[0].transition_types.includes(TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS)))
        return groups[0].code;

    let
        root = new SC,
        leaf = null,
        mid = root,
        lex_name = rec_glob_lex_name,
        peek_name = rec_glob_lex_name;

    const skippable = getSkippableSymbolsFromItems(items, grammar).filter(i => !all_syms.some(j => getSymbolName(i) == getSymbolName(j)));

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

        const SKIP_BOOL_EXPRESSION = (!FORCE_ASSERTIONS || transition_type == TRANSITION_TYPE.ASSERT_END)
            && (LAST && !FIRST)
            && (
                transition_type == TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS
                || transition_type == TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS
                || transition_type == TRANSITION_TYPE.ASSERT_END
            );

        if (SKIP_BOOL_EXPRESSION)
            if_stmt = SC.If();

        if_stmt.addStatement(
            runner.ANNOTATED ?
                SC.Comment(transition_types.map(ttt))
                : undefined,
            runner.ANNOTATED ?
                SC.Comment("\n   " + items.map(i => ((transition_type == TRANSITION_TYPE.CONSUME && !i.atEND) ? i.increment() : i)
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

    if (leaf)
        leaf.addStatement(SC.Empty());

    return root;
}


export function processProductionShiftStates(yielded_productions: number[])
    : (gen: SelectionClauseGenerator, state: RecognizerState, items: Item[], level: number, options: RenderBodyOptions) => SC {
    return (gen, state, items, level, options) => {

        const { grammar, production, runner } = options;

        if (state.offset == 0) {

            let switch_stmt: SC = SC.Switch(rec_state_prod);

            type case_clause_data = {
                key: number;
                code: SC;
                syms: TokenSymbol[];
                hash: string;
                prods: number[];
                items: Item[];
            };
            const
                { extended_production_shift_items } = options,
                pending_productions = [...yielded_productions.setFilter()],
                active_productions: Set<number> = new Set,
                active_groups: case_clause_data[][] = [],
                case_clauses: Map<number, case_clause_data[][]> = [...gen].flatMap(({ code, items, syms, prods }) => {
                    const
                        keys = <number[]>items.map(i => i.sym(grammar).val),
                        output = [];

                    for (const key of keys.setFilter())
                        output.push({ key, code, syms, hash: code.hash(), prods: prods.slice(), items });

                    return output;
                })
                    .group(({ hash }) => hash)
                    .groupMap(group => {
                        return group.map(g => g.key).setFilter();
                    });


            for (let i = 0; i < pending_productions.length; i++) {

                const prod = pending_productions[i];

                if (active_productions.has(prod))
                    continue;

                active_productions.add(prod);

                if (case_clauses.has(prod)) {

                    const
                        group = case_clauses.get(prod)[0],
                        prods = group.flatMap(g => g.prods).setFilter();

                    for (const key of group.map(g => g.key).setFilter())
                        active_productions.add(key);

                    pending_productions.push(...prods);
                    active_groups.push(group);
                }
            }

            if (active_groups.length == 0)
                return (new SC).addStatement(SC.Comment("value"));

            for (const clauses of active_groups.sort((([{ key: keyA }], [{ key: keyB }]) => keyA - keyB))) {
                let anticipated_syms;

                const
                    keys = clauses.map(g => g.key).setFilter(),
                    code = clauses[0].code,
                    items = clauses.flatMap(g => g.items).setFilter(i => i.id).filter(i => !extended_production_shift_items.some(s => s.body == i.body)).map(i => i.increment()),
                    active_items = items.filter(i => !i.atEND),
                    end_items = items.filter(i => i.atEND),
                    skippable = getSkippableSymbolsFromItems(items, grammar).filter(sym => !getFollow(keys[0], grammar).some(s => getSymbolName(s) == getSymbolName(sym))
                    );

                let interrupt_statement = null;

                if (active_items.length > 0) {
                    const
                        closure = getClosure(active_items.slice(), grammar);
                    anticipated_syms = getSymbolsFromClosure(closure, grammar);

                    if (keys.some(k => k == production.id)) {
                        const follow_symbols = keys.flatMap(k => getFollow(k, grammar)).setFilter(sym => getUniqueSymbolName(sym));


                        /*
                            Early exit should only occur if there is an occluding generic ( such as g:sym, g:id )
                            that could capture a symbol that would otherwise cause a reduce.  FOLLOW Symbols that
                            would otherwise be matched match by the generic type should be selected for the early
                            exit check. If there are no such generics in the excluded  items, then there is no
                            need to do this check.
                        */
                        const
                            lookahead_syms = [...follow_symbols.filter(s => isSymGeneratedWS(s) || isSymGeneratedNL(s))];

                        if (anticipated_syms.some(isSymGeneratedSym))
                            lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedSymbol));

                        if (anticipated_syms.some(isSymGeneratedId))
                            lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedIdentifier));

                        if (anticipated_syms.some(isSymGeneratedNum))
                            lookahead_syms.push(...follow_symbols.filter(isSymSpecifiedNumeric));

                        if (lookahead_syms.length > 0) {

                            const
                                syms = getExcludeSymbolSet(lookahead_syms, anticipated_syms),
                                booleans = getIncludeBooleans(syms, grammar, runner, rec_glob_lex_name);

                            if (booleans)
                                interrupt_statement = SC.If(booleans).addStatement(SC.Break);
                        }
                    }
                }

                switch_stmt.addStatement(
                    ...keys.slice(0, -1).map(k => SC.If(SC.Value(k + ""))),
                    SC.If(SC.Value(keys.pop() + ""))
                        .addStatement(
                            active_items.length > 0 || end_items.length > 1
                                ? addSkipCallNew(skippable, grammar, runner)
                                : undefined,
                            interrupt_statement,
                            code
                        )
                );

                if (active_groups.length == 1) {
                    switch_stmt = new SC().addStatement(...switch_stmt.statements[0].statements);
                } else {
                    switch_stmt.statements[switch_stmt.statements.length - 1].addStatement(SC.Break);
                }
            }

            const out_stmt = SC.While(
                active_groups.length > 1
                    ? SC.Value("true")
                    : SC.Binary(rec_state_prod, "==", active_groups[0][0].key)
            )
                .addStatement(
                    SC.Declare(SC.Assignment(accept_loop_flag, SC.False)),
                    switch_stmt,
                    SC.If(SC.UnaryPre(SC.Value("!"), accept_loop_flag)).addStatement(SC.Break)
                );

            return out_stmt;
        }

        state.offset--;

        return defaultSelectionClause(gen, state, items, level, options, state.offset <= 1);
    };
}


export function completerSingleItemLeaf(item: Item, state: RecognizerState, options: RenderBodyOptions): { root: SC; leaf: SC; prods: number[]; } {
    const { root, leaf, prods } = defaultSingleItemLeaf(item, state, options);

    if (state.transition_type !== TRANSITION_TYPE.IGNORE
        &&
        //
        // If the key id is the same as the function production id
        // and the reduce production id, do not allow the while loop to 
        // continue as this would cause an infinite loop
        //
        state.transition_type !== TRANSITION_TYPE.ASSERT_END
        ||
        !(prods[0] == options.production.id && options.active_keys.includes(prods[0]))
    )
        leaf.addStatement(SC.Assignment(accept_loop_flag, SC.True));

    return { root, leaf, prods };
};