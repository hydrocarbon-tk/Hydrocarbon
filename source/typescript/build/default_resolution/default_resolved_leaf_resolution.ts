/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { ttt } from "../../utilities/transition_type_to_string.js";
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
        { grammar, helper: runner, leaf_productions, production_ids, extended_goto_items, goto_items, leaves } = options,
        code: SKExpression[] = state.code || [],
        SHOULD_IGNORE = extended_goto_items.has(item.body) /* && !goto_items.some(i => i.body == item.body) */;

    let leaf_node = code, prods = [], original_prods = [], INDIRECT = false, EMPTY = false;

    if (SHOULD_IGNORE) {


        if (options.helper.ANNOTATED)
            code.push(sk`"--leafy--"`);

        state.transition_type = TRANSITION_TYPE.IGNORE;

        return {
            leaf: {
                root: code,
                leaf: code,
                prods: options.production_ids.slice(),
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

            leaf_node = sc;

            original_prods = itemsToProductionIDs([item], grammar);

            prods = processProductionChain(leaf_node, options, original_prods);

            if (prods[0] == 0)
                console.log(item.renderUnformattedWithProduction(grammar), prods);

            code.push(<SKExpression>sk`state.push_fn(${call_name}, ${prods[0]})`);

            code.push(createProductionReturn(production, "prod", "prod_start"));


        } else {

            const WILL_CALL_PRODUCTION_FUNCTION = ((item.offset >= 0) &&
                (options.scope == "RD" || (state.offset > 1)) &&
                (state.transition_type == TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS ||
                    state.transition_type == TRANSITION_TYPE.ASSERT_PRODUCTION_CALL ||
                    state.transition_type == TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS));

            const CAN_SKIP_IF_BRANCH = WILL_CALL_PRODUCTION_FUNCTION ||
                (state.transition_type == TRANSITION_TYPE.ASSERT
                    || state.transition_type == TRANSITION_TYPE.ASSERT_PEEK
                    || state.transition_type == TRANSITION_TYPE.ASSERT_PEEK_VP);

            const

                scan = state.transition_type == (TRANSITION_TYPE.ASSERT_CONSUME
                    && !item.atEND) || (state.offset <= 1 && options.scope == "GOTO")
                    ? createScanFunctionCall([item], options)
                    : undefined;

            if (scan) code.push(scan);

            ({ leaf_node, prods, INDIRECT, original_prods } = renderItem(code, item, options, CAN_SKIP_IF_BRANCH));
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
