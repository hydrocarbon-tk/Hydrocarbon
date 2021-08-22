/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { ttt } from "../../utilities/transition_type_to_string.js";
import { convertSymbolToString, getSkippableSymbolsFromItems, getSymbolsFromClosure, getTokenSymbolsFromItems, getUniqueSymbolName } from "../../grammar/nodes/symbol.js";
import { sk } from "../../skribble/skribble.js";
import { SKExpression } from "../../skribble/types/node";
import { RenderBodyOptions } from "../../types/render_body_options";
import { TransitionClauseGenerator } from "../../types/transition_generating";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import {
    hashString
} from "../../utilities/code_generating.js";
import { Item } from "../../utilities/item.js";
import { Some_Items_Are_In_Extended_Goto } from "../transitions/yield_transitions.js";
import { getClosure } from "../../utilities/closure.js";

/**
 * Handles intermediate state transitions. 
 */
export function table_resolveBranches(
    gen: TransitionClauseGenerator,
    state: TransitionNode,
    items: Item[],
    level: number,
    options: RenderBodyOptions,
    FORCE_ASSERTIONS: boolean = false
): SKExpression[] {

    //Remove extended goto items

    //Convert this into a state table

    if (items.every(i => Some_Items_Are_In_Extended_Goto([i], options))) {
        state.transition_type == TRANSITION_TYPE.IGNORE;
        state.hash = "ignore";
        return [];
    }

    const nodes = [...gen];//.filter(node => node.hash != "ignore");

    const prods = nodes.flatMap(n => n.prods).setFilter();
    let symbols = nodes.flatMap(n => n.syms).setFilter(getUniqueSymbolName);

    const sym_to_state_map = nodes.flatMap(node => node.syms.map(sym => ({ sym, node })));

    const hash = hashString(nodes.map(n => n.hash).sort().join("-----------------------------")).slice(0, 8);

    console.log(`\nstate [${hash}] ${nodes.length}pl ${state.peek_level} consider ${sym_to_state_map.length} symbols\n`);

    console.log("       " + items.map(i => i.renderUnformattedWithProduction(options.grammar)).join("\n       "));

    let lexer = "lex";

    if (state.peek_level > 0) {
        lexer = "pk";
    }

    for (const { syms, items, hash, transition_types } of nodes) {

        if (transition_types[0] == TRANSITION_TYPE.IGNORE || hash == "ignore")
            continue;

        console.log(`\n    - ${ttt(transition_types[0])} ${lexer}.type is one of:  \n          [ ${syms.map(convertSymbolToString).setFilter().sort().join(" ")} ]\n      then goto state [${hash}]`);

    }

    if (options.scope == "GOTO" && state.offset == 1 && options.production_ids.some(i => prods.includes(i))) {
        console.log("\n    - otherwise skip goto");

        const item_closure = getClosure([
            ...items,
            ...prods.flatMap(i => options.grammar.productions[i].bodies).map(b => new Item(b.id, b.length, b.length)),
        ], options.grammar);

        symbols = [...symbols, ...getTokenSymbolsFromItems(item_closure, options.grammar), ...getSkippableSymbolsFromItems(item_closure, options.grammar)].setFilter(getUniqueSymbolName);
    }


    console.log(`\n    -- checked symbols [ ${symbols.map(convertSymbolToString).join(" ")} ]`);


    console.log("------\n\n");


    //Check to see if peek flag is active and whether we need to do a shift before checking the 

    //

    state.hash = hash;


    return [<SKExpression>sk`a`];
}
