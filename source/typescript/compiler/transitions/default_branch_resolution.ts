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
    Defined_Symbols_Occlude,
    getSkippableSymbolsFromItems,
    getSymbolName,

    getUniqueSymbolName,
    Symbols_Are_The_Same, Sym_Is_A_Production,
    Sym_Is_A_Production_Token,
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
        root = new SC;

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

    if (false && groups.length > 4 && items.filter(i => i.atEND).setFilter(i => i.id).length <= 1)

        createSwitchBlock(options, groups, rec_glob_lex_name, root);

    else

        createIfElseBlock(options, node, groups, root, rec_glob_lex_name, peek_name, all_syms, FORCE_ASSERTIONS);

    root.addStatement(SC.Empty());

    return root;
}

function createSwitchBlock(
    options: RenderBodyOptions,
    groups: TransitionGroup[],
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

        sw = SC.Switch(SC.Call(fn_name, lex_name, rec_glob_data_name));

    let DEFAULT_NOT_ADDED = true;

    for (let i = 0; i < groups.length; i++) {

        let { items, code } = groups[i];

        if (items.some(i => i.atEND)) {
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
            root.addStatement(createSkipCall(skippable, grammar, runner, lex_name, false));
        } else if (state.peek_level >= 1) {

            peek_name = SC.Variable("pk:Lexer");
            root.addStatement(createSkipCall(skippable, grammar, runner, SC.Call(SC.Member(peek_name, "next"), rec_glob_data_name), true));
        }
    } else if (state.offset > 0) {
        root.addStatement(createSkipCall(skippable, grammar, runner, rec_glob_lex_name, false));
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

                sc.addStatement(createTransitionTypeAnnotation(options, transition_types), createConsume(lex_name), code);
                leaf.addStatement(sc);
                leaf = sc;

                break;

            case TRANSITION_TYPE.ASSERT_END:

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
                    remaining_symbols = getIncludeBooleans(<TokenSymbol[]>primary_symbols, grammar, runner, peek_name),
                    negated_expression = getIncludeBooleans(<TokenSymbol[]>negate_symbols, grammar, runner, peek_name);

                if (negated_expression) {

                    if (primary_symbols.length > 0)
                        assertion_boolean = SC.Binary(SC.UnaryPre("!", SC.Group("(", negated_expression)), "||", remaining_symbols);
                    else
                        assertion_boolean = SC.UnaryPre("!", negated_expression);
                } else assertion_boolean = SC.Empty();

                leaf = addIfStatementTransition(options, group, code, assertion_boolean, FORCE_ASSERTIONS, leaf, state.leaves);

                break;

            case TRANSITION_TYPE.ASSERT_PRODUCTION_CALL:

                const production = grammar[group.items[0].sym(grammar).val];

                options.called_productions.add(<number>production.id);

                const call_name = createBranchFunction(code, code, options);
                const rc = new SC;
                rc.addStatement(SC.Call("pushFN", "data", call_name));
                rc.addStatement(SC.Call("pushFN", "data", getProductionFunctionName(production, grammar)));
                rc.addStatement(SC.UnaryPre(SC.Return, SC.Value("0")));
                leaf.addStatement(rc);
                leaf = rc;
                leaves.forEach(leaf => leaf.INDIRECT = true);

                break;


                //Wrap code into a call statement and then push the function pointer to the stack

                /*

                if (Production_Is_Trivial(production)) {

                    const syms = getTokenSymbolsFromItems(getClosure(getProductionClosure(production.id, grammar), grammar), grammar);

                    assertion_boolean = getIncludeBooleans(<TokenSymbol[]>syms, grammar, runner, peek_name, <TokenSymbol[]>complement_symbols);

                    leaf = addIfStatementTransition(options, group, code, assertion_boolean, FORCE_ASSERTIONS, leaf, state.leaves);

                    leaf.shiftStatement(createConsume(lex_name));
                } else {

                    assertion_boolean = createProductionCall(production, options);

                    leaf = addIfStatementTransition(options, group, code, assertion_boolean, FORCE_ASSERTIONS, leaf, state.leaves);
                }
                */

                break;

            case TRANSITION_TYPE.ASSERT:
            case TRANSITION_TYPE.ASSERT_PEEK:
            case TRANSITION_TYPE.ASSERT_PEEK_VP:
            case TRANSITION_TYPE.PEEK_UNRESOLVED:
            case TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS:
            case TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS:

                if (FIRST_SYMBOL_IS_A_PRODUCTION && !FIRST_SYMBOL_IS_A_PRODUCTION_TOKEN) throw new Error("WTF");

                assertion_boolean = getIncludeBooleans(<TokenSymbol[]>syms, grammar, runner, peek_name, <TokenSymbol[]>complement_symbols);

                leaf = addIfStatementTransition(options, group, code, assertion_boolean, FORCE_ASSERTIONS, leaf, state.leaves);

                break;

            case TRANSITION_TYPE.ASSERT_CONSUME:


                assertion_boolean = getIncludeBooleans(<TokenSymbol[]>syms, grammar, runner, lex_name, <TokenSymbol[]>complement_symbols);

                leaf = addIfStatementTransition(options, group, code, assertion_boolean, FORCE_ASSERTIONS, leaf, state.leaves);

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

    if (SKIP_BOOL_EXPRESSION)
        if_stmt = SC.If();


    if (
        false
        && traffic.length >= 8
        && options.VIRTUAL_LEVEL <= 0
        && breadcrumb_items.every(i => !i.atEND)
        && Math.min(...breadcrumb_items.map(i => i.len)) > 2
    ) {
        //build and implement a virtual production sequence
        const sc = new SC;

        if_stmt.addStatement(sc);

        if (transition_type == TRANSITION_TYPE.ASSERT_CONSUME)
            sc.addStatement(createConsume(rec_glob_lex_name));
        if (
            transition_type == TRANSITION_TYPE.ASSERT_CONSUME
            || transition_type == TRANSITION_TYPE.ASSERT_PRODUCTION_CALL
        ) {
            const skippable = getSkippableSymbolsFromItems(breadcrumb_items, grammar);
            sc.addStatement(createSkipCall(skippable, grammar, runner, rec_glob_lex_name, false));
            //Add peek
        }

        createVirtualProductionSequence(options, breadcrumb_items, [], sc, leaves, [], true, TRANSITION_TYPE.ASSERT, true);

    } else {


        if_stmt.addStatement(
            //`traffic: ${traffic.length} productions => ${traffic.join(" ")}`,
            //`symbols: ${group.syms.map(getUniqueSymbolName).join("  ")}`,
            runner.ANNOTATED ?
                SC.Comment("\n   " + items.map(i => (((
                    transition_type == TRANSITION_TYPE.ASSERT_CONSUME
                    || transition_type == TRANSITION_TYPE.ASSERT_PRODUCTION_CALL
                ) && !i.atEND) ? i.increment() : i)
                    .renderUnformattedWithProduction(grammar)).join("\n   ") + "\n")
                : undefined,
            modified_code,
            SC.Empty()
        );

        if_stmt.addStatement(SC.Empty());
    }



    leaf.addStatement(
        createTransitionTypeAnnotation(options, transition_types),
        if_stmt
    );

    return if_stmt;
}


