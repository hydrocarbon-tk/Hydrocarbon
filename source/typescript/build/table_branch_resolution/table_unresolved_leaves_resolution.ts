/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { hashString } from "../../utilities/code_generating.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { MultiItemReturnObject } from "../../types/transition_generating.js";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";

export function table_resolveUnresolvedLeaves(node: TransitionNode, nodes: TransitionNode[], options: RenderBodyOptions): MultiItemReturnObject {

    //remove extended goto transition

    const items = node.items;

    if (nodes.length == 1) {
        return { leaves: node.leaves, root: [], prods: node.prods };
    }


    const output_nodes = nodes.sort((a, b) =>
        b.items.sort((a, b) => b.len - a.len)[0].len
        -
        a.items.sort((a, b) => b.len - a.len)[0].len),

        out_prods = [], out_leaves = [];

    for (const { prods, leaves } of output_nodes) {
        out_prods.push(...prods);
        out_leaves.push(...leaves);
    }

    const hash = hashString(nodes.map(i => i.hash).join("----!merged!merged!---")).slice(0, 8);

    const code = `
state [${hash}] 

    /*
    ${items.map(i => i.renderUnformattedWithProduction(options.grammar)).join("\n    ")}
    */

    fork to ( ${nodes.map(i => `state [${i.hash}]`).join(", ")} ) 
`;
    options.table.map.set(hash, code);
    options.table.entries.push(code);

    node.hash = hash;

    return { leaves: node.leaves, root: [], prods: node.prods };
}