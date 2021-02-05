import { TRANSITION_TYPE } from "../../types/recognizer_state.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { rec_glob_data_name, rec_glob_lex_name, rec_state, rec_state_prod } from "../../utilities/global_names.js";
import { ConstSC, SC, VarSC } from "../../utilities/skribble.js";
import { addClauseSuccessCheck, createDebugCall } from "./default_state_build.js";

/**
 * Adds code to end states
 *
 * If a production shift section is present, then leaf states in RD
 * section are appended  with a prod assignment. Additionally, a
 * local prod variable is declared at the head of the production
 * function, and a call to assertSuccess is appended to the tail.
 *
 * If the production shift section is absent then leaf states simply
 * return `true`. A `return false` statement is appended to the end
 * of the production function;
 *
 * *leaf state* - Any sequence of transitions yields a
 * single item
 *
 * @param RD_fn_contents - The root skribble node for the production function
 * @param RDOptions - Options from the RD yielder
 * @param GOTO_Options - Options from the GOTO yielder
 */

export function addLeafStatements(
    RD_fn_contents: SC,
    GOTO_fn_contents: SC,
    goto_fn_name: VarSC | ConstSC,
    RDOptions: RenderBodyOptions,
    GOTO_Options: RenderBodyOptions) {
    const
        { leaves: rd_leaves, production_ids } = RDOptions,
        { leaves: goto_leaves, NO_GOTOS } = GOTO_Options;

    for (const rd_leaf of rd_leaves) {
        const { leaf, prods } = rd_leaf;

        //@ts-ignore
        if (rd_leaf.SET)
            continue;

        //@ts-ignore
        rd_leaf.SET = true;

        if (NO_GOTOS) {
            leaf.addStatement(createDebugCall(GOTO_Options, "RD return"));
            leaf.addStatement(SC.UnaryPre(SC.Return, rec_state));
        } else {
            leaf.addStatement(SC.UnaryPre(SC.Return, SC.Call(goto_fn_name, rec_glob_lex_name, rec_glob_data_name, rec_state, prods[0])));
        }
    }

    if (!NO_GOTOS)
        for (const goto_leaf of goto_leaves) {

            const { leaf, prods, transition_type } = goto_leaf;

            //@ts-ignore
            if (goto_leaf.SET)
                continue;

            //@ts-ignore
            goto_leaf.SET = true;

            if (transition_type == TRANSITION_TYPE.ASSERT_END
                &&
                production_ids.includes(prods[0])
                &&
                production_ids.some(p_id => goto_leaf.keys.includes(p_id))) {
                leaf.addStatement(createDebugCall(GOTO_Options, "Inter return"));
                leaf.addStatement(SC.UnaryPre(SC.Return, rec_state));
            } else if (transition_type !== TRANSITION_TYPE.IGNORE) {
                leaf.addStatement(SC.Assignment(rec_state_prod, prods[0]));
                leaf.addStatement(SC.Value("continue"));
            }
        }

    RD_fn_contents.addStatement(SC.UnaryPre(SC.Return, SC.Value("0")));

    if (!NO_GOTOS)
        GOTO_fn_contents.addStatement(addClauseSuccessCheck(RDOptions));
}

/**
 * Used to grab production information from intermediate RD/GOTO passes
 *
 * @param RD_fn_contents - The root skribble node for the production function
 * @param RDOptions - Options from the RD yielder
 * @param GOTO_Options - Options from the GOTO yielder
 */

export function addIntermediateLeafStatements(
    RD_fn_contents: SC,
    GOTO_fn_contents: SC,
    goto_fn_name: VarSC | ConstSC,
    RDOptions: RenderBodyOptions,
    GOTO_Options: RenderBodyOptions) {
    const
        { leaves: rd_leaves, production_ids } = RDOptions,
        { leaves: goto_leaves, NO_GOTOS } = GOTO_Options;

    for (const rd_leaf of rd_leaves) {
        const { leaf, prods } = rd_leaf;

        //@ts-ignore
        if (rd_leaf.SET)
            continue;

        //@ts-ignore
        rd_leaf.SET = true;

        if (NO_GOTOS) {
            leaf.addStatement(createDebugCall(GOTO_Options, "RD return"));
            leaf.addStatement(SC.UnaryPre(SC.Return, rec_state));
        } else {
            leaf.addStatement(SC.UnaryPre(SC.Return, SC.Call(goto_fn_name, rec_glob_lex_name, rec_glob_data_name, rec_state, prods[0])));
        }
    }

    if (!NO_GOTOS)
        for (const goto_leaf of goto_leaves) {

            const { leaf, prods, transition_type } = goto_leaf;

            //@ts-ignore
            if (goto_leaf.SET)
                continue;

            //@ts-ignore
            goto_leaf.SET = true;

            if (transition_type == TRANSITION_TYPE.ASSERT_END
                &&
                production_ids.includes(prods[0])
                &&
                production_ids.some(p_id => goto_leaf.keys.includes(p_id))) {
                leaf.addStatement(createDebugCall(GOTO_Options, "Inter return"));
                leaf.addStatement(SC.UnaryPre(SC.Return, rec_state));
            } else if (transition_type !== TRANSITION_TYPE.IGNORE) {
                leaf.addStatement(SC.Assignment(rec_state_prod, prods[0]));
                leaf.addStatement(SC.Value("continue"));
            }
        }

    RD_fn_contents.addStatement(SC.UnaryPre(SC.Return, SC.Value("0")));

    if (!NO_GOTOS)
        GOTO_fn_contents.addStatement(addClauseSuccessCheck(RDOptions));
}

