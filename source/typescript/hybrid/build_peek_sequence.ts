import { Grammar } from "../types/grammar.js";
import { TokenSymbol } from "../types/Symbol";
import { Item } from "../util/common.js";
import { TransitionTreeNode } from "../util/TransitionTreeNode";
import {
    getIncludeBooleans,
    addSkipCallNew,
    getSkippableSymbolsFromItems,
    getSymbolFromUniqueName,
    isSymIdentifier
} from "./utilities/utilities.js";
import { CompilerRunner } from "./types/CompilerRunner.js";
import { SC, VarSC } from "./utilities/skribble.js";
import { addItemListComment } from "./add_item_list_comment.js";
import { NewType, RecognizerState } from "./types/RecognizerState.js";



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
): Generator<NewType[], SC> {

    const group: NewType[] = [];

    for (let i = peek_nodes.length - 1; i >= 0; i--) {
        const node = peek_nodes[i];
        let code = new SC;
        //Depth first
        if (node.next.length > 0) {

            let gen = buildPeekSequence(node.next, grammar, runner, lex_name, current_production_id, ALLOW_FALL_THROUGH, depth + 1);
            let val = gen.next();

            while (!val.done) {
                yield <NewType[]>val.value;
                val = gen.next();
            }

            code = val.value;
        }

        group.push({
            code,
            hash: code.hash(),
            state: {
                peeking: true,
                items: node.roots,
                level: depth,
                leaf: node.next.length == 0,
                sym: <TokenSymbol>getSymbolFromUniqueName(grammar, node.sym)
            }
        });
    }

    yield group;

    const obj = group[0].code;

    return obj;
}
