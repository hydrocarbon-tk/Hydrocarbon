/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

import { TokenType } from "@candlelib/wind";
import {
    getRootSym,
    getSymbolsFromClosure,
    getTokenSymbolsFromItems,
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
    getIncludeBooleans,
    createBranchFunction,
    createConsumeSk,
    createDefaultReduceFunctionSk,
    createReduceFunctionSK,
    createScanFunctionCall,
    getProductionFunctionName
} from "./code_generating.js";
import { rec_glob_lex_name } from "./global_names.js";
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

    if (body.reduce_id >= 0)
        code_node.push(createReduceFunctionSK(item, grammar));
    else if (item.len > 1)
        code_node.push(createDefaultReduceFunctionSk(item));
}


export function renderItem(
    leaf_expressions: SKExpression[],
    item: Item,
    options: RenderBodyOptions,
    RENDER_WITH_NO_CHECK = false,
    lex_name: string = rec_glob_lex_name,
    POST_CONSUME = false,
    items = [],
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
                items = [item.toEND()],
                code: SKExpression[] = null;

            ({ leaf_node: code, prods, original_prods } = renderItem(call_body, item.increment(), options, false, lex_name, true, items));

            const
                call_name = createBranchFunction(call_body, options),
                rc = [];

            rc.push(sk`pushFN(data, &> ${call_name}, data.rules_ptr)`);
            rc.push(sk`return : ${getProductionFunctionName(production)}(l, data,db,state,data.rules_ptr,prod_start);`);
            if (RENDER_WITH_NO_CHECK) {
                leaf_expressions.push(...rc);
            } else {

                const symbols = getTokenSymbolsFromItems(getClosure([item], grammar), grammar);


                const _if = <SKIf & { expression: SKBlock; }>sk`if (${getIncludeBooleans(symbols, grammar, lex_name)}) : {}`;

                _if.expression.expressions = rc;

                leaf_expressions.push(_if);
            }


            return { leaf_node: code, prods, INDIRECT, original_prods, EMPTY };

        } else if (!Sym_Is_Empty(item.sym(grammar))) {

            if (POST_CONSUME)
                leaf_expressions.push(createScanFunctionCall([item], options));

            if (RENDER_WITH_NO_CHECK) {
                if (Sym_Is_Not_Consumed(sym))
                    leaf_expressions.push(<SKExpression>sk`${lex_name}.setToken(${lex_name}.type, 0, 0)`);
                leaf_expressions.push(createConsumeSk(lex_name));
                return renderItem(leaf_expressions, item.increment(), options, false, lex_name, true);
            } else {
                RENDER_WITH_NO_CHECK = false;

                const _if = <SKIf & { expression: SKBlock; }>sk`if (${getIncludeBooleans([sym], grammar, lex_name)}) : {}`;

                leaf_expressions.push(_if);
                if (Sym_Is_Not_Consumed(sym))
                    _if.expression.expressions.push(<SKExpression>sk`${lex_name}.setToken(${lex_name}.type, 0, 0)`);
                _if.expression.expressions.push(createConsumeSk(lex_name));

                return renderItem(_if.expression.expressions, item.increment(), options, false, lex_name, true);
            }
        } else {
            original_prods = itemsToProductionIDs([item], grammar);
            prods = processProductionChain(leaf_expressions, options, itemsToProductionIDs([item], grammar));
            leaf_expressions.push(<SKExpression>sk`l.setToken( ${TokenTypes.SYMBOL}, 0, 0 )`);
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
