/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { HCG3Grammar, HCG3Symbol } from "source/typescript/types/grammar_nodes.js";
import { getSymbolFromUniqueName, getUniqueSymbolName } from "../../grammar/nodes/symbol.js";
import { RenderBodyOptions } from "../../types/render_body_options.js";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { TransitionTreeNode } from "../../types/transition_tree_nodes";
import { const_EMPTY_ARRAY } from "../../utilities/const_EMPTY_ARRAY.js";
import { createTransitionNode } from "./create_transition_node.js";
import { processPeekTransitionLeaves } from "./process_peek_transition_leaves.js";


export type leafHandler = (node: TransitionNode, options: RenderBodyOptions, root_depth: number, leaf_depth: number) => void;

export function convertTransitionTreeNodeToRenderable(node: TransitionTreeNode, grammar: HCG3Grammar) {
    return Object.assign({}, node, {
        roots: node.roots.map(r => r.renderUnformattedWithProduction(grammar)),
        next: node.next.map(n => convertTransitionTreeNodeToRenderable(n, grammar)),
        closure: node.closure.map(r => r.renderUnformattedWithProduction(grammar))
    });
}

export function buildPeekTransitions(
    peek_nodes: TransitionTreeNode[],
    options: RenderBodyOptions,
    offset: number,
    leafHandler: leafHandler = processPeekTransitionLeaves,
    filter_symbols: HCG3Symbol[] = const_EMPTY_ARRAY,
    peek_depth: number = 0,
    RESET_ROOTS = false,
): TransitionNode[] {

    const
        output_nodes: TransitionNode[] = [],
        peek_groups = peek_nodes.filter(({ sym }) => {
            if (filter_symbols.length > 0) {
                for (const f_sym of filter_symbols)
                    if (getUniqueSymbolName(f_sym) == sym)
                        return true;
            } else return true;
            return false;
        }).group(getPeekGroupIdentifier);

    for (const group of peek_groups) {

        const

            symbols = group
                .map(g => g.sym)
                .map(s => getSymbolFromUniqueName(options.grammar, s)),

            node = createTransitionNode(group[0].roots, symbols, TRANSITION_TYPE.ASSERT_PEEK, offset, peek_depth, false, group[0].root_id, group.flatMap(g => g.item_ids));

        node.closure = group.flatMap(g => g.starts).setFilter(s => s.id);

        if (group[0].next.length > 0)
            node.nodes.push(...buildPeekTransitions(group[0].next, options, offset, leafHandler, const_EMPTY_ARRAY, peek_depth + 1));
        else {
            if (RESET_ROOTS)
                node.items = node.items.map(i => i.decrement());

            leafHandler(node, options, offset, peek_depth);
        }

        output_nodes.push(node);
    }

    return output_nodes;
}


function getPeekGroupIdentifier(item: TransitionTreeNode): string {
    const item_id = item.roots.map(i => i.id).sort().join("-");
    const next = item.next.length > 0;
    return item_id + "" + next;
}

