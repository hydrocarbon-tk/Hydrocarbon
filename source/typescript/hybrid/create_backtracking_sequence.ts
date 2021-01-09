import { Symbol } from "../types/Symbol";
import { Item } from "../util/common.js";
import {
    createAssertionShift,
    isSymAProduction,
    g_lexer_name,
    addFollowCheckCall
} from "./utilities/utilities.js";
import { SC, VarSC } from "./utilities/skribble.js";
import { RenderBodyOptions } from "./types/RenderBodyOptions";
import { createMultiItemSequence } from "./create_multi_item_sequence.js";
import { addItemListComment } from "./add_item_list_comment.js";
import { incrementLexerName } from "./hybrid_function_constructor.js";
import { renderItem } from "./item_render_functions";


export function* createBacktrackingSequence(
    items: Item[],
    options: RenderBodyOptions,
    lex_name: VarSC
): Generator<{ prods: number[]; _if: SC; filter_productions: number[]; }, SC> {

    const {
        grammar,
        runner,
        productions
    } = options;

    if (runner.ANNOTATED)
        addItemListComment(root, items, grammar, "BACKTRACKING");

    let filter_productions = [], i = 0;

    const lex_copy_name = incrementLexerName(lex_name || g_lexer_name);
    const mark = SC.Variable("mk:unsigned int");
    const pass = SC.Variable("pass:bool");

    root.addStatement(SC.Declare(lex_copy_name));
    root.addStatement(SC.Declare(SC.Assignment(mark, SC.Call("mark"))));
    root.addStatement(SC.Declare(SC.Assignment(pass, SC.False)));

    for (const itm of items.map(i => {
        return <[Symbol, Item]>[i.sym(grammar), i];
    }).group(([sym]) => sym)) {

        const [[sym, first]] = itm;
        const items = itm.map(([, i]) => i);

        let temp,
            a = SC.Call("reset", mark, pass),
            b = isSymAProduction(sym) ? SC.Binary(
                SC.Call(
                    "$" + grammar[sym.val].name,
                    SC.Assignment(lex_copy_name, SC.Call(SC.Member(lex_name, "copy")))),
                "&&",
                addFollowCheckCall(grammar, runner, grammar[sym.val], lex_copy_name)
            ) :
                createAssertionShift(grammar, runner, sym, lex_name).expressions[0],
            c = SC.Binary(
                a, "&&",
                b
            );
        temp = SC.If(i++ == 0 ? b : c);
        if (isSymAProduction(sym))
            productions.add(sym.val);
        if (itm.length > 1) {

            const inc = items.map(i => i.increment());
            const gen = createMultiItemSequence(inc, options, lex_copy_name);
            let val;
            while (!(val = gen.next()).done) {
                const _if = val.value._if;
                if (_if) {
                    _if.addStatement(
                        SC.Call(SC.Member(lex_name, "sync"), lex_copy_name),
                        SC.Assignment(pass, SC.True)
                    );
                }
                yield val.value;
            }
            root.addStatement(temp, SC.Empty());
        } else {
            const _if = renderItem(temp, first.increment(), grammar, runner, productions, false, lex_copy_name);
            temp.addStatement(SC.Empty());
            root.addStatement(temp, SC.Empty());
            _if.addStatement(SC.Call(SC.Member(lex_name, "sync"), lex_copy_name), SC.Assignment(pass, SC.True));
            yield ({ prods: [first.getProduction(grammar).id], _if, filter_productions });
        }
    }

    return root;
}
