/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { getRootSym, Sym_Is_EOP } from "../../grammar/nodes/symbol.js";
import { sk } from "../../skribble/skribble.js";
import { SKExpression } from "../../skribble/types/node";
import { RenderBodyOptions } from "../../types/render_body_options";
import { TransitionClauseGenerator, TransitionGroup } from "../../types/transition_generating";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import {
    hashString
} from "../../utilities/code_generating.js";
import { Item } from "../../utilities/item.js";
import { ttt } from "../../utilities/transition_type_to_string.js";
import { Some_Items_Are_In_Extended_Goto } from "../transitions/yield_transitions.js";
import { convert_sym_to_code, create_symbol_clause } from './create_symbol_clause.js';

/**
 * Handles intermediate state transitions. 
 */
export function table_resolveBranches(
    gen: TransitionClauseGenerator,
    state: TransitionNode,
    items: Item[],
    level: number,
    options: RenderBodyOptions
): SKExpression[] {

    //Remove extended goto items

    //Convert this into a state table

    if (items.every(i => Some_Items_Are_In_Extended_Goto([i], options))) {
        state.transition_type == TRANSITION_TYPE.IGNORE;
        state.hash = "ignore";
        return [];
    }

    const
        nodes = [...gen],

        { prods, closure } = state,

        branches = [];

    let
        hash_string = "", //items.map(i => i.id).join("--"),

        code = "",

        lexer_state = "assert";


    if (state.peek_level > 0)
        lexer_state = "peek";

    const none_end_items_symbol_ids = new Set(nodes.filter(t => t.transition_types[0] != TRANSITION_TYPE.ASSERT_END).flatMap(t => t.syms.flatMap(i => i.id)));

    for (const transition_group of nodes.filter(i => !Some_Items_Are_In_Extended_Goto(i.items, options))) {

        const { syms, closure, items, hash, transition_types, LAST, FIRST }: TransitionGroup = transition_group;

        if (transition_types[0] == TRANSITION_TYPE.ASSERT_PRODUCTION_CALL && nodes.length == 1) {

            const production_name = options.grammar.productions[syms[0].val].name;

            branches.push(`/*  
        ${ttt(transition_types[0])}

        =================================================================================
            ${items.map(i => i.renderUnformattedWithProduction(options.grammar)).join("\n        ")}
    */

    goto state [${production_name}] then goto state[${hash}]`);

            hash_string += `goto state [${production_name}] then goto state[${hash}]`;
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
                if (LAST)
                    symbol_ids.push(`9999 /*default branch*/`);
            } else symbol_ids =
                syms.filter(s => !Sym_Is_EOP(s))
                    .map(s => getRootSym(s, options.grammar))
                    .map(convert_sym_to_code)
                    .setFilter();

            branches.push(`/* 
    ${ttt(transition_types[0])}

        Root Items:
        ${items.map(i => i.renderUnformattedWithProduction(options.grammar)).join("\n        ").replace(/\*\//g, "asterisk/")}

        Peek Closure:
        ${closure.map(i => i.renderUnformattedWithProduction(options.grammar)).join("\n        ").replace(/\*\//g, "asterisk/")}

    */
    
    ${local_lexer_state}[${symbol_ids.join(" ")} ]\n        (goto state[${hash}])`);
            hash_string += `${local_lexer_state}[${symbol_ids.join(" ")} ]\n        (goto state[${hash}])`;
        }
    }

    code += "    " + branches.join("\n    ");

    code += create_symbol_clause(closure, prods, options);

    const hash = hashString(hash_string);

    code = (`state [${hash}] /* peek_level: ${state.peek_level} */\n\n`) + code;

    options.table.map.set(hash, code);

    options.table.entries.push(code);

    state.hash = hash;

    return [<SKExpression>sk`a`];
}



