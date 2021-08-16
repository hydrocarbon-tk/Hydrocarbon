/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    Defined_Symbols_Occlude,
    getTrueSymbolValue,
    getUniqueSymbolName,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token,
    Sym_Is_Empty,
    getRootSym,
    Sym_Is_EOP,
    Sym_Is_Not_Consumed
} from "../../grammar/nodes/symbol.js";
import { sk } from "../../skribble/skribble.js";
import { SKBlock, SKExpression, SKIf, SKMatch, SKReturn } from "../../skribble/types/node";
import { HCG3Grammar, HCG3Symbol, TokenSymbol } from "../../types/grammar_nodes";
import { RenderBodyOptions } from "../../types/render_body_options";
import { TransitionClauseGenerator, TransitionGroup } from "../../types/transition_generating";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import {
    addItemAnnotationToExpressionList,
    addSymbolAnnotationsToExpressionList,
    createBranchFunction, createConsumeSk,
    createScanFunctionCall,

    getIncludeBooleans, getProductionFunctionNameSk
} from "../../utilities/code_generating.js";
import { createTransitionTypeAnnotation } from "../../utilities/create_transition_type_annotation.js";
import { Item } from "../../utilities/item.js";

/**
 * Handles intermediate state transitions. 
 */
export function default_resolveBranches(
    gen: TransitionClauseGenerator,
    state: TransitionNode,
    items: Item[],
    level: number,
    options: RenderBodyOptions,
    FORCE_ASSERTIONS: boolean = false
): SKExpression[] {

    let
        { grammar, helper: runner } = options,

        groups = [...gen],
        all_syms = groups.flatMap(({ syms }) => syms).setFilter(getUniqueSymbolName);

    let root: SKExpression[] = [];


    if (groups.length == 1
        && !FORCE_ASSERTIONS
        && (groups[0].transition_types.includes(TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS)))
        return groups[0].code;

    if (options.helper.ANNOTATED) {
        addItemAnnotationToExpressionList(items, grammar, root);
        addSymbolAnnotationsToExpressionList(all_syms, grammar, root, "offset " + state.offset);
    }

    const peek_name = addScanStatement(options, state, root, "l", "l", groups, all_syms);

    root = createIfElseExpressions(options, state, groups, root, "l", peek_name, all_syms, FORCE_ASSERTIONS);

    return root;
}

function addScanStatement(
    options: RenderBodyOptions,
    state: TransitionNode,
    root: SKExpression[],
    lex_name: string,
    peek_name: string,
    groups: TransitionGroup[],
    all_syms: TokenSymbol[]

) {
    all_syms = all_syms.map(sym => getRootSym(sym, options.grammar)).filter(s => !Sym_Is_EOP(s) && s.type != "hybrid");
    const items = groups.flatMap(i => i.t_items).setFilter().map(g => Item.fromString(g));

    if (Every_Transition_Does_Not_Require_A_Skip(groups)) {

        if (groups.every(g => g.transition_types[0] == TRANSITION_TYPE.ASSERT_END) && groups.length > 1) {

            root.push(createScanFunctionCall(items, options, "l", false, all_syms));
        }

        return lex_name;
    }

    const offset = options.scope == "GOTO" ? state.offset : state.offset;

    if (options.helper.ANNOTATED)
        addItemAnnotationToExpressionList(items, options.grammar, root);

    if (state.peek_level >= 0) {

        if (offset > 0 && state.peek_level == 0) {

            root.push(createScanFunctionCall(items, options, lex_name, false, all_syms));

        } else if (state.peek_level >= 1) {

            peek_name = "pk";

            if (state.peek_level == 1)
                root.push(<SKExpression>sk`[mut] pk:Lexer = ${lex_name}.copyInPlace()`);

            root.push(createScanFunctionCall(items, options, "pk.next(data)", true, all_syms));
        }
    } else if (offset == 1 && options.scope == "GOTO") {

        root.push(createScanFunctionCall(items, options, "l", false, all_syms));

    } else if (state.peek_level < 0 && offset > 0) {

        root.push(createScanFunctionCall(state.items, options, "l", false, all_syms));
    }
    return peek_name;
}

function Every_Transition_Does_Not_Require_A_Skip(groups: TransitionGroup[]) {
    return groups.every(g => g.transition_types.every(t => t == TRANSITION_TYPE.POST_PEEK_CONSUME || t == TRANSITION_TYPE.ASSERT_END));
}

