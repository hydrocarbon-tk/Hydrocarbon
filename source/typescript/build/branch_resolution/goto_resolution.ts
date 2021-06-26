/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { TokenSymbol } from "@candlelib/hydrocarbon/build/types/types/symbol";
import { sk, skRenderAsSK } from "../../skribble/skribble.js";
import { SKBlock, SKBreak, SKExpression, SKIf, SKLoop, SKMatch } from "../../skribble/types/node";
import { RenderBodyOptions } from "../../types/render_body_options";
import { TransitionClauseGenerator } from "../../types/transition_generating";
import { TransitionNode } from "../../types/transition_node.js";
import { getClosure } from "../../utilities/closure.js";
import { addSymbolAnnotationsToExpressionList, createSkipCallSk, getIncludeBooleansSk } from "../../utilities/code_generating.js";
import { getFollow } from "../../utilities/follow.js";
import { rec_glob_lex_name } from "../../utilities/global_names.js";
import { Item } from "../../utilities/item.js";
import {
    getComplementOfSymbolSets,
    getSkippableSymbolsFromItems,
    getSymbolName,
    getTokenSymbolsFromItems,
    getUniqueSymbolName,
    Symbols_Occlude,
    Sym_Is_A_Generic_Identifier,
    Sym_Is_A_Generic_Newline,
    Sym_Is_A_Generic_Number, Sym_Is_A_Generic_Symbol, Sym_Is_A_Generic_Type,
    Sym_Is_A_Space_Generic,
    Sym_Is_Defined_Identifier,
    Sym_Is_Defined_Natural_Number, Sym_Is_Defined_Symbol
} from "../../grammar/nodes/symbol.js";
import { processTransitionNodes } from "../transitions/process_transition_nodes.js";
import { yieldTransitions } from "../transitions/yield_transitions.js";
import { default_resolveBranches } from "./default_branch_resolution.js";

const SC = null;

