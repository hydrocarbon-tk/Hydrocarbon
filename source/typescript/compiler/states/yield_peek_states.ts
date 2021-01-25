import { Grammar } from "../../types/grammar.js";
import { RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options.js";
import { TransitionTreeNode } from "../../types/transition_tree_nodes";
import { VarSC } from "../../utilities/skribble.js";
import { getSymbolFromUniqueName } from "../../utilities/symbol.js";
import { processPeekStateLeaf } from "./process_peek_state_leaf.js";


export type leafHandler = (state: RecognizerState, options: RenderBodyOptions, offset: number, lex_name: VarSC) => void;

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
    lex_name: VarSC,
    offset: number,
    depth: number = 0,
    leafHandler: leafHandler = processPeekStateLeaf
): RecognizerState[] {

    const output_states: RecognizerState[] = [];

    const peek_groups = peek_nodes.group(n => {
        const item_id = n.roots.map(i => i.id).sort().join("-");
        const next = n.next.length > 0;
        return item_id + "" + next;
    });

    for (const group of peek_groups) {

        const
            symbols = group
                .map(g => g.sym)
                .map(s => getSymbolFromUniqueName(options.grammar, s)),
            closure = group.flatMap(g => g.starts).setFilter(s => s.id),
            state = <RecognizerState>{
                code: null,
                hash: "undefined",
                items: group[0].roots,
                transition_type: TRANSITION_TYPE.PEEK,
                offset,
                peek_level: depth,
                completing: group[0].next.length == 0,
                closure,
                prods: [],
                leaves: [],
                states: [],
                symbols
            };

        //Depth first
        if (group[0].next.length > 0) {
            state.states.push(...buildPeekSequence(group[0].next, options, lex_name, offset, depth + 1, leafHandler));
        } else {
            leafHandler(state, options, offset, lex_name);
        }

        output_states.push(state);
    }

    return output_states;
}


