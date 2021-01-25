import { Grammar } from "../../types/grammar.js";
import { RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options.js";
import { TransitionTreeNode } from "../../types/transition_tree_nodes";
import { getSymbolFromUniqueName } from "../../utilities/symbol.js";
import { createRecognizerState } from "./create_recognizer_state.js";
import { processPeekStateLeaf } from "./process_peek_state_leaf.js";


export type leafHandler = (state: RecognizerState, options: RenderBodyOptions, offset: number) => void;

export function convertTreeNodeToRenderable(node: TransitionTreeNode, grammar: Grammar) {
    return Object.assign({}, node, {
        roots: node.roots.map(r => r.renderUnformattedWithProduction(grammar)),
        next: node.next.map(n => convertTreeNodeToRenderable(n, grammar)),
        closure: node.closure.map(r => r.renderUnformattedWithProduction(grammar))
    });
}

export function buildPeekSequence(
    peek_nodes: TransitionTreeNode[],
    options: RenderBodyOptions,
    offset: number,
    depth: number = 0,
    leafHandler: leafHandler = processPeekStateLeaf
): RecognizerState[] {

    const
        output_states: RecognizerState[] = [],
        peek_groups = peek_nodes.group(getPeekGroupIdentifier);

    for (const group of peek_groups) {

        const

            symbols = group
                .map(g => g.sym)
                .map(s => getSymbolFromUniqueName(options.grammar, s)),

            state = createRecognizerState(group[0].roots, symbols, TRANSITION_TYPE.PEEK, offset, depth);

        state.closure = group.flatMap(g => g.starts).setFilter(s => s.id);

        if (group[0].next.length > 0)
            state.states.push(...buildPeekSequence(group[0].next, options, offset, depth + 1, leafHandler));
        else
            leafHandler(state, options, offset);

        output_states.push(state);
    }

    return output_states;
}


function getPeekGroupIdentifier(item: TransitionTreeNode): string {
    const item_id = item.roots.map(i => i.id).sort().join("-");
    const next = item.next.length > 0;
    return item_id + "" + next;
}

