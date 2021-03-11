/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Grammar } from "../types/grammar";
import { RenderBodyOptions } from "../types/render_body_options";
import { ProductionSymbol } from "../types/symbol";
import {
    createAssertionShift,
    createBranchFunction,
    createConsume,
    createDefaultReduceFunction,
    createReduceFunction,
    createSkipCall,
    getProductionFunctionName
} from "./code_generating.js";
import { rec_glob_lex_name } from "./global_names.js";
import { Item, itemsToProductions } from "./item.js";
import { processProductionChain } from "./process_production_reduction_sequences.js";
import { SC, VarSC } from "./skribble.js";
import {
    getRootSym,
    getSkippableSymbolsFromItems,

    Sym_Is_A_Production,
    Sym_Is_A_Production_Token
} from "./symbol.js";

export function renderItemReduction(
    code_node: SC,
    item: Item,
    options: RenderBodyOptions,
    CAN_USE_CLASS_REDUCER = true) {
    const { grammar } = options;
    //Virtual productions do not reduce
    if (item.getProduction(grammar).type == "virtual-production") {
        // code_node.addStatement("---------Virtual Productions Do Not Reduce-----------");
        return;
    }
    const body = item.body_(grammar);

    if (CAN_USE_CLASS_REDUCER && (body.reduce_id >= 0 || item.len > 1))
        code_node.addStatement(SC.Value(`prod = $${item.getProduction(grammar).name}_reducer(l,data,state,prod,puid)`));
    else if (body.reduce_id >= 0)
        code_node.addStatement(createReduceFunction(item, grammar));
    else if (item.len > 1)
        code_node.addStatement(createDefaultReduceFunction(item));

}

function getProductionPassthroughInformation(production_id: number, grammar: Grammar): {
    IS_PASSTHROUGH: boolean; first_non_passthrough: number; passthrough_chain: number[];
} {
    const production = grammar[production_id];

    const IS_PASSTHROUGH = production.bodies.length == 1
        && production.bodies[0].sym.length == 1
        && Sym_Is_A_Production(production.bodies[0].sym[0])
        && !Sym_Is_A_Production_Token(production.bodies[0].sym[0]);

    let first_non_passthrough = -1, passthrough_chain = [];

    if (IS_PASSTHROUGH) {
        const sym = <ProductionSymbol>production.bodies[0].sym[0];

        const { first_non_passthrough: fnp, passthrough_chain: pc } = getProductionPassthroughInformation(sym.val, grammar);
        passthrough_chain = passthrough_chain.concat(production_id, pc);
        first_non_passthrough = fnp;
    } else {
        first_non_passthrough = production_id;

    }

    return {
        IS_PASSTHROUGH,
        first_non_passthrough,
        passthrough_chain
    };
}

export function renderItem(
    leaf_node: SC,
    item: Item,
    options: RenderBodyOptions,
    RENDER_WITH_NO_CHECK = false,
    lexer_name: VarSC = rec_glob_lex_name,
    FROM_UPPER = false,
    items = [],
): { leaf_node: SC, original_prods: number[], prods: number[]; INDIRECT: boolean; } {
    const { grammar, helper: runner, called_productions } = options;

    let prods = [], original_prods = [], INDIRECT = false;

    if (!item.atEND) {

        if (FROM_UPPER) {
            const skippable = getSkippableSymbolsFromItems([item], grammar);
            leaf_node.addStatement(createSkipCall(skippable, options, lexer_name, false));
        }

        let bool_expression = null;

        const sym = getRootSym(item.sym(grammar), grammar);
        leaf_node.addStatement(SC.Value("puid |=" + grammar.item_map.get(item.id).sym_uid));
        if (Sym_Is_A_Production(sym) && !Sym_Is_A_Production_Token(sym)) {

            INDIRECT = true;

            const production = grammar[sym.val];

            called_productions.add(<number>production.id);

            const { first_non_passthrough, passthrough_chain, IS_PASSTHROUGH } = getProductionPassthroughInformation(production.id, grammar);

            let call_body = new SC;

            let items = [item.toEND()];

            if (IS_PASSTHROUGH) {
                for (let prod_id of passthrough_chain.reverse()) {
                    const body = grammar[prod_id].bodies[0];
                    const body_item = new Item(body.id, body.length, body.length);
                    items.push(body_item);
                    renderItemReduction(call_body, body_item, options);
                }
            }

            let code;

            ({ leaf_node: code, prods, original_prods } = renderItem(call_body, item.increment(), options, false, lexer_name, true, items));

            if (!item.increment().atEND)
                call_body.addStatement(SC.Value("return -1"));
            const call_name = createBranchFunction(call_body, call_body, options);
            const rc = new SC;

            rc.addStatement(SC.Call("pushFN", "data", call_name));
            rc.addStatement(SC.Call("pushFN", "data", getProductionFunctionName(grammar[first_non_passthrough], grammar)));
            rc.addStatement(SC.UnaryPre(SC.Return, SC.Value("puid")));
            // /rc.addStatement(SC.UnaryPre(SC.Return, SC.Value("0")));

            leaf_node.addStatement(rc);

            return { leaf_node: code, prods, INDIRECT, original_prods };

        } else if (RENDER_WITH_NO_CHECK) {
            leaf_node.addStatement(createConsume(lexer_name));
        } else {
            bool_expression = createAssertionShift(options, sym, lexer_name);
            RENDER_WITH_NO_CHECK = false;
        }

        if (!RENDER_WITH_NO_CHECK) {
            const _if = SC.If(bool_expression);
            leaf_node.addStatement(_if);
            leaf_node.addStatement(SC.Empty());
            return renderItem(_if, item.increment(), options, false, lexer_name, true);
        } else {
            return renderItem(leaf_node, item.increment(), options, false, lexer_name, true);
        }

    } else {
        renderItemReduction(leaf_node, item, options, false);

        original_prods = itemsToProductions([item], grammar);

        prods = processProductionChain(new SC, options, itemsToProductions([item], grammar));
    }


    return { leaf_node, prods, original_prods, INDIRECT };
}