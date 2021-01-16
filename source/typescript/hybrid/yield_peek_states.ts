import { Grammar } from "../types/grammar.js";
import { TokenSymbol } from "../types/Symbol";
import { TransitionTreeNode } from "../util/TransitionTreeNode";
import {
    getSymbolFromUniqueName,
} from "./utilities/utilities.js";
import { CompilerRunner } from "./types/CompilerRunner.js";
import { SC, VarSC } from "./utilities/skribble.js";
import { RecognizerState, TRANSITION_TYPE } from "./types/RecognizerState.js";



export function convertTreeNodeToRenderable(node: TransitionTreeNode, grammar: Grammar) {
    return Object.assign({}, node, {
        roots: node.roots.map(r => r.renderUnformattedWithProduction(grammar)),
        next: node.next.map(n => convertTreeNodeToRenderable(n, grammar)),
        closure: node.closure.map(r => r.renderUnformattedWithProduction(grammar))
    });
}

export function* buildPeekSequence(
    peek_nodes: TransitionTreeNode[],
    grammar: Grammar,
    runner: CompilerRunner,
    lex_name: VarSC,
    current_production_id: number = -1,
    ALLOW_FALL_THROUGH: boolean = true,
    depth: number = 0
): Generator<RecognizerState[], RecognizerState[]> {

    const group: RecognizerState[] = [];

    for (let i = peek_nodes.length - 1; i >= 0; i--) {

        const node = peek_nodes[i];

        let code = null, prods = [], hash = "undefined";
        //Depth first
        if (node.next.length > 0) {

            let gen = buildPeekSequence(node.next, grammar, runner, lex_name, current_production_id, ALLOW_FALL_THROUGH, depth + 1);
            let val = gen.next();

            while (!val.done) {
                const obj = <RecognizerState[]>val.value;
                yield obj;
                code = obj[0].code;
                hash = obj[0].hash;
                prods.push(...obj[0].prods);
                val = gen.next();
            }
        }

        group.push(<RecognizerState>{
            code,
            hash,
            items: node.roots,
            transition_type: TRANSITION_TYPE.PEEK,
            offset: -1,
            peek_level: depth,
            completing: node.next.length == 0,
            closure: node.starts,
            symbol: <TokenSymbol>getSymbolFromUniqueName(grammar, node.sym),
            prods: prods.setFilter()
        });
    }

    if (depth == 0)
        return group;

    yield group;
}
