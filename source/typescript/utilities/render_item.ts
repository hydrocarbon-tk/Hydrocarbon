/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    getRootSym,
    getSkippableSymbolsFromItems,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token,
    Sym_Is_Empty
} from "../grammar/nodes/symbol.js";
import { sk } from "../skribble/skribble.js";
import { SKBlock, SKExpression, SKIf } from "../skribble/types/node";
import { RenderBodyOptions } from "../types/render_body_options";
import {
    createAssertionShiftSk,
    createBranchFunctionSk,
    createConsumeSk,
    createDefaultReduceFunctionSk,
    createReduceFunctionSK,
    createSkipCallSk,
    getProductionFunctionName
} from "./code_generating.js";
import { rec_glob_lex_name } from "./global_names.js";
import { Item, itemsToProductionIDs } from "./item.js";
import { processProductionChain } from "./process_production_reduction_sequences.js";

export function renderItemReduction(
    code_node: SKExpression[],
    item: Item,
    options: RenderBodyOptions,
    CAN_USE_CLASS_REDUCER = true
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
    lexer_name: string = rec_glob_lex_name,
    FROM_UPPER = false,
    items = [],
): { leaf_node: SKExpression[], original_prods: number[], prods: number[]; INDIRECT: boolean; } {
    const { grammar, helper: runner, called_productions } = options;

    let prods = [], original_prods = [], INDIRECT = false, EMPTY = false;

    if (!item.atEND) {

        const SYM_IS_EMPTY = Sym_Is_Empty(item.sym(grammar));

        if (FROM_UPPER) {

            const
                skippable = getSkippableSymbolsFromItems([item], grammar),
                skip = createSkipCallSk(skippable, options, lexer_name, false);

            if (skip) leaf_expressions.push(skip);
        }

        let bool_expression = null;

        const sym = getRootSym(item.sym(grammar), grammar);

        if (Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym)) {

            const IS_TOKEN_PRODUCTION = Sym_Is_A_Production_Token(sym);

            INDIRECT = true;

            const production = grammar.productions[sym.val];

            called_productions.add(<number>production.id);

            let call_body = [];

            let items = [item.toEND()];

            let code: SKExpression[] = null;

            ({ leaf_node: code, prods, original_prods } = renderItem(call_body, item.increment(), options, false, lexer_name, true, items));


            if (IS_TOKEN_PRODUCTION)
                call_body.unshift(sk`convert_prod_to_token(data, prod_start)`);

            const call_name = createBranchFunctionSk(call_body, options);
            const rc = [];

            rc.push(sk`pushFN(data, &> ${call_name}, data.rules_ptr)`);
            rc.push(sk`return : ${getProductionFunctionName(production, grammar)}(l, data,db,state,data.rules_ptr,prod_start);`);

            leaf_expressions.push(...rc);
            return { leaf_node: code, prods, INDIRECT, original_prods };

        } else if (!SYM_IS_EMPTY) {
            if (RENDER_WITH_NO_CHECK) {

                leaf_expressions.push(createConsumeSk(lexer_name));
            } else {
                bool_expression = createAssertionShiftSk(options, sym, lexer_name);
                RENDER_WITH_NO_CHECK = false;
            }


            if (!RENDER_WITH_NO_CHECK) {
                const _if = <SKIf & { expression: SKBlock; }>sk`if (${bool_expression}) : {}`;

                leaf_expressions.push(_if);

                if (leaf_expressions.slice(-1)[0].type !== "return")
                    leaf_expressions.push(<SKExpression>sk`return:-1`);


                return renderItem(_if.expression.expressions, item.increment(), options, false, lexer_name, true);
            } else {
                return renderItem(leaf_expressions, item.increment(), options, false, lexer_name, true);
            }
        } else {
            original_prods = itemsToProductionIDs([item], grammar);

            prods = processProductionChain(leaf_expressions, options, itemsToProductionIDs([item], grammar));

            leaf_expressions.push(sk`l.setToken( TokenSymbol, 0, 0 )`);
            leaf_expressions.push(sk`consume(l,data,state)`);

            EMPTY = true;
        }

    } else {
        renderItemReduction(leaf_expressions, item, options, false);

        original_prods = itemsToProductionIDs([item], grammar);

        prods = processProductionChain(leaf_expressions, options, itemsToProductionIDs([item], grammar));
    }


    return { leaf_node: leaf_expressions, prods, original_prods, INDIRECT, EMPTY };
}
