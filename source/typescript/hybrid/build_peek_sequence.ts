import { Grammar } from "../types/grammar.js";
import { TokenSymbol } from "../types/Symbol";
import { TransitionTreeNode } from "../util/TransitionTreeNode";
import {
    getSymbolFromUniqueName,
} from "./utilities/utilities.js";
import { CompilerRunner } from "./types/CompilerRunner.js";
import { SC, VarSC } from "./utilities/skribble.js";
import { RecognizerState } from "./types/RecognizerState.js";



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
): Generator<RecognizerState[], SC> {

    const group: RecognizerState[] = [];

    for (let i = peek_nodes.length - 1; i >= 0; i--) {

        const node = peek_nodes[i];

        let code = new SC, prods = [null];
        //Depth first
        if (node.next.length > 0) {

            let gen = buildPeekSequence(node.next, grammar, runner, lex_name, current_production_id, ALLOW_FALL_THROUGH, depth + 1);
            let val = gen.next();

            while (!val.done) {
                const obj = <RecognizerState[]>val.value;
                yield obj;
                prods = obj[0].prods;
                val = gen.next();
            }

            code = val.value;
        }

        group.push({
            code,
            hash: code.hash(),
            items: node.roots,
            yielder: "peek-internal",
            offset: -1,
            peek_level: depth,
            leaf: node.next.length == 0,
            closure: node.starts,
            sym: <TokenSymbol>getSymbolFromUniqueName(grammar, node.sym),
            prods
        });
    }

    yield group;

    return group[0].code;
}
