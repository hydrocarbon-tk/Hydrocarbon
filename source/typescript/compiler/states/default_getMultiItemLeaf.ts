import { Leaf, RecognizerState, TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { MultiItemReturnObject } from "../../types/state_generating";
import { rec_glob_lex_name, rec_state } from "../../utilities/global_names.js";
import { SC } from "../../utilities/skribble.js";
import { compileProductionFunctions } from "../function_constructor.js";


export function default_getMultiItemLeaf(state: RecognizerState, states: RecognizerState[], options: RenderBodyOptions): MultiItemReturnObject {

    const

        productions = states.flatMap(s => s.items).map(i => i.getProductionAtSymbol(options.grammar)).setFilter(p => p.id),

        anchor_state = SC.Variable("anchor_state:unsigned"),

        root: SC = (new SC).addStatement(
            productions.map(p => p.id).join(">   <"),
            SC.Declare(
                SC.Assignment("mk:int", SC.Call("mark")),
                SC.Assignment("anchor:Lexer", SC.Call(SC.Member(rec_glob_lex_name, "copy"))),
                SC.Assignment(anchor_state, rec_state)
            )
        ),

        IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS = states.some(i => i.transition_type == TRANSITION_TYPE.IGNORE),

        out_prods: number[] = [],

        out_leaves: Leaf[] = [];

    try {

        const { RDOptions, GOTO_Options, RD_fn_contents, GOTO_fn_contents } = compileProductionFunctions(options.grammar, options.helper, productions);

        root.addStatement(RD_fn_contents, GOTO_fn_contents);

    } catch (e) {
        root.addStatement(e.stack);


        let leaf = root, FIRST = true;// prev_prods;

        for (const { code, items, prods, leaves } of states.filter(i => i.transition_type !== TRANSITION_TYPE.IGNORE)) {

            out_prods.push(...prods);
            out_leaves.push(...leaves);

            leaf.addStatement(SC.Comment(items));

            if (FIRST) {

                leaf.addStatement(
                    SC.Comment(prods),
                    code
                );

            } else {
                leaf.addStatement(
                    SC.Assignment(rec_state, SC.Call(
                        "reset:bool",
                        "mk",
                        "anchor:Lexer",
                        rec_glob_lex_name,
                        anchor_state
                    )),
                    code,
                    SC.Empty()
                );

            }

            // prev_prods = prods;

            FIRST = false;
        }

        if (IS_LEFT_RECURSIVE_WITH_FOREIGN_PRODUCTION_ITEMS) {
            leaf.addStatement(
                SC.Assignment(rec_state, SC.Call(
                    "reset:bool",
                    "mk",
                    "anchor:Lexer",
                    rec_glob_lex_name,
                    anchor_state
                )),
                SC.Empty()
            );
        }

    }

    return { root, leaves: out_leaves, prods: out_prods.setFilter() };
}
