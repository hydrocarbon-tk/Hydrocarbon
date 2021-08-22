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
import { table_resolveBranches } from "./table_branch_resolution.js";


export function table_resolveGOTOBranches(
    gen: TransitionClauseGenerator,
    state: TransitionNode,
    items_global: Item[],
    level: number, options: RenderBodyOptions
): SKExpression[] {

    if (state.offset == 0) {

        state.hash = options.productions[0].name + "_goto";

        const states = [...gen];

        console.log(`state [${state.hash}] consider ${states.flatMap(s => s.prods).setFilter().length} productions`);


        for (const { prods, hash, transition_types } of states.sort(((a, b) => a.prods.sort()[0] - b.prods.sort()[0]))) {

            if (transition_types[0] == TRANSITION_TYPE.IGNORE) {

            } else

                console.log(`\n    if prod is one of [${prods.sort().join(" ")}] goto state [${hash}] then goto state [${state.hash}]`);
        }


        console.log();



        return [];
    }

    return table_resolveBranches(gen, state, items_global, level, options/*, state.offset <= 1*/);
}