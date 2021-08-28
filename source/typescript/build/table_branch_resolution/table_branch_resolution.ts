/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { ttt } from "../../utilities/transition_type_to_string.js";
import { convertSymbolToString, getFollowSymbolsFromItems, getRootSym, getSkippableSymbolsFromItems, getSymbolsFromClosure, getTokenSymbolsFromItems, getTrueSymbolValue, getUniqueSymbolName, Sym_Is_EOP } from "../../grammar/nodes/symbol.js";
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
import { getClosure, getFollowClosure } from "../../utilities/closure.js";
import { default_EOP } from 'source/typescript/grammar/nodes/default_symbols.js';

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

    let code = (`state [${hash}] /* peek_level: ${state.peek_level} ${state.goto_prod_id} */\n\n`);

    let lexer_state = "assert";

    if (state.peek_level > 0) {
        lexer_state = "peek";
    }

    const branches = [];
    let i = 0;

    const none_end_items_symbol_ids = new Set(nodes.filter(t => t.transition_types[0] != TRANSITION_TYPE.ASSERT_END).flatMap(t => t.syms.flatMap(i => i.id)));

    for (const { syms, items, hash, transition_types } of nodes) {

        if (transition_types[0] == TRANSITION_TYPE.ASSERT_PRODUCTION_CALL && nodes.length == 1) {

            const production_name = options.grammar.productions[syms[0].val].name;

            branches.push(`
            
                /*  ${ttt(transition_types[0])}

                =================================================================================
                    ${items.map(i => i.renderUnformattedWithProduction(options.grammar)).join("\n    ")}
                */

                goto state [${production_name}] then goto state[${hash}]
            `);
        } else {



            if (transition_types[0] == TRANSITION_TYPE.IGNORE || hash == "ignore")
                continue;

            let local_lexer_state = lexer_state;

            if (
                (transition_types[0] == TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS
                    ||
                    transition_types[0] == TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS)
                &&
                state.peek_level <= 0
            ) local_lexer_state = "assert";

            if (
                transition_types[0] == TRANSITION_TYPE.ASSERT_CONSUME
                ||
                transition_types[0] == TRANSITION_TYPE.POST_PEEK_CONSUME
            ) local_lexer_state = "consume";



            let symbol_ids = null;

            if (
                transition_types[0] == TRANSITION_TYPE.ASSERT_END
            ) {
                symbol_ids =
                    syms.filter(s => !Sym_Is_EOP(s) && !none_end_items_symbol_ids.has(s.id))
                        .map(s => getRootSym(s, options.grammar))
                        .map(convert_sym_to_code)
                        .setFilter();
                if (i == nodes.length - 1)
                    symbol_ids.push(`9999 /*default branch*/`);
            } else symbol_ids =
                syms.filter(s => !Sym_Is_EOP(s))
                    .map(s => getRootSym(s, options.grammar))
                    .map(convert_sym_to_code)
                    .setFilter();

            branches.push(`

    /* ${ttt(transition_types[0])}
    ${items.map(i => i.renderUnformattedWithProduction(options.grammar)).join("\n    ").replace(/\*\//g, "asterisk/")}
    */
    
    ${local_lexer_state}[${symbol_ids.join(" ")} ]\n        (goto state[${hash}])`);
            i++;
        }
    }

    code += "    " + branches.join("\n\n    ");

    code = add_symbol_clause(items, prods, options, code);


    options.table.map.set(hash, code);
    options.table.entries.push(code);

    state.hash = hash;

    return [<SKExpression>sk`a`];
}


export function add_symbol_clause(items: Item[], prods: number[], options: RenderBodyOptions, code: string) {
    const expected_symbols = getSymbolsFromClosure([
        ...items.flatMap(i => i.atEND ? getFollowClosure([i], options.grammar.lr_items, options.grammar) : getClosure([i], options.grammar, false)),
        ...prods.flatMap(i => options.grammar.productions[i].bodies).map(b => new Item(b.id, b.length, b.length)),
    ], options.grammar).setFilter(getUniqueSymbolName);

    const skipped_symbols = getSkippableSymbolsFromItems(getFollowClosure(
        [...items,

        ...(options.scope == "GOTO"
            ? prods.flatMap(i => options.grammar.productions[i].bodies).map(b => new Item(b.id, b.length, b.length))
            : [])
        ],
        options.grammar.lr_items,
        options.grammar
    ), options.grammar);

    code += `
        
    symbols: 
        expected[${expected_symbols.map(convert_sym_to_code).join("   ")}]`;

    if (skipped_symbols.length > 0)
        code += `\n        skipped[${skipped_symbols.map(convert_sym_to_code).join("   ")}]`;
    return code;
}

export function convert_sym_to_code(sym, ..._) {

    return `${sym.id} /* ${convertSymbolToString(sym).replace(/\*\//g, "asterisk/")} */`;
};
