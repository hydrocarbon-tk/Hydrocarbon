/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { getRootSym, Sym_Is_A_Production, Sym_Is_A_Token, Sym_Is_Not_Consumed } from "../../grammar/nodes/symbol.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { SingleItemReturnObject } from "../../types/transition_generating";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { hashString } from "../../utilities/code_generating.js";
import { Item } from "../../utilities/item.js";
import { Some_Items_Are_In_Extended_Goto } from "../transitions/yield_transitions.js";
import { convert_sym_to_code, create_symbol_clause } from "./create_symbol_clause.js";

export function table_resolveResolvedLeaf(item: Item, state: TransitionNode, options: RenderBodyOptions): SingleItemReturnObject {

    if (Some_Items_Are_In_Extended_Goto([item], options) && options.scope == "GOTO") {
        state.transition_type = TRANSITION_TYPE.IGNORE;
        return {
            leaf: {
                root: [],
                leaf: [],
                prods: options.production_ids.slice(),
                original_prods: [],
                hash: "ignore",
                transition_type: TRANSITION_TYPE.IGNORE
            }
        };
    }

    let hash = "";

    if (state.transition_type == TRANSITION_TYPE.DIVERT_PRODUCTION_CALL) {

        const production_name = item.getProduction(options.grammar).name;

        hash = production_name;

        console.log("Direct function call");

    } else {

        hash = renderItem(item, options);
    }

    // The state should be ignored do something



    if (hash == "")
        debugger;
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
            prods: [item.getProduction(options.grammar).id]
        }
    };
}

function renderItem(item: Item, options: RenderBodyOptions): string {

    let code = "", hash_basis = "", leaf_state = "";

    const { grammar } = options;

    if (item.atEND) {

        const body = item.body_(grammar);

        const set_prod_clause = `set prod to ${body.production.id}`;

        if (body.reduce_id >= 0)

            hash_basis = `reduce ${item.len} ${body.reduce_id} then ${set_prod_clause}`;
        else if (item.len > 1)

            hash_basis = `reduce ${item.len} 0 then ${set_prod_clause}`;
        else

            hash_basis = `${set_prod_clause}`;

        leaf_state = "leaf-end";

    } else {

        const sym = item.sym(grammar);

        const next_state = renderItem(item.increment(), options);

        if (Sym_Is_A_Production(sym)) {

            const cardinal = getRootSym(sym, grammar);

            hash_basis = `goto state [${cardinal.production.name}] then goto state [${next_state}]`;

            leaf_state = "leaf-production-call";

        } else if (Sym_Is_A_Token(sym)) {

            let consumption = "consume";

            if (Sym_Is_Not_Consumed(sym))
                consumption = "noconsume";

            hash_basis = `${consumption} [${convert_sym_to_code(sym, null, null)}] ( goto state [${next_state}] )`;

            const symbols_clause = create_symbol_clause([item], [item.getProduction(grammar).id], options);

            code += symbols_clause;

            hash_basis += symbols_clause;

            leaf_state = "leaf-assert";
        }
    }

    code = `/*
    ${leaf_state}
    
        ${item.renderUnformattedWithProduction(options.grammar).replace(/\*\//g, "asterisk/")}\n    
    */
    
    ${hash_basis}` + code;

    const hash = hashString(hash_basis);

    code = `state [${hash}] \n     ` + code;

    options.table.map.set(hash, code);
    options.table.entries.push(code);



    if (hash == "")
        debugger;

    return hash;

};;