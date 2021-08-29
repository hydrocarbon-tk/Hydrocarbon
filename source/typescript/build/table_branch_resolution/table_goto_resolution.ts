/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { SKExpression } from "../../skribble/types/node";
import { RenderBodyOptions } from "../../types/render_body_options";
import { TransitionClauseGenerator } from "../../types/transition_generating";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { Item } from "../../utilities/item.js";
import { create_symbol_claues, table_resolveBranches } from "./table_branch_resolution.js";


export function table_resolveGOTOBranches(
    gen: TransitionClauseGenerator,
    state: TransitionNode,
    items_global: Item[],
    level: number,
    options: RenderBodyOptions
): SKExpression[] {

    if (state.offset == 0) {

        const production_name = options.productions[0].name;

        const hash = production_name + "_goto";

        state.hash = hash;

        const states = [...gen];

        let code = (`state [${hash}]\n`);

        const branches = [];
        for (const { hash: goto_hash, transition_types, syms } of states.sort(((a, b) => a.prods.sort()[0] - b.prods.sort()[0]))) {
            const keys = (<number[]><any>syms).setFilter(s => s + "");

            if (transition_types[0] != TRANSITION_TYPE.IGNORE)
                branches.push((`on prod [ ${keys.sort().join(" ")}] (\n        goto state [${goto_hash}] then goto state [${hash}]\n    )`));
        }

        code += "    " + branches.join("\n\n    ");

        code += `\n\n    on fail state [${production_name}_goto_failed] 
    on prod [ ${options.production_ids[0]} ] ( pass )`;

        options.table.map.set(hash, code);
        options.table.entries.push(code);

        return [];
    }

    return table_resolveBranches(gen, state, items_global, level, options/*, state.offset <= 1*/);
}