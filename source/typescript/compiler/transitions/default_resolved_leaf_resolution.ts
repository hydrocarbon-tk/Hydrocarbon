import { RenderBodyOptions } from "../../types/render_body_options";
import { SingleItemReturnObject } from "../../types/transition_generating";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { createProductionCall, createSkipCall } from "../../utilities/code_generating.js";
import { createTransitionTypeAnnotation } from "../../utilities/create_transition_type_annotation.js";
import { rec_glob_lex_name } from "../../utilities/global_names.js";
import { Item, itemsToProductions } from "../../utilities/item.js";
import { renderItem } from "../../utilities/render_item.js";
import { SC } from "../../utilities/skribble.js";
import { getSkippableSymbolsFromItems } from "../../utilities/symbol.js";
import { processProductionChain } from "../../utilities/process_production_reduction_sequences.js";



export function default_resolveResolvedLeaf(item: Item, state: TransitionNode, options: RenderBodyOptions): SingleItemReturnObject {

    const
        { grammar, helper: runner, leaf_productions,  production_ids, extended_goto_items: extended_production_shift_items, leaves } = options,
        code = state.code || new SC,
        SHOULD_IGNORE = extended_production_shift_items.some(i => i.body == item.body);

    let leaf_node = code, prods = [];

    code.addStatement(createTransitionTypeAnnotation(options, [state.transition_type]));

    if (SHOULD_IGNORE) {
        leaf_node.addStatement(SC.Comment("SHOULD IGNORE"));
        state.transition_type = TRANSITION_TYPE.IGNORE;
        return {
            leaf: {
                root: leaf_node,
                leaf: leaf_node,
                prods,
                hash: leaf_node.hash(),
                transition_type: state.transition_type
            }
        };
    }

    if (state.transition_type == TRANSITION_TYPE.ASSERT_CONSUME && !item.atEND)
        item = item.increment();

    if (item) {
        if (item.len > 0 && item.offset == 0 && (!production_ids.includes(item.getProduction(grammar).id) || state.offset > 0)) {

            const bool = createProductionCall(item.getProduction(grammar), options, rec_glob_lex_name);

            leaf_node = SC.If(bool);

            code.addStatement(leaf_node);

            prods = processProductionChain(leaf_node, options, itemsToProductions([item], grammar));

        } else {

            const
                skippable = getSkippableSymbolsFromItems([item], grammar),
                skip = state.transition_type == TRANSITION_TYPE.ASSERT_CONSUME
                    && !item.atEND
                    ? createSkipCall(skippable, grammar, runner, rec_glob_lex_name)
                    : undefined;

            code.addStatement(skip);

            const sc = new SC;

            code.addStatement(sc);

            ({ leaf_node, prods } = renderItem(sc, item, options, state.transition_type == TRANSITION_TYPE.ASSERT));
        }

        for (const prod of prods)
            leaf_productions.add(prod);
    }
    //leaf_node.shiftStatement(SC.Comment("--unique-id--" + prods.setFilter().sort().join("-") + item.id + "--DO-NOT-REPLACE"));
    //leaf_code.shiftStatement(SC.Comment("--unique-id--" + prods.setFilter().sort().join("-") + item.id + "--DO-NOT-REPLACE"));

    return {
        leaf: {
            root: code,
            leaf: leaf_node,
            prods,
            hash: code.hash(),
            transition_type: state.transition_type
        }
    };
}
