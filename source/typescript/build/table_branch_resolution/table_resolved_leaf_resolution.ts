/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { convertSymbolToString, getRootSym, getUniqueSymbolName, Sym_Is_A_Production } from "../../grammar/nodes/symbol.js";
import { HCG3Grammar } from "../../types/grammar_nodes.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { SingleItemReturnObject } from "../../types/transition_generating";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { hashString } from "../../utilities/code_generating.js";
import { Item } from "../../utilities/item.js";
import { Some_Items_Are_In_Extended_Goto } from "../transitions/yield_transitions.js";
import { add_symbol_clause, convert_sym_to_code } from './table_branch_resolution.js';

let grammar: HCG3Grammar = null;

export function table_resolveResolvedLeaf(item: Item, state: TransitionNode, options: RenderBodyOptions): SingleItemReturnObject {

    grammar = options.grammar;

    if (Some_Items_Are_In_Extended_Goto([item], options) && false) {
        state.transition_type = TRANSITION_TYPE.IGNORE;
        return {
            leaf: {
                root: [],
                leaf: [],
                prods: options.production_ids.slice(),
                original_prods: [],
                hash: "",
                transition_type: TRANSITION_TYPE.IGNORE
            }
        };
    }

    // The state should be ignored do something

    const hash = renderItem(item, options);

    return {
        leaf: {
            hash: hash,
            leaf: [],
            root: [],
            original_prods: [],
            transition_type: state.transition_type,
            EMPTY: false,
            INDIRECT: false,
            keys: [],
            prods: options.production_ids.slice()
        }
    };
}

function renderItem(item: Item, options: RenderBodyOptions): string {

    let hash = "----", code = "";

    const { grammar } = options;

    if (item.atEND) {

        const body = item.body_(grammar);

        let hash_basis = "";

        const set_prod_clause = `set prod to ${body.production.id}`;

        if (body.reduce_id >= 0)
            hash_basis = `reduce ${item.len} ${body.reduce_id}\n    then ${set_prod_clause}`;
        else if (item.len > 1)
            hash_basis = `reduce ${item.len} 0\n    then ${set_prod_clause}`;
        else
            hash_basis = `${set_prod_clause}`;

        hash = hashString(hash_basis).slice(0, 8);

        code = `state [${hash}]\n    ${hash_basis}`;

    } else {
        const sym = item.sym(grammar);

        const next_state = renderItem(item.increment(), options);

        if (Sym_Is_A_Production(sym)) {
            const cardinal = getRootSym(sym, grammar);
            const hash_basis = `goto state [${cardinal.production.name}] then goto state [${next_state}]`;
            hash = hashString(hash_basis).slice(0, 8);
            code = `state [${hash}] ${hash_basis} `;
        } else {

            const hash_basis = `consume [${convert_sym_to_code(sym)}] ( goto state [${next_state}] )`;

            hash = hashString(hash_basis).slice(0, 8);

            code = `state [${hash}] \n    ${hash_basis}`;

            code = add_symbol_clause([item], [item.getProduction(grammar).id], options, code);
        }
    }

    options.table.map.set(hash, code);
    options.table.entries.push(code);

    return hash;

}