import { Leaf, RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { MultiItemReturnObject, SelectionClauseGenerator, SingleItemReturnObject } from "../../types/state_generating";
import { TokenSymbol } from "../../types/symbol.js";
import { getClosure } from "../../utilities/closure.js";
import { addSkipCallNew, createAssertionShiftManual, getIncludeBooleans, renderProductionCall } from "../../utilities/code_generating.js";
import { getFollow } from "../../utilities/follow.js";
import { rec_glob_lex_name, rec_state, rec_state_prod } from "../../utilities/global_names.js";
import { Item, itemsToProductions } from "../../utilities/item.js";
import { renderItem } from "../../utilities/render_item.js";
import { ConstSC, ExprSC, SC, VarSC } from "../../utilities/skribble.js";
import {
    doDefinedSymbolsOcclude,
    getComplementOfSymbolSets,
    getSkippableSymbolsFromItems,
    getSymbolName,
    getSymbolsFromClosure,
    getUniqueSymbolName,
    isSymAGenericType,
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
        { grammar, helper: runner, leaf_productions, production, extended_goto_items: extended_production_shift_items, leaves } = options,
        code = state.code || new SC,
        SHOULD_IGNORE = extended_production_shift_items.some(i => i.body == item.body);

    let leaf_code = code, prods = [];

    if (SHOULD_IGNORE) {
        leaf_code.addStatement(SC.Comment("SHOULD IGNORE"));
        state.transition_type = TRANSITION_TYPE.IGNORE;
        return {
            leaf: {
                root: leaf_code,
                leaf: leaf_code,
                prods,
                hash: leaf_code.hash(),
                transition_type: state.transition_type
            }
        };
    }

    if (state.transition_type == TRANSITION_TYPE.CONSUME && !item.atEND)
        item = item.increment();

    if (item) {
        if (item.len > 0 && item.offset == 0 && (item.getProduction(grammar).id != production.id || state.offset > 0)) {

            const bool = renderProductionCall(item.getProduction(grammar), options, rec_glob_lex_name);

            leaf_code = SC.If(bool);

            code.addStatement(leaf_code);

            prods = processProductionChain(leaf_code, options, itemsToProductions([item], grammar));

        } else {

            const
                skippable = getSkippableSymbolsFromItems([item], grammar),
                skip = state.transition_type == TRANSITION_TYPE.CONSUME && !item.atEND
                    ? addSkipCallNew(skippable, grammar, runner, rec_glob_lex_name)
                    : undefined;

            code.addStatement(skip);

            leaf_code = renderItem(code, item, options, false);

            prods = processProductionChain(leaf_code, options, itemsToProductions([item], grammar));
        }

        for (const prod of prods)
            leaf_productions.add(prod);
    }

    leaf_code.shiftStatement(SC.Comment("--unique-id--" + prods.setFilter().sort().join("-") + "--DO-NOT-REPLACE"));

    return {
        leaf: {
            root: code,
            leaf: leaf_code,
            prods,
            hash: code.hash(),
            transition_type: state.transition_type
        }
    };
}

export function defaultMultiItemLeaf(state: RecognizerState, states: RecognizerState[], options: RenderBodyOptions): MultiItemReturnObject {

    const

        anchor_state = SC.Variable("anchor_state:unsigned"),

        root: SC = (new SC).addStatement(
            SC.Declare(
                SC.Assignment("mk:int", SC.Call("mark")),
                SC.Assignment("anchor:Lexer", SC.Call(SC.Member(rec_glob_lex_name, "copy"))),
                SC.Assignment(anchor_state, rec_state)
            )
        ),

        IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS = states.some(i => i.transition_type == TRANSITION_TYPE.IGNORE),

        out_prods: number[] = [],
        out_leaves: Leaf[] = [];

    let leaf = root, FIRST = true, prev_prods = [];

    for (const { code, items, prods, leaves } of states.filter(i => i.transition_type !== TRANSITION_TYPE.IGNORE)) {

        out_prods.push(...prods);
        out_leaves.push(...leaves);

        leaf.addStatement(SC.Comment(items));

        if (FIRST) {

            leaf.addStatement(
                SC.Comment(prods),
                code
            );

        } else {
            leaf.addStatement(
                SC.Assignment(rec_state, SC.Call(
                    "reset:bool",
                    "mk",
                    "anchor:Lexer",
                    rec_glob_lex_name,
                    anchor_state
                )),
                code,
                SC.Empty()
            );

        }
        prev_prods = prods;

        FIRST = false;
    }

    if (IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS) {
        leaf.addStatement(
            SC.Assignment(rec_state, SC.Call(
                "reset:bool",
                "mk",
                "anchor:Lexer",
                rec_glob_lex_name,
                anchor_state
            )),
            SC.Empty()
        );
    }

    return { root, leaves: out_leaves, prods: out_prods.setFilter() };
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
        { grammar, helper: runner } = options,
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


export function processGoTOStates(gen: SelectionClauseGenerator, state: RecognizerState, items: Item[], level: number, options: RenderBodyOptions): SC {

    if (state.offset == 0) {

        const
            { grammar, production, helper: runner } = options,
            goto_groups = [...gen];

        let switch_stmt: SC = SC.Switch(rec_state_prod);

        for (const { syms, items, code, hash, leaves } of goto_groups.sort((a, b) => a.syms[0] - b.syms[0])) {

            let anticipated_syms;

            const
                keys = (<number[]><any>syms).setFilter(),
                active_items = items.filter(i => !i.atEND),
                end_items = items.filter(i => i.atEND),
                skippable = getSkippableSymbolsFromItems(items, grammar)
                    .filter(sym => !getFollow(keys[0], grammar).some(s => getSymbolName(s) == getSymbolName(sym)));

            leaves.map(l => l.keys = keys);

            let interrupt_statement = null;


            if (active_items.length > 0) {
                const
                    closure = getClosure(active_items.slice(), grammar);
                anticipated_syms = getSymbolsFromClosure(closure, grammar);

                /**
                 * Create look ahead for a preemptive reduce on keys that match the production id
                 */
                if (keys.some(k => k == production.id)) {

                    /**
                    *   Criteria for checked symbols 
                    *
                    *   fs = follow_symbols
                    *   as = anticipated_symbols
                    *   cs = symbols that should be check
                    *   
                    *   cs = occluded((fs \ as), as) 
                    * 
                    *   where occluded(syms , oc) is
                    *       
                    *       syms = checked symbols
                    *       oc = potential occluders = (fs ∪ as)
                    *       SY = type declared symbol
                    *       ID = type declared identifier
                    *       NU = type declared number
                    *       
                    *       for s in syms
                    *           
                    *           s is (g:ws | g:nl) : yield
                    *
                    *           s is (g:*) : discard
                    * 
                    *           s is SY 
                    *              & ( g:sym ∈ oc | ( a is DS & a ∈ oc & n exists where a[0,n] == s[0,n] where n > 1 and n >= a.length) ) : yield
                    * 
                    *           s is ID 
                    *              & ( g:id ∈ oc | g:ws ∉ syms | g:nl ∉ syms
                    *                  |  ( a is ID & a ∈ oc & n exists where a[0...n] == s[0...n] where n > 1 and n = a.length)  )
                    *              ) : yield
                    *               
                    *           s is NU 
                    *              & ( g:id ∈ oc | g:ws ∉ syms | g:nl ∉ syms
                    *                  |  ( a is NU & a ∈ oc & n exists where a[0...n] == s[0...n] where n > 1 and n = a.length)  ) 
                    *              ) : yield
                    * 
                    * 
                    */
                    const unique_candidates = getComplementOfSymbolSets(
                        keys.flatMap(k => getFollow(k, grammar)).setFilter(sym => getUniqueSymbolName(sym)),
                        anticipated_syms
                    ),
                        checked_symbols = [],

                        GEN_SYM = anticipated_syms.some(isSymGeneratedSym),
                        GEN_ID = anticipated_syms.some(isSymGeneratedId),
                        GEN_NUM = anticipated_syms.some(isSymGeneratedNum),
                        CONTAINS_WS = unique_candidates.some(isSymGeneratedWS) || !skippable.some(isSymGeneratedWS),
                        CONTAINS_NL = unique_candidates.some(isSymGeneratedNL) || !skippable.some(isSymGeneratedNL),
                        GEN_NL_WS = CONTAINS_NL || CONTAINS_WS;


                    for (const s of unique_candidates) {

                        if (isSymGeneratedNL(s) || isSymGeneratedWS(s))
                            checked_symbols.push(s);
                        else if (isSymAGenericType(s))
                            continue;
                        else if (isSymSpecifiedSymbol(s)) {
                            if (GEN_SYM || anticipated_syms.some(a => doDefinedSymbolsOcclude(a, s))) checked_symbols.push(s);
                        } else if (isSymSpecifiedIdentifier(s) && !GEN_NL_WS) {
                            if (GEN_ID || anticipated_syms.some(a => doDefinedSymbolsOcclude(a, s))) checked_symbols.push(s);
                        } else if (isSymSpecifiedNumeric(s) && !GEN_NL_WS) {
                            if (GEN_NUM || anticipated_syms.some(a => doDefinedSymbolsOcclude(a, s))) checked_symbols.push(s);
                        }
                    }

                    //TODO: Remove this
                    interrupt_statement = (new SC).addStatement(
                        items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n"),
                        "check:" + checked_symbols.map(i => `[${i.val}]`).join(" "),
                        "anticipated" + anticipated_syms.map(i => `[${i.val}]`).join(" ")
                    );
                    //ODOT

                    if (checked_symbols.length > 0) {

                        const
                            booleans = getIncludeBooleans(checked_symbols, grammar, runner, rec_glob_lex_name, anticipated_syms);

                        if (booleans) {
                            interrupt_statement = SC.If(booleans).addStatement(
                                SC.UnaryPre(SC.Return, rec_state)
                            );
                        }
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

            if (goto_groups.length == 1) {
                switch_stmt = new SC().addStatement(...switch_stmt.statements[0].statements);
            } else {
                switch_stmt.statements[switch_stmt.statements.length - 1].addStatement(SC.Break);
            }
        }

        return SC.While(
            SC.Value(1)
        )
            .addStatement(
                switch_stmt,
                SC.Break
            );
    }

    state.offset--;

    return defaultSelectionClause(gen, state, items, level, options, state.offset <= 1);
}
/**
 * Adds code to end states
 * 
 * If a production shift section is present, then leaf states in RD 
 * section are appended  with a prod assignment. Additionally, a
 * local prod variable is declared at the head of the production 
 * function, and a call to assertSuccess is appended to the tail. 
 * 
 * If the production shift section is absent then leaf states simply 
 * return `true`. A `return false` statement is appended to the end
 * of the production function;
 * 
 * *leaf state* - Any sequence of transitions yields a
 * single item
 * 
 * @param production_function_root_rd - The root skribble node for the production function
 * @param RDOptions - Options from the RD yielder
 * @param GOTO_Options - Options from the GOTO yielder
 */
export function completeFunctionProduction(
    production_function_root_rd: SC,
    production_function_root_goto: SC,
    rd_fn_name: VarSC | ConstSC,
    goto_fn_name: VarSC | ConstSC,
    RDOptions: RenderBodyOptions,
    GOTO_Options: RenderBodyOptions) {
    const
        { leaves: rd_leaves, production } = RDOptions,
        { leaves: goto_leaves, NO_GOTOS: NO_PRODUCTION_SHIFTS, active_keys } = GOTO_Options;

    for (const rd_leaf of rd_leaves) {
        const { leaf, prods } = rd_leaf;

        //@ts-ignore
        if (rd_leaf.SET) continue;

        //@ts-ignore
        rd_leaf.SET = true;

        if (NO_PRODUCTION_SHIFTS) {
            leaf.addStatement(createDebugCall(GOTO_Options, "RD return"));
            leaf.addStatement(SC.UnaryPre(SC.Return, rec_state));
        } else {
            leaf.addStatement(SC.UnaryPre(SC.Return, SC.Call(goto_fn_name, rec_glob_lex_name, rec_state, prods[0])));
        }
    }

    if (!NO_PRODUCTION_SHIFTS)

        for (const goto_leaf of goto_leaves) {

            const { leaf, prods, transition_type } = goto_leaf;

            //@ts-ignore
            if (goto_leaf.SET) continue;

            //@ts-ignore
            goto_leaf.SET = true;

            if (
                transition_type == TRANSITION_TYPE.ASSERT_END
                &&
                prods[0] == production.id
                &&
                goto_leaf.keys.includes(production.id)
            ) {
                leaf.addStatement(createDebugCall(GOTO_Options, "Inter return"));
                leaf.addStatement(SC.UnaryPre(SC.Return, rec_state));
            } else if (transition_type !== TRANSITION_TYPE.IGNORE) {
                leaf.addStatement(SC.Assignment(rec_state_prod, prods[0]));
                leaf.addStatement(SC.Value("continue"));
            }
        }


    production_function_root_rd.addStatement(SC.UnaryPre(SC.Return, SC.Value("0")));

    if (!NO_PRODUCTION_SHIFTS)
        production_function_root_goto.addStatement(addClauseSuccessCheck(RDOptions));
}

function addClauseSuccessCheck(options: RenderBodyOptions): SC {
    const { production } = options;
    const condition = SC.Binary(rec_state_prod, "==", SC.Value(production.id));
    return SC.UnaryPre(SC.Return, SC.Call("assertSuccess", rec_glob_lex_name, rec_state, condition));
}

export function createDebugCall(options: RenderBodyOptions, action_name, active_item: Item[] = []) {

    const { production, helper: runner } = options;

    if (runner.DEBUG)
        return SC.Value(`debug_stack.push({ name:"${production.name} ${action_name}", state, tx:str.slice(l.off, l.off + l.tl), ty:l.ty, tl:l.tl, utf:l.getUTF(), FAILED:state==0,offset:l.off})`);
    else
        return SC.Empty();
}
