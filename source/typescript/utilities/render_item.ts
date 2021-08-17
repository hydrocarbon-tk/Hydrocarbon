/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

import {
    getRootSym, getTokenSymbolsFromItems,
    Sym_Is_A_Production,
    Sym_Is_Empty,
    Sym_Is_Not_Consumed
} from "../grammar/nodes/symbol.js";
import { TokenTypes } from "../runtime/TokenTypes.js";
import { sk } from "../skribble/skribble.js";
import { SKBlock, SKExpression, SKIf } from "../skribble/types/node";
import { RenderBodyOptions } from "../types/render_body_options";
import { getClosure } from "./closure.js";
import {
    createBranchFunction,
    createConsumeSk,
    createDefaultReduceFunctionSk,
    createProductionReturn,
    createReduceFunctionSK,
    createScanFunctionCall, getIncludeBooleans
} from "./code_generating.js";
import { Item, itemsToProductionIDs } from "./item.js";
import { processProductionChain } from "./process_production_reduction_sequences.js";

export function renderItemReduction(
    code_node: SKExpression[],
    item: Item,
    options: RenderBodyOptions
) {

    const { grammar } = options;

    //Virtual productions do not reduce
    if (item.getProduction(grammar).type == "virtual-production")
        // Virtual Productions Do Not Reduce
        return;

    const body = item.body_(grammar);

    if (body.reduce_id >= 0) {
        code_node.push(createReduceFunctionSK(item, grammar));
    } else if (item.len > 1)
        code_node.push(createDefaultReduceFunctionSk(item));
}


export function renderItem(
    leaf_expressions: SKExpression[],
    item: Item,
    options: RenderBodyOptions,
    RENDER_WITH_NO_CHECK = false,
    POST_CONSUME = false,
    lex_name: string = "state.lexer",
): { leaf_node: SKExpression[], original_prods: number[], prods: number[]; INDIRECT: boolean; EMPTY: boolean; } {
    const { grammar, helper: runner, called_productions } = options;

    let prods = [], original_prods = [], INDIRECT = false, EMPTY = false;

    if (!item.atEND) {

        const sym = getRootSym(item.sym(grammar), grammar);

        if (Sym_Is_A_Production(sym)) {

            INDIRECT = true;

            const production = grammar.productions[sym.val];

            called_productions.add(<number>production.id);

            let
                call_body = [],
                code: SKExpression[] = null;

            ({ leaf_node: code, prods, original_prods } = renderItem(call_body, item.increment(), options, false, true, lex_name));

            const
                call_name = createBranchFunction(call_body, options),
                rc = [];

            rc.push(sk`state.push_fn( &> ${call_name}, state.get_rules_ptr_val())`);

            rc.push(createProductionReturn(production));

            if (RENDER_WITH_NO_CHECK || POST_CONSUME) {

                leaf_expressions.push(...rc);

            } else {

                const symbols = getTokenSymbolsFromItems(getClosure([item], grammar), grammar);

                const if_stmt = <SKIf & { expression: SKBlock; }>sk`if (${getIncludeBooleans(symbols, grammar, lex_name)}) : {}`;

                if_stmt.expression.expressions = rc;

                leaf_expressions.push(if_stmt);
            }


            return { leaf_node: code, prods, INDIRECT, original_prods, EMPTY };

        } else if (!Sym_Is_Empty(item.sym(grammar))) {

            if (POST_CONSUME)
                leaf_expressions.push(createScanFunctionCall([item], options));

            if (RENDER_WITH_NO_CHECK) {

                if (Sym_Is_Not_Consumed(sym))
                    leaf_expressions.push(<SKExpression>sk`${lex_name}.setToken(${lex_name}.type, 0, 0)`);

                leaf_expressions.push(createConsumeSk(lex_name));

                return renderItem(leaf_expressions, item.increment(), options, false, true, lex_name);
            } else {

                const if_stmt = <SKIf & { expression: SKBlock; }>sk`if (${getIncludeBooleans([sym], grammar, lex_name)}) : {}`;

                leaf_expressions.push(if_stmt);

                if (Sym_Is_Not_Consumed(sym))
                    if_stmt.expression.expressions.push(<SKExpression>sk`${lex_name}.setToken(${lex_name}.type, 0, 0)`);

                if_stmt.expression.expressions.push(createConsumeSk(lex_name));

                return renderItem(if_stmt.expression.expressions, item.increment(), options, false, true, lex_name);
            }
        } else { // Item is at its end position.

            original_prods = itemsToProductionIDs([item], grammar);

            prods = processProductionChain(leaf_expressions, options, itemsToProductionIDs([item], grammar));

            leaf_expressions.push(<SKExpression>sk`state.lexer.setToken( ${TokenTypes.SYMBOL}, 0, 0 )`);

            leaf_expressions.push(createConsumeSk(lex_name));

            EMPTY = true;
        }

    } else {

        renderItemReduction(leaf_expressions, item, options);

        original_prods = itemsToProductionIDs([item], grammar);

        prods = processProductionChain(leaf_expressions, options, itemsToProductionIDs([item], grammar));
    }

    return { leaf_node: leaf_expressions, prods, original_prods, INDIRECT, EMPTY };
}
