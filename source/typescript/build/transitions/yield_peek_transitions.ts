/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { getSymbolFromUniqueName } from "../../grammar/nodes/symbol.js";
import { RenderBodyOptions } from "../../types/render_body_options.js";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { TransitionTreeNode } from "../../types/transition_tree_nodes";
import { createTransitionNode } from "./create_transition_node.js";
import { processPeekTransitionLeaves } from "./process_peek_transition_leaves.js";


export type leafHandler = (node: TransitionNode, options: RenderBodyOptions, root_depth: number, leaf_depth: number) => void;

export function buildPeekTransitions(
    peek_nodes: TransitionTreeNode[],
    options: RenderBodyOptions,
    offset: number,
    leafHandler: leafHandler = processPeekTransitionLeaves,
    peek_depth: number = 0,
    RESET_ROOTS = false,
): TransitionNode[] {

    const
        output_nodes: TransitionNode[] = [],
        peek_groups = peek_nodes.group(getPeekGroupIdentifier);


    let ss = new Set;

    for (const group of peek_groups) {

        const

            symbols = group
                .map(g => g.sym)
                .map(s => getSymbolFromUniqueName(options.grammar, s)),

            HAVE_NEXT = group.every(g => g.next.length > 0),

            node = createTransitionNode(
                group.flatMap(g => g.roots).setFilter(s => s.id),
                symbols,
                TRANSITION_TYPE.ASSERT_PEEK,
                offset,
                peek_depth,
                false,
                group[0].root_id,
            );

        for (const { id } of symbols) {
            if (ss.has(id)) {

                console.log(peek_groups.map(i => {
                    return i.map(i => {
                        return i.roots.map(i => i.renderUnformattedWithProduction(options.grammar)).join("\n") + "\n^^^^^^^^^^^\n\n" + i.closure.map(i => i.renderUnformattedWithProduction(options.grammar)) + "\n>>>>>>>>>>>>>>>>>>>>>>>>..\n";
                    });
                }).join("\n--------\n"));
                throw "WTF";
            }
            ss.add(id);
        }

        node.closure = group.flatMap(g => g.closure.map(i => i.decrement())).setFilter(s => s.id);

        if (HAVE_NEXT)
            node.nodes.push(
                ...buildPeekTransitions(
                    group.flatMap(g => g.next),
                    options,
                    offset,
                    leafHandler,
                    peek_depth + 1
                )
            );

        else {
            if (RESET_ROOTS)
                node.items = node.items.map(i => i.decrement());

            node.items = node.items.setFilter(i => i.id);

            leafHandler(node, options, offset, peek_depth);
        }

        output_nodes.push(node);
    }

    return output_nodes;
}


function getPeekGroupIdentifier(item: TransitionTreeNode): string {
    const item_id = item.roots.map(i => i.id).sort().join("-");
    const next = item.next.length > 0;
    return item_id;
}

