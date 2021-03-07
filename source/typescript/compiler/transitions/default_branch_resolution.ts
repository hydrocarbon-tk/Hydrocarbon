/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { RenderBodyOptions } from "../../types/render_body_options";
import { Symbol, TokenSymbol } from "../../types/symbol.js";
import { TransitionClauseGenerator, TransitionGroup } from "../../types/transition_generating";
import { Leaf, TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { createBranchFunction, createConsume, createSkipCall, createSymbolMappingFunction, getIncludeBooleans, getProductionFunctionName } from "../../utilities/code_generating.js";
import { createTransitionTypeAnnotation } from "../../utilities/create_transition_type_annotation.js";
import { rec_glob_data_name, rec_glob_lex_name } from "../../utilities/global_names.js";
import { Item } from "../../utilities/item.js";
import { ExprSC, SC, VarSC } from "../../utilities/skribble.js";
import {
    Symbols_Occlude,
    Defined_Symbols_Occlude,
    getSkippableSymbolsFromItems,
    getSymbolName,

    getUniqueSymbolName,
    Symbols_Are_The_Same,
    Sym_Is_A_Generic_Identifier,
    Sym_Is_A_Generic_Number,
    Sym_Is_A_Generic_Symbol,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token,
    Sym_Is_Defined_Identifier,
    Sym_Is_Defined_Natural_Number,
    Sym_Is_Defined_Symbols,
    Sym_Is_EOF
} from "../../utilities/symbol.js";
import { createVirtualProductionSequence } from "../function_constructor.js";

/**
 * Handles intermediate state transitions. 
 */
export function default_resolveBranches(
    gen: TransitionClauseGenerator,
    node: TransitionNode,
    items: Item[],
    level: number,
    options: RenderBodyOptions,
    FORCE_ASSERTIONS: boolean = false
): SC {

    const
        { grammar, helper: runner } = options,
        groups = [...gen],
        all_syms = groups.flatMap(({ syms }) => syms).setFilter(getUniqueSymbolName),
        root = new SC,
        GROUPS_CONTAIN_SYMBOL_AMBIGUITY = Groups_Contain_Symbol_Ambiguity(groups);

    if (groups.length == 1
        && !FORCE_ASSERTIONS
        && (groups[0].transition_types.includes(TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS)))
        return groups[0].code;

    if (options.helper.ANNOTATED)
        root.addStatement(items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n"));

    const peek_name = createPeekStatements(options,
        node,
        root,
        rec_glob_lex_name,
        rec_glob_lex_name,
        getSkippableSymbolsFromItems(items, grammar).filter(i => !all_syms.some(j => getSymbolName(i) == getSymbolName(j))),
        groups
    );

    if ((groups.length >= 32 || GROUPS_CONTAIN_SYMBOL_AMBIGUITY) && items.filter(i => i.atEND).setFilter(i => i.id).length <= 1)

        createSwitchBlock(options, groups, peek_name, rec_glob_lex_name, root);

    else

        createIfElseBlock(options, node, groups, root, rec_glob_lex_name, peek_name, all_syms, FORCE_ASSERTIONS);

    root.addStatement(SC.Empty());

    return root;
}
/**
 * Checks for groups that have mutually occluding symbols
 */
function Groups_Contain_Symbol_Ambiguity(groups: TransitionGroup[]) {

    const masks: [number, number][] = groups.map(
        g => [
            ((+g.syms.some(Sym_Is_A_Generic_Identifier)) << 0)
            | ((+g.syms.some(Sym_Is_A_Generic_Number)) << 1)
            | ((+g.syms.some(Sym_Is_A_Generic_Symbol)) << 2),
            ((+g.syms.some(Sym_Is_Defined_Identifier)) << 0)
            | ((+g.syms.some(Sym_Is_Defined_Natural_Number)) << 1)
            | ((+g.syms.some(Sym_Is_Defined_Symbols)) << 2)
        ]
    );

    for (let i = 0; i < masks.length; i++) {
        for (let j = 0; j < masks.length; j++) {

            if (i == j) continue;

            const [genA, defA] = masks[i];
            const [genB, defB] = masks[j];

            if (
                ((genA & defB) && (genB & defA))
                || (genB & genA)
            ) return true;
        }
    }

    for(let i = 0; i < groups.length; i++){
        for(let j = i; j < groups.length; j++){
            if(j==i) continue
            const groupA = groups[i]
            const groupB = groups[j]
            
            for(const symA of groupA.syms){
                for(const symB of groupB.syms){
                    if(Defined_Symbols_Occlude(symA, symB))
                        return true
                }
            }
        }
    }

    return false;

}
/**
 * Used in cases of large number of symbols + transitions or occlusion conflicts
 * @param options 
 * @param groups 
 * @param lex_name 
 * @param root 
 */
function createSwitchBlock(
    options: RenderBodyOptions,
    groups: TransitionGroup[],
    peek_name: VarSC,
    lex_name: VarSC,
    root: SC
) {
    const symbol_mappings: [number, Symbol][]

        = <any>groups.flatMap((g, i) => g.syms.map(s => [i, s])),

        fn_name = createSymbolMappingFunction(
            options,
            lex_name,
            symbol_mappings
        ),

        sw = SC.Switch(SC.Call(fn_name, peek_name, rec_glob_data_name));

    let DEFAULT_NOT_ADDED = true;

    for (let i = 0; i < groups.length; i++) {

        let { items, code } = groups[i];

        if (items.some(i => i.atEND) && DEFAULT_NOT_ADDED) {
            DEFAULT_NOT_ADDED = false;
            sw.addStatement(SC.If(SC.Value("default")));
        }

        sw.addStatement(SC.If(SC.Value(i)).addStatement(code/*, SC.Break*/));
    }

    if (DEFAULT_NOT_ADDED)
        sw.addStatement(SC.If(SC.Value("default")).addStatement(SC.Break));

    root.addStatement(sw);
}

function createPeekStatements(
    options: RenderBodyOptions,
    state: TransitionNode,
    root: SC,
    lex_name: VarSC,
    peek_name: VarSC,
    skippable: TokenSymbol[],
    groups: TransitionGroup[],

) {
    if (Every_Transition_Does_Not_Require_A_Skip(groups))
        return lex_name;

    const
        { grammar, helper: runner } = options;

    if (state.peek_level >= 0) {
        if (state.peek_level == 1) {
            peek_name = SC.Variable("pk:Lexer");
            root.addStatement(SC.Declare(SC.Assignment(peek_name, SC.Call(SC.Member(lex_name, "copy")))));
        }

        if (state.offset > 0 && state.peek_level == 0) {
            root.addStatement(createSkipCall(skippable, options, lex_name, false));
        } else if (state.peek_level >= 1) {

            peek_name = SC.Variable("pk:Lexer");
            root.addStatement(createSkipCall(skippable, options, SC.Call(SC.Member(peek_name, "next"), rec_glob_data_name), true));
        }
    } else if (state.offset > 0) {
        root.addStatement(createSkipCall(skippable, options, rec_glob_lex_name, false));
    }
    return peek_name;
}

function Every_Transition_Does_Not_Require_A_Skip(groups: TransitionGroup[]) {
    return groups.every(g => g.transition_types.every(t => t == TRANSITION_TYPE.POST_PEEK_CONSUME || t == TRANSITION_TYPE.ASSERT_END));
}

function createIfElseBlock(
    options: RenderBodyOptions,
    state: TransitionNode,
    groups: TransitionGroup[],
    root: SC,
    lex_name: VarSC,
    peek_name: VarSC,
    all_syms: Symbol[],
    FORCE_ASSERTIONS: boolean,
) {

    let leaf = root;

    let previous_transition: TRANSITION_TYPE;

    const { grammar, helper: runner } = options;

    for (let i = 0; i < groups.length; i++) {

        const
            group = groups[i],
            { syms, transition_types, code, items, leaves } = group,
            complement_symbols = groups.filter((l, j) => j > i).flatMap(g => g.syms).setFilter(getUniqueSymbolName);

        let assertion_boolean: SC = SC.Empty();

        const
            transition_type: TRANSITION_TYPE = transition_types[0],
            FIRST_SYMBOL_IS_A_PRODUCTION = Sym_Is_A_Production(syms[0]),
            FIRST_SYMBOL_IS_A_PRODUCTION_TOKEN = Sym_Is_A_Production_Token(syms[0]);

        switch (transition_type) {

            case TRANSITION_TYPE.POST_PEEK_CONSUME:

                const sc = new SC;
                code.shiftStatement(SC.Value("puid |=" + grammar.item_map.get(items[0].id).sym_uid));
                sc.addStatement(createTransitionTypeAnnotation(options, transition_types), createConsume(lex_name), code);
                leaf.addStatement(sc);
                leaf = sc;

                break;

            case TRANSITION_TYPE.ASSERT_END:
                /**
                 * Completed Items are tricky. They don't represent actual consumption of 
                 * tokens, but rather must assert that a set of tokens FOLLOW the completed
                 * item. This set can easily occlude other symbols and lead to incorrect 
                 * recognition. 
                 * 
                 * There are several ways to remedy this. One is to make completed 
                 * items the last item evaluated within an if-else expression block. 
                 * Since completed items are reducible by default no matter the state
                 * of the token stream, this allows the last block to be simply and else
                 * statement. 
                 * 
                 * This is not an option if there are multiple completed items, as there will be
                 * at least one completed item whose set of follow tokens must be evaluated
                 * to remove ambiguity.
                 * 
                 * 
                 */

                let pending_syms = syms.slice();
                // Remove symbols that should lead to a shift
                // This overcomes shift-reduce ambiguities
                if (complement_symbols.length > 0)
                    pending_syms = pending_syms
                        .filter(s => !complement_symbols.some(o => Symbols_Are_The_Same(s, o)));

                // Negative assertion helps prevent occlusions of subsequent group's symbols
                // from an end items follow set

                const
                    primary_symbols = syms.filter(a => complement_symbols.some(o => Sym_Is_EOF(a) || Defined_Symbols_Occlude(<any>a, o))),
                    negate_symbols = complement_symbols,
                    remaining_symbols = getIncludeBooleans(<TokenSymbol[]>primary_symbols, options, peek_name),
                    negated_expression = getIncludeBooleans(<TokenSymbol[]>negate_symbols, options, peek_name);

                if (negated_expression) {

                    if (primary_symbols.length > 0)
                        assertion_boolean = SC.Binary(SC.Group("(",remaining_symbols),  "&&", SC.UnaryPre("!", SC.Group("(", negated_expression)) );
                    else
                        assertion_boolean = SC.UnaryPre("!", negated_expression);
                } else assertion_boolean = SC.Empty();

                leaf = addIfStatementTransition(options, group, code, assertion_boolean, FORCE_ASSERTIONS, leaf, state.leaves);

                break;

            case TRANSITION_TYPE.ASSERT_PRODUCTION_CALL:

                const production = grammar[group.items[0].sym(grammar).val];

                options.called_productions.add(<number>production.id);

                code.addStatement(SC.Value("return -1"));

                const call_name = createBranchFunction(code, code, options);
                const rc = new SC;
                rc.addStatement(SC.Call("pushFN", "data", call_name));
                rc.addStatement(SC.Call("pushFN", "data", getProductionFunctionName(production, grammar)));
                rc.addStatement(SC.Value("puid |=" + grammar.item_map.get(items[0].id).sym_uid));
                rc.addStatement(SC.UnaryPre(SC.Return, SC.Value("puid")));
                leaf.addStatement(rc);
                leaf = rc;
                leaves.forEach(leaf => leaf.INDIRECT = true);

                break;

            case TRANSITION_TYPE.ASSERT:
            case TRANSITION_TYPE.ASSERT_PEEK:
            case TRANSITION_TYPE.ASSERT_PEEK_VP:
            case TRANSITION_TYPE.PEEK_UNRESOLVED:
            case TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS:
            case TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS:

                if (FIRST_SYMBOL_IS_A_PRODUCTION && !FIRST_SYMBOL_IS_A_PRODUCTION_TOKEN) throw new Error("WTF");

                assertion_boolean = getIncludeBooleans(<TokenSymbol[]>syms, options, peek_name, <TokenSymbol[]>complement_symbols);

                let scr = code;

                if (state.PUIDABLE) {

                } else if (items.length == 1) {
                    scr = new SC;
                    //build puid and pass to finishing function
                    const nc = new SC;

                    code.addStatement(SC.Value("return -1"));

                    const continue_name = createBranchFunction(nc, nc, options);
                    const call_name = createBranchFunction(code, code, options);


                    scr.addStatement(SC.Call("pushFN", "data", continue_name));
                    scr.addStatement(SC.UnaryPre(SC.Return, SC.Call(call_name, "l", "data", "state", "prod", "" + grammar.item_map.get(items[0].decrement().id).sym_uid)));

                    leaves[0].leaf.addStatement(SC.Value("return prod"));

                    leaves.forEach(l => l.transition_type == TRANSITION_TYPE.IGNORE);
                    leaves[0].leaf = nc;
                    leaves[0].INDIRECT = true;
                    leaves[0].transition_type = TRANSITION_TYPE.ASSERT;
                }

                leaf = addIfStatementTransition(options, group, scr, assertion_boolean, FORCE_ASSERTIONS, leaf, state.leaves);



                break;

            case TRANSITION_TYPE.ASSERT_CONSUME:


                assertion_boolean = getIncludeBooleans(<TokenSymbol[]>syms, options, lex_name, <TokenSymbol[]>complement_symbols);

                leaf = addIfStatementTransition(options, group, code, assertion_boolean, FORCE_ASSERTIONS, leaf, state.leaves);

                code.shiftStatement(SC.Value("puid |=" + grammar.item_map.get(items[0].id).sym_uid));
                code.shiftStatement(createConsume(rec_glob_lex_name));
                break;

            case TRANSITION_TYPE.IGNORE: break;
        }

        previous_transition = transition_type;
    }
}




function addIfStatementTransition(
    options: RenderBodyOptions,
    group: TransitionGroup,
    modified_code: SC,
    boolean_assertion: SC,
    FORCE_ASSERTIONS: boolean,
    leaf: any,
    leaves: Leaf[]
) {

    const { grammar, helper: runner } = options;
    let { syms, items, LAST, FIRST, transition_types } = group;
    const transition_type: TRANSITION_TYPE = transition_types[0];
    const breadcrumb_items = items.map(i => (((
        transition_type == TRANSITION_TYPE.ASSERT_CONSUME
        || transition_type == TRANSITION_TYPE.ASSERT_PRODUCTION_CALL
    ) && !i.atEND) ? i.increment() : i));

    const traffic = breadcrumb_items.filter(i => i.offset == 1)
        .map(i => (new Item(i.body, i.len, 0)).id)
        .flatMap(id => [...grammar.item_map.get(id).breadcrumbs.values()])
        .setFilter()
        .sort();


    let if_stmt = SC.If(<ExprSC>boolean_assertion);

    const SKIP_BOOL_EXPRESSION = (!FORCE_ASSERTIONS || transition_type == TRANSITION_TYPE.ASSERT_END)
        && (LAST && !FIRST)
        && (
            transition_type == TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS
            //|| transition_type == TRANSITION_TYPE.ASSERT
            || transition_type == TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS
            || transition_type == TRANSITION_TYPE.PEEK_UNRESOLVED
            || transition_type == TRANSITION_TYPE.ASSERT_PEEK
            || transition_type == TRANSITION_TYPE.ASSERT_PEEK_VP
            || transition_type == TRANSITION_TYPE.ASSERT_END
        );

    if (SKIP_BOOL_EXPRESSION &&
        /**
         * Skipping early optimization. It IS the 
         * root of all evil
         */
        false
        )
        if_stmt = SC.If();

    if_stmt.addStatement(
        modified_code,
        SC.Empty()
    );

    leaf.addStatement(
        createTransitionTypeAnnotation(options, transition_types),
        if_stmt
    );

    return if_stmt;
}


