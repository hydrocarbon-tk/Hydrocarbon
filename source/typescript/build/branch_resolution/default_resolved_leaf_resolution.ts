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
import { addItemAnnotationToExpressionList, createBranchFunction, createProductionReturn, createScanFunctionCall, getProductionFunctionName, hashString } from "../../utilities/code_generating.js";
import { Item, itemsToProductionIDs } from "../../utilities/item.js";
import { processProductionChain } from "../../utilities/process_production_reduction_sequences.js";
import { renderItem } from "../../utilities/render_item.js";



export function default_resolveResolvedLeaf(item: Item, state: TransitionNode, options: RenderBodyOptions): SingleItemReturnObject {

    const
        { grammar, helper: runner, leaf_productions, production_ids, extended_goto_items: extended_production_shift_items, leaves } = options,
        code: SKExpression[] = state.code || [],
        SHOULD_IGNORE = extended_production_shift_items.some(i => i.body == item.body);

    let leaf_node = code, prods = [], original_prods = [], INDIRECT = false, EMPTY = false;

    if (SHOULD_IGNORE) {

        state.transition_type = TRANSITION_TYPE.IGNORE;

        return {
            leaf: {
                root: [],
                leaf: [],
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

        if (options.helper.ANNOTATED)
            addItemAnnotationToExpressionList([item], grammar, code);

        if (item.offset == 0 && !options.productions.some(g => g.id == item.getProduction(grammar).id)) {

            const production = item.getProduction(grammar);

            options.called_productions.add(production.id);

            const sc = [],
                call_name = createBranchFunction(sc, options);

            code.push(<SKExpression>sk`state.push_fn(${call_name}, prod_start)`);

            code.push(createProductionReturn(production,"prod_start", "prod_start"));

            leaf_node = sc;

            original_prods = itemsToProductionIDs([item], grammar);

            prods = processProductionChain(leaf_node, options, original_prods);

        } else {

            const

                scan = state.transition_type == TRANSITION_TYPE.ASSERT_CONSUME
                    && !item.atEND
                    ? createScanFunctionCall([item], options)
                    : undefined;

            if (scan) code.push(scan);

            ({ leaf_node, prods, INDIRECT, original_prods } = renderItem(code, item, options,
                ((item.offset > 0 || options.scope != "GOTO") &&
                    (state.transition_type == TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS ||
                        state.transition_type == TRANSITION_TYPE.ASSERT_PRODUCTION_CALL ||
                        state.transition_type == TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS)) ||
                (state.transition_type == TRANSITION_TYPE.ASSERT
                    || state.transition_type == TRANSITION_TYPE.ASSERT_PEEK
                    || state.transition_type == TRANSITION_TYPE.ASSERT_PEEK_VP)));
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
            hash: hashString(item.getProduction(grammar).id + "-" + code.map(skRenderAsSK).join("")),
            INDIRECT,
            EMPTY,
            transition_type: state.transition_type
        }
    };
}