function createIfElseExpressions(
    options: RenderBodyOptions,
    state: TransitionNode,
    groups: TransitionGroup[],
    root: SKExpression[],
    lex_name: string,
    peek_name: string,
    all_syms: HCG3Symbol[],
    FORCE_ASSERTIONS: boolean,
): SKExpression[] {

    let expressions = root, last_if: SKIf = null;

    const last_group_index = groups.filter(g => g.transition_types[0] !== TRANSITION_TYPE.IGNORE).length - 1;

    function addIf(_if: SKIf) {

        if (last_if) {
            last_if.else = _if;
        } else {
            expressions.push(_if);
        }
        last_if = _if;
    }

    const { grammar } = options;

    for (let i = 0; i < groups.length; i++) {


        const
            group = groups[i],

            { syms, transition_types, code, items, leaves } = group;

        let assertion_boolean: SKExpression = null;

        const
            transition_type: TRANSITION_TYPE = transition_types[0],
            FIRST_SYMBOL_IS_A_PRODUCTION = Sym_Is_A_Production(syms[0]),
            FIRST_SYMBOL_IS_A_PRODUCTION_TOKEN = Sym_Is_A_Production_Token(syms[0]);

        switch (transition_type) {

            case TRANSITION_TYPE.ASSERT_END:

                if (i == last_group_index) {
                    addIf({
                        type: "block",
                        expressions: code
                    });
                } else {

                    assertion_boolean = getIncludeBooleans(syms, grammar);

                    addIf(createIfStatementTransition(options, group, code, assertion_boolean, FORCE_ASSERTIONS, "Assert End"));
                }
                break;

            case TRANSITION_TYPE.ASSERT_PRODUCTION_CALL:

                const production = grammar.productions[group.items[0].sym(grammar).val];

                options.called_productions.add(<number>production.id);

                const call_name = createBranchFunction(code, options);
                expressions.push(<SKExpression>sk`pushFN(data, &> ${call_name}, data.rules_ptr)`);

                expressions.push(<SKReturn>sk`return: ${getProductionFunctionNameSk(production, grammar)}(l, data,db,state,data.rules_ptr,prod_start);`);
                leaves.forEach(leaf => leaf.INDIRECT = true);

                if (code.slice(-1)[0].type !== "return")
                    code.push(<SKExpression>sk`return:-1`);

                break;

            case TRANSITION_TYPE.ASSERT:
            case TRANSITION_TYPE.ASSERT_PEEK:
            case TRANSITION_TYPE.ASSERT_PEEK_VP:
            case TRANSITION_TYPE.PEEK_UNRESOLVED:
            case TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS:
            case TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS:

                if (FIRST_SYMBOL_IS_A_PRODUCTION && !FIRST_SYMBOL_IS_A_PRODUCTION_TOKEN) throw new Error("WTF");

                assertion_boolean = getIncludeBooleans(<TokenSymbol[]>syms, grammar, peek_name);

                let scr = code;

                if (items.length == 1) {

                    const nc = [];

                    const continue_name = createBranchFunction(nc, options);

                    scr.unshift(<SKExpression>sk`pushFN(data, &> ${continue_name}, 0)`);

                    leaves[0].leaf.push(<SKReturn>sk`return:prod_start`);

                    leaves.forEach(l => l.transition_type == TRANSITION_TYPE.IGNORE);
                    leaves[0].leaf = nc;

                    leaves[0].INDIRECT = true;
                    leaves[0].transition_type = TRANSITION_TYPE.ASSERT;

                    if (code.slice(-1)[0].type !== "return")
                        code.push(<SKExpression>sk`return:-1`);
                    if (state.peek_level > 0)
                        code.unshift(<SKExpression>sk`l._type = ${group.root_id}`);
                }

                if (
                    i == last_group_index
                    &&
                    last_group_index > 0
                    &&
                    Group_Allows_Unchecked(group, state, options)
                    &&
                    !all_syms.some(Sym_Is_Empty)
                ) {
                    addIf({
                        type: "block",
                        expressions: scr
                    });
                } else {

                    addIf(createIfStatementTransition(options, group, scr, assertion_boolean, FORCE_ASSERTIONS, "Asserts"));
                }

                break;

            case TRANSITION_TYPE.POST_PEEK_CONSUME:

                code.unshift(...expressions);

                if (options.helper.ANNOTATED)
                    code.unshift(createTransitionTypeAnnotation(options, transition_types));

                code.unshift(createConsumeSk(lex_name));

                shiftNonConsumeExpression(code, syms, grammar, lex_name);

                expressions = code;
                break;

            case TRANSITION_TYPE.ASSERT_CONSUME:

                assertion_boolean = getIncludeBooleans(<TokenSymbol[]>syms, grammar, lex_name);

                code.unshift(createConsumeSk("l"));

                shiftNonConsumeExpression(code, syms, grammar, lex_name);

                addIf(createIfStatementTransition(options, group, code, assertion_boolean, FORCE_ASSERTIONS, "Assert Consume"));

                break;

            case TRANSITION_TYPE.IGNORE: break;
        }
    }

    return expressions;

}

function shiftNonConsumeExpression(sk_expr_list: SKExpression[], syms: TokenSymbol[], grammar: HCG3Grammar, lex_name: string = "l") {
    const non_consume = syms.filter(Sym_Is_Not_Consumed);

    if (non_consume.length > 0) {
        if (non_consume.length == syms.length) {
            sk_expr_list.unshift(<SKExpression>sk`${lex_name}.setToken(${lex_name}._type, 0, 0)`);
        } else {
            sk_expr_list.unshift(<SKExpression>sk`if (${getIncludeBooleans([sym], grammar, lex_name)}) : ${lex_name}.setToken(${lex_name}._type, 0, 0);`);
        }
    }
}

function Group_Allows_Unchecked(group: TransitionGroup, state: TransitionNode, options: RenderBodyOptions): boolean {

    const { transition_types } = group;

    const [transition_type] = transition_types;

    return (
        transition_type == TRANSITION_TYPE.PEEK_UNRESOLVED
        ||
        transition_type == TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS
        ||
        transition_type == TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS
        ||
        (
            transition_type == TRANSITION_TYPE.ASSERT_PEEK
            &&
            state.peek_level >= 1
        )
    )
        &&
        (options.scope != "GOTO" || state.offset > 1);
}



function createIfStatementTransition(
    options: RenderBodyOptions,
    group: TransitionGroup,
    modified_code: SKExpression[],
    boolean_assertion: SKExpression,
    FORCE_ASSERTIONS: boolean,
    ShiftComment: string = ""
): SKIf {

    const { grammar } = options;
    let { syms } = group;

    let if_stmt = <SKIf>sk`if ${boolean_assertion}: ${(<SKBlock>{
        type: "block",
        expressions: modified_code
    })

        }`;

    if (options.helper.ANNOTATED)
        addSymbolAnnotationsToExpressionList(syms, grammar, modified_code, ShiftComment);

    return if_stmt;
}


