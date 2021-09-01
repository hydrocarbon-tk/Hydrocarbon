/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { getRootSym, Sym_Is_EOP, Sym_Is_Not_Consumed } from "../../grammar/nodes/symbol.js";
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
import { convert_sym_to_code, create_symbol_clause, create_symbol_comment } from './create_symbol_clause.js';

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

    const
        nodes = [...gen],

        { prods, closure, items: root_items } = state,

        branches = [];

    let
        hash_string = "",

        code = "",

        lexer_state = "assert",

        header = "",
        active_nodes = nodes.filter(i => !Some_Items_Are_In_Extended_Goto(i.items, options));

    if (active_nodes.length == 0 || items.every(i => Some_Items_Are_In_Extended_Goto([i], options))) {
        state.transition_type == TRANSITION_TYPE.IGNORE;
        state.hash = "ignore";
        return [];
    }

    if (state.peek_level > 0)
        lexer_state = "peek";

    const none_end_items_symbol_ids = new Set(nodes.filter(t => t.transition_types[0] != TRANSITION_TYPE.ASSERT_END).flatMap(t => t.syms.flatMap(i => i.id)));

    for (const transition_group of active_nodes) {

        const { syms, closure, items, hash, transition_types, LAST, FIRST }: TransitionGroup = transition_group;


        if (transition_types[0] == TRANSITION_TYPE.IGNORE || hash == "ignore")
            continue;

        if (transition_types[0] == TRANSITION_TYPE.ASSERT_PRODUCTION_CALL && nodes.length == 1) {

            const production_name = options.grammar.productions[syms[0].val].name;
            header += ` 
            ${ttt(transition_types[0])}
    
            =================================================================================
                ${items.map(i => i.renderUnformattedWithProduction(options.grammar)).join("\n        ")}
        
            `;
            branches.push(`

    goto state [${production_name}] then goto state[${hash}]`);

            hash_string += `goto state [${production_name}] then goto state[${hash}]`;
        } else {


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
            ) {
                if (syms.length == 1 && Sym_Is_Not_Consumed(syms[0]))
                    local_lexer_state = "noconsume";
                else
                    local_lexer_state = "consume";
            }

            let symbols = null;

            if (
                transition_types[0] == TRANSITION_TYPE.ASSERT_END
            ) {
                symbols =
                    syms.filter(s => !Sym_Is_EOP(s) && !none_end_items_symbol_ids.has(s.id))
                        .map(s => getRootSym(s, options.grammar))
                        .map(convert_sym_to_code)
                        .setFilter();
                if (LAST)
                    symbols.push(`9999`);
            } else symbols =
                syms.filter(s => !Sym_Is_EOP(s))
                    .map(s => getRootSym(s, options.grammar))
                    .map(convert_sym_to_code)
                    .setFilter();

            header += `
    ${ttt(transition_types[0])}

        Root Items:
        ${items.map(i => i.renderUnformattedWithProduction(options.grammar)).join("\n        ").replace(/\*\//g, "asterisk/")}

        Peek Closure:
        ${closure.map(i => i.renderUnformattedWithProduction(options.grammar)).join("\n        ").replace(/\*\//g, "asterisk/")}

             `;

            branches.push(`
    ${local_lexer_state}[${symbols.join(" ")} ]\n        (goto state[${hash}])`);
            hash_string += `${local_lexer_state}[${symbols.join(" ")} ]\n        (goto state[${hash}])`;
        }
    }

    code += "    " + branches.join("\n    ");

    const symbol_clause = create_symbol_clause(closure.concat(state.peek_level <= 0 ? root_items : []), prods, options);

    hash_string += symbol_clause;

    code += symbol_clause;

    const hash = hashString(hash_string);

    code = (`state [${hash}] /* peek_level: ${state.peek_level} */\n\n`) + `/*\n${header}\n*/` + "\n\n" + code;

    options.table.map.set(hash, code);

    options.table.entries.push(code);

    state.hash = hash;

    return [<SKExpression>sk`a`];
}