export function resolveGOTOBranches(
    gen: TransitionClauseGenerator,
    state: TransitionNode,
    items_global: Item[],
    level: number, options: RenderBodyOptions
): SKExpression[] {

    if (state.offset == 0) {

        const
            { grammar, helper: runner, production_ids } = options,
            goto_groups = [...gen],
            WE_HAVE_JUST_ONE_GOTO_GROUP = goto_groups.length == 1;
        let
            CONTAINS_END_LEAF_THAT_SHOULD_LOOP = false,
            first_goto_group_keys: number[] = null;

        let match_stmt: SKMatch | SKExpression = <SKMatch>sk`match prod: 1:1`;

        match_stmt.matches.length = 0;

        let out: SKExpression[] = [match_stmt];

        for (const { syms, items, code, hash, leaves, prods, PUIDABLE } of goto_groups.sort(
            (a, b) => <number><any>a.syms[0] - <number><any>b.syms[0])
        ) {

            const
                keys = (<number[]><any>syms).setFilter(s => s + ""),
                active_items = items.filter(i => !i.atEND),
                end_items = items.filter(i => i.atEND),
                skippable = getSkippableSymbolsFromItems(items, grammar)
                    .filter(sym => !getFollow(keys[0], grammar).some(s => getSymbolName(s) == getSymbolName(sym)));

            leaves.map(l => l.keys = keys);

            let interrupt_statement: SKIf = null;

            if (end_items.length > 0)
                CONTAINS_END_LEAF_THAT_SHOULD_LOOP = true;

            if (active_items.length > 0) {

                /**
                 * Create look ahead for a preemptive reduce on keys that match the production id.
                 */
                if (keys.some(k => production_ids.includes(k))) {


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

                    //Use look ahead process to filter out productions that should be transitioned on. 
                    /*
                    const n = yieldTransitions(
                        items,
                        options, 0, [], false, true

                    );

                    const { code: code1, hash, leaves, prods } = processTransitionNodes(options, n, default_resolveBranches,
                        (node, nodes, options) => {
                            console.log("AAAAAAAAAA");
                        }, (item, group, options) => {
                            if (production_ids.includes(item.getProduction(grammar).id)) {
                                return {

                                    leaf: {
                                        root: [sk`test__`],
                                        leaf: [],

                                    }
                                };
                            } else
                                return {

                                    leaf: {
                                        root: [sk`test`],
                                        leaf: [],

                                    }
                                };

                        });

                    code.unshift(...code1);




                    console.log(code.map(skRenderAsSK));
                    */


                    //Ensure only items that can be reached from the root production are used
                    const active_item_closure = getClosure(active_items.filter(i => production_ids.includes(i.getProduction(grammar).id)), grammar, true);

                    // All symbols from items that can be shifted from the current closure
                    const active_symbols = getTokenSymbolsFromItems(active_item_closure, grammar);

                    //All Symbols that follow the current shifted production(s)
                    const follow = keys.flatMap(k => getFollow(k, grammar)).setFilter(sym => getUniqueSymbolName(sym));

                    const unique_candidates = getComplementOfSymbolSets(follow, active_symbols),
                        checked_symbols: TokenSymbol[] = [],
                        GEN_SYM = active_symbols.some(Sym_Is_A_Generic_Symbol),
                        GEN_ID = active_symbols.some(Sym_Is_A_Generic_Identifier),
                        GEN_NUM = active_symbols.some(Sym_Is_A_Generic_Number),
                        CONTAINS_WS = unique_candidates.some(Sym_Is_A_Space_Generic) || !skippable.some(Sym_Is_A_Space_Generic),
                        CONTAINS_NL = unique_candidates.some(Sym_Is_A_Generic_Newline) || !skippable.some(Sym_Is_A_Generic_Newline),
                        GEN_NL_WS = CONTAINS_NL || CONTAINS_WS;


                    for (const s of unique_candidates) {

                        if (Sym_Is_A_Generic_Newline(s) || Sym_Is_A_Space_Generic(s))
                            checked_symbols.push(s);
                        else if (Sym_Is_A_Generic_Type(s))
                            continue;
                        else if (Sym_Is_Defined_Symbol(s)) {
                            if (GEN_SYM || active_symbols.some(a => Symbols_Occlude(s, a) && a.val.length < s.val.length)) checked_symbols.push(s);
                        } else if (Sym_Is_Defined_Identifier(s) && !GEN_NL_WS) {
                            if (GEN_ID || active_symbols.some(a => Symbols_Occlude(s, a))) checked_symbols.push(s);
                        } else if (Sym_Is_Defined_Natural_Number(s) && !GEN_NL_WS) {
                            if (GEN_NUM || active_symbols.some(a => Symbols_Occlude(s, a))) checked_symbols.push(s);
                        }
                    }

                    if (checked_symbols.length > 0) {

                        const
                            booleans = getIncludeBooleansSk(checked_symbols, options, rec_glob_lex_name, active_symbols);

                        if (booleans) {
                            interrupt_statement = <SKIf>sk`if ${booleans} : { return : ${keys[0]} }`;
                        }
                    }
                }


            } else if (skippable.length > 0 && active_items.length == 0) {
                const skip = createSkipCallSk(skippable, options, "l", false);
                if (skip) {
                    code.unshift(skip);
                }
            }


            if (interrupt_statement)
                insertInterruptStatement(interrupt_statement, code);

            if (!WE_HAVE_JUST_ONE_GOTO_GROUP)
                code.push(<SKBreak>sk`break`);


            const match_clause = (<SKMatch>sk`match 1 : ${keys.join(",")}: ${(<SKBlock>{
                type: "block",
                expressions: code
            })
                }`).matches[0];


            (<SKMatch>match_stmt).matches.push(match_clause);

            if (WE_HAVE_JUST_ONE_GOTO_GROUP) {
                first_goto_group_keys = keys;
                out = (<SKBlock>(<SKMatch>match_stmt).matches[0].expression).expressions;
            }
        }

        if (CONTAINS_END_LEAF_THAT_SHOULD_LOOP) {
            return [<SKLoop>sk`loop (1){
                ${match_stmt};
                break;
            }`];
        } else if (!WE_HAVE_JUST_ONE_GOTO_GROUP) {
            const match_clause = (<SKMatch>sk`match 1 : default:break`).matches[0];
            (<SKMatch>match_stmt).matches.push(match_clause);
        }


        return out;
    }

    return default_resolveBranches(gen, state, items_global, level, options/*, state.offset <= 1*/);
}

export function addClauseSuccessCheck(options: RenderBodyOptions): SKExpression {
    const { productions } = options;

    return <SKExpression>sk`return : (prod ~= ${productions[0].id}) ? prod ? -1`;
}

function insertInterruptStatement(int_stmt: SKExpression, expression_array: SKExpression[]) {
    //The interrupt needs to be added after the first skip statement if present
    for (let i = 0; i < expression_array.length; i++) {
        const node = expression_array[i];
        if (node.type == "call" && node.reference.type == "reference" && node.reference.value.slice(0, 4) == "skip") {
            expression_array.splice(i + 1, 0, int_stmt);
            return;
        }
    }

    expression_array.unshift(int_stmt);
}