/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    getSkippableSymbolsFromItems,
    getSymbolName
} from "../../grammar/nodes/symbol.js";
import { sk } from "../../skribble/skribble.js";
import { SKBlock, SKBreak, SKExpression, SKLoop, SKMatch } from "../../skribble/types/node";
import { RenderBodyOptions } from "../../types/render_body_options";
import { TransitionClauseGenerator } from "../../types/transition_generating";
import { TransitionNode } from "../../types/transition_node.js";
import { getClosure } from "../../utilities/closure.js";
import { createScanFunctionCall } from "../../utilities/code_generating.js";
import { getFollow } from "../../utilities/follow.js";
import { Item } from "../../utilities/item.js";
import { default_resolveBranches } from "./default_branch_resolution.js";


export function resolveGOTOBranches(
    gen: TransitionClauseGenerator,
    state: TransitionNode,
    items_global: Item[],
    level: number, options: RenderBodyOptions
): SKExpression[] {

    if (state.offset == 0) {
        const
            { grammar, production_ids } = options,
            goto_groups = [...gen],
            WE_HAVE_JUST_ONE_GOTO_GROUP = goto_groups.length == 1;
        let
            CONTAINS_END_LEAF_THAT_SHOULD_LOOP = false;

        let match_stmt: SKMatch | SKExpression = <SKMatch>sk`match prod: 1:1`;

        match_stmt.matches.length = 0;

        let out: SKExpression[] = [match_stmt];

        for (const { syms, items, code, hash, leaves, prods } of goto_groups.sort(
            (a, b) => <number><any>a.syms[0] - <number><any>b.syms[0])
        ) {

            const
                keys = (<number[]><any>syms).setFilter(s => s + ""),
                active_items = items.filter(i => !i.atEND),
                end_items = items.filter(i => i.atEND),
                skippable = getSkippableSymbolsFromItems(items, grammar)
                    .filter(sym => !getFollow(keys[0], grammar).some(s => getSymbolName(s) == getSymbolName(sym)));

            leaves.map(l => l.keys = keys);

            let production_aware_scan: SKExpression = null;

            if (end_items.length > 0)
                CONTAINS_END_LEAF_THAT_SHOULD_LOOP = true;
            /**
             * Create look ahead for a preemptive reduce on keys that match the production id.
             */
            if (keys.some(k => production_ids.includes(k))) {

                //Ensure only items that can be reached from the root production are used
                const item_closure = getClosure([
                    ...items,
                    ...keys.flatMap(i => grammar.productions[i].bodies).map(b => new Item(b.id, b.length, b.length)),
                ], grammar);

                production_aware_scan = createScanFunctionCall(item_closure, options, undefined, undefined, keys.flatMap(i => getFollow(i, grammar)));
            }

            if (production_aware_scan)
                insertProductionAwareScan(production_aware_scan, code);

            if (!WE_HAVE_JUST_ONE_GOTO_GROUP)
                code.push(<SKBreak>sk`break`);

            const match_clause = (<SKMatch>sk`match 1 : ${keys.join(",")}: ${(<SKBlock>{
                type: "block",
                expressions: code
            })}`).matches[0];

            (<SKMatch>match_stmt).matches.push(match_clause);

            if (WE_HAVE_JUST_ONE_GOTO_GROUP)

                out = (<SKBlock>(<SKMatch>match_stmt).matches[0].expression).expressions;
        }


        const match_clause = (<SKMatch>sk`match prod : default:break`).matches[0];
        (<SKMatch>match_stmt).matches.push(match_clause);


        if (CONTAINS_END_LEAF_THAT_SHOULD_LOOP) {
            return [<SKLoop>sk`loop (true){
                ${match_stmt};
                break;
            }`];
        }

        return out;
    }

    return default_resolveBranches(gen, state, items_global, level, options/*, state.offset <= 1*/);
}

export function addClauseSuccessCheck(options: RenderBodyOptions): SKExpression {
    const { productions } = options;

    return <SKExpression>sk`return : (prod ~= ${productions[0].id}) ? prod ? -1`;
}

function insertProductionAwareScan(production_aware_scan: SKExpression, expression_array: SKExpression[]) {
    //The production aware scan needs to replace the first scan call or be added to top of expression list
    for (let i = 0; i < expression_array.length; i++) {
        const node = expression_array[i];
        if (node.type == "call" && node.reference.type == "reference" && node.reference.value.slice(0, 4) == "scan") {
            expression_array[i] = production_aware_scan;
            return;
        }
    }

    expression_array.unshift(production_aware_scan);
}