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
): Iterator<{ _if: SC; starts: Item[]; items: Item[]; closure: Item[]; depth: number; }, { _if: SC; items: Item[]; leaf: SC; closure: Item[]; }> {

    let _if = null, leaf = null, root = null;

    const grouped_nodes = peek_nodes.group(i => {
        return "_" + i.roots.map(i => i.id).sort().join("__") + "_" + i.next.flatMap(g => g.roots).setFilter().map(i => i.id).sort().join("");
    }).sort((a, b) => {

        let score_b = b[0].final_count - a[0].final_count
            + b.length - a.length
            + (500000 * +b.some(i => isSymIdentifier(<TokenSymbol>getSymbolFromUniqueName(grammar, i.sym)) && getSymbolFromUniqueName(grammar, i.sym).val == "id"));

        let score_a = a[0].final_count - b[0].final_count
            + a.length - b.length
            + (500000 * +a.some(i => isSymIdentifier(<TokenSymbol>getSymbolFromUniqueName(grammar, i.sym)) && getSymbolFromUniqueName(grammar, i.sym).val == "id"));

        return score_a - score_b;
    });

    ALLOW_FALL_THROUGH = ALLOW_FALL_THROUGH && grouped_nodes.length > 1;

    let i = 0;

    for (const nodes of grouped_nodes) {

        i++;

        // Each peek node represents one symbol and a set of next values.
        // combine next values and filter out duplicates based on symbol
        const
            syms = nodes.map(i => <TokenSymbol>grammar.meta.all_symbols.get(i.sym)),
            next = nodes.flatMap(i => i.next),
            roots = nodes.flatMap(n => n.roots).setFilter(i => i.id),
            item_ids = nodes.flatMap(i => i.item_ids).setFilter().map(i => grammar.item_map.get(i).item.increment()).filter(i => i),
            closure = nodes.flatMap(n => n.closure).setFilter(i => i.id),
            starts = nodes.flatMap(n => n.starts ?? []).setFilter(i => i.id),
            prod_id = roots[0].getProduction(grammar).id;
        /**
         * IF all current root items of the same production and they are
         * all at the initial state, then use this as an
         * to exit the peek and allow that production to be called.
         * Check to make sure the current production function is not the one
         * being called to prevent a live lock to prevent infinite recursion.
         */
        const SAME_ROOTS = current_production_id != prod_id
            && roots.every(r => r.getProduction(grammar).id == prod_id)
            && roots.every(r => r.offset == 0);


        _if = (i == grouped_nodes.length && ALLOW_FALL_THROUGH)
            ? SC.If()
            : SC.If(getIncludeBooleans(syms, grammar, runner, lex_name));

        if (leaf) leaf.addStatement(_if);
        if (!root) root = _if;


        addItemListComment(_if, closure, grammar, "PEEK CLOSURE");
        leaf = _if;

        if (next.length == 0 /*|| SAME_ROOTS*/) {
            yield ({
                _if,
                items: roots,
                closure,
                starts,
                depth
            });

            _if.addStatement(SC.Empty());
        } else {

            let lexer_name = lex_name;

            if (depth == 0) {
                const peek_name = SC.Variable("pk:Lexer");
                _if.addStatement(SC.Declare(SC.Assignment(peek_name, SC.Call(SC.Member(lex_name, "copy")))));
                lexer_name = peek_name;
            }

            const skippable = getSkippableSymbolsFromItems(item_ids, grammar);

            _if.addStatement(addSkipCallNew(skippable, grammar, runner, <any>SC.Call(SC.Member(lexer_name, "next"))));

            //if (syms.some(i => i.val == "get")) {
            //    console.log(nodes.map(n => convertTreeNodeToRenderable(n, grammar)));
            //}

            _if.addStatement(SC.Comment(grouped_nodes.length + "  i:" + i + " n:" + nodes.length + " dd:" + next.sort((a, b) => a.roots.length - b.roots.length)[0].roots.length));

            const gen = buildPeekSequence(next, grammar, runner, lexer_name, current_production_id, true, depth + 1);
            let val = gen.next();
            while (!val.done) {
                yield val.value;
                val = gen.next();
            }
            _if.addStatement(val.value._if);
        }
    }

    if (leaf)
        leaf.addStatement(SC.Empty());

    return {
        _if: root || new SC, leaf, items: [], closure: []
    };
}
