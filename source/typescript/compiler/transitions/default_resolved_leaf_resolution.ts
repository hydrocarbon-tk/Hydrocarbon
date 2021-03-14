/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { sk, skRenderAsSK } from "../../skribble/skribble.js";
import { SKExpression } from "../../skribble/types/node.js";
import { RenderBodyOptions } from "../../types/render_body_options";
import { SingleItemReturnObject } from "../../types/transition_generating";
import { TransitionNode, TRANSITION_TYPE } from "../../types/transition_node.js";
import { createBranchFunctionSk, createSkipCallSk, getProductionFunctionName, hashString } from "../../utilities/code_generating.js";
import { createTransitionTypeAnnotation } from "../../utilities/create_transition_type_annotation.js";
import { rec_glob_lex_name } from "../../utilities/global_names.js";
import { Item, itemsToProductions } from "../../utilities/item.js";
import { processProductionChain } from "../../utilities/process_production_reduction_sequences.js";
import { renderItem } from "../../utilities/render_item.js";
import { getSkippableSymbolsFromItems } from "../../utilities/symbol.js";



export function default_resolveResolvedLeaf(item: Item, state: TransitionNode, options: RenderBodyOptions): SingleItemReturnObject {

    const
        { grammar, helper: runner, leaf_productions, production_ids, extended_goto_items: extended_production_shift_items, leaves } = options,
        code:SKExpression[] = state.code || [],
        SHOULD_IGNORE = extended_production_shift_items.some(i => i.body == item.body);

    let leaf_node = code, prods = [], original_prods = [], INDIRECT = false;

    if (options.helper.ANNOTATED)
        code.push(createTransitionTypeAnnotation(options, [state.transition_type]));

    if (SHOULD_IGNORE) {
        
        state.transition_type = TRANSITION_TYPE.IGNORE;

        return {
            leaf: {
                root: leaf_node,
                leaf: leaf_node,
                prods,
                original_prods,
                hash: "",
                transition_type: state.transition_type
            }
        };
    }

    if (state.transition_type == TRANSITION_TYPE.ASSERT_CONSUME && !item.atEND)
        item = item.increment();

    if (item) {

        
        //if (options.helper.ANNOTATED)
        //    code.addStatement(item.renderUnformattedWithProduction(grammar));
        
        if (item.offset == 0 && !options.productions.some(g => g.id == item.getProduction(grammar).id)) {
     
            const production = item.getProduction(grammar);

            options.called_productions.add(production.id);

            const sc = [],
                call_name = createBranchFunctionSk(sc, options);

            leaf_node.push(<SKExpression>sk`puid |= ${grammar.item_map.get(item.id).sym_uid}`);
            leaf_node.push(<SKExpression>sk`pushFN(data, ${call_name})`);
            leaf_node.push(<SKExpression>sk`pushFN(data, ${getProductionFunctionName(production, grammar)})`);
            leaf_node.push(<SKExpression>sk`return:puid`);

            leaf_node = sc;

            prods = processProductionChain([], options, itemsToProductions([item], grammar));
            original_prods = itemsToProductions([item], grammar);

        } else {

            const
                sc = code,

                skippable = getSkippableSymbolsFromItems([item], grammar),

                skip = state.transition_type == TRANSITION_TYPE.ASSERT_CONSUME
                    && !item.atEND
                    ? createSkipCallSk(skippable, options, rec_glob_lex_name, false)
                    : undefined;

            if (skip)
                code.push(skip);

            ({ leaf_node, prods, INDIRECT, original_prods } = renderItem(sc, item, options,
                state.transition_type == TRANSITION_TYPE.ASSERT
                || state.transition_type == TRANSITION_TYPE.ASSERT_PEEK
                || state.transition_type == TRANSITION_TYPE.ASSERT_PEEK_VP));
        }

        for (const prod of prods)
            leaf_productions.add(prod);
    }

    return {
        leaf: {
            root: code,
            leaf: leaf_node,
            prods,
            original_prods,
            hash: hashString(code.map(skRenderAsSK).join("")),
            INDIRECT,
            transition_type: state.transition_type
        }
    };
}
