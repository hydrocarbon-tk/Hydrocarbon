import { Grammar } from "../../types/grammar.js";
import { RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options.js";
import { Symbol } from "../../types/symbol.js";
import { TransitionTreeNode } from "../../types/transition_tree_nodes";
import { getSymbolFromUniqueName, getUniqueSymbolName } from "../../utilities/symbol.js";
import { const_EMPTY_ARRAY } from "./const_EMPTY_ARRAY.js";
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
    leafHandler: leafHandler = processPeekStateLeaf,
    filter_symbols: Symbol[] = const_EMPTY_ARRAY,
    depth: number = 0,
): RecognizerState[] {

    const
        output_states: RecognizerState[] = [],
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

            state = createRecognizerState(group[0].roots, symbols, TRANSITION_TYPE.PEEK, offset, depth);

        state.closure = group.flatMap(g => g.starts).setFilter(s => s.id);

        if (group[0].next.length > 0)
            state.states.push(...buildPeekSequence(group[0].next, options, offset, leafHandler, const_EMPTY_ARRAY, depth + 1));
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

