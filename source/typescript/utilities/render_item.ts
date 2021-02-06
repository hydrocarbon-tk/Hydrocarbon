import { Grammar } from "../types/grammar";
import { RenderBodyOptions } from "../types/render_body_options";
import { ProductionSymbol } from "../types/symbol";
import {
    createAssertionShift, createDefaultReduceFunction,
    createReduceFunction, createSkipCall, renderProductionCall
} from "./code_generating.js";
import { rec_glob_lex_name } from "./global_names.js";
import { Item } from "./item.js";
import { SC, VarSC } from "./skribble.js";
import {
    createNoCheckShift,
    getRootSym,
    getSkippableSymbolsFromItems,
    Sym_Is_A_Production
} from "./symbol.js";

export function renderItemReduction(
    code_node: SC,
    item: Item,
    grammar: Grammar) {
    const body = item.body_(grammar);

    if (body.reduce_id >= 0)
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
        && Sym_Is_A_Production(production.bodies[0].sym[0]);

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
export function renderItemSymbol(
    code_node: SC,
    item: Item,
    options: RenderBodyOptions,
    RENDER_WITH_NO_CHECK = false,
    lexer_name: VarSC = rec_glob_lex_name
): { code_node: SC; } {

    const { grammar, helper: runner, called_productions } = options;

    let bool_expression = null;
    let IS_PASSTHROUGH = false, passthrough_chain = null, first_non_passthrough = 0;

    if (item.atEND) {

        renderItemReduction(code_node, item, grammar);

        return { code_node };
    } else {
        const sym = getRootSym(item.sym(grammar), grammar);

        if (sym.type == "production") {

            ({ IS_PASSTHROUGH, first_non_passthrough, passthrough_chain } = getProductionPassthroughInformation(sym.val, grammar));

            bool_expression = renderProductionCall(grammar[first_non_passthrough], options, lexer_name);

            RENDER_WITH_NO_CHECK = false;

        } else if (RENDER_WITH_NO_CHECK) {
            code_node.addStatement(createNoCheckShift(grammar, runner, lexer_name));
            //bool_expression = SC.Empty();
            //RENDER_WITH_NO_CHECK = false;
        } else {
            bool_expression = createAssertionShift(grammar, runner, sym, lexer_name);

            RENDER_WITH_NO_CHECK = false;
        }

    }

    if (!RENDER_WITH_NO_CHECK) {
        const _if = SC.If(bool_expression);
        code_node.addStatement(_if);
        code_node.addStatement(SC.Empty());
        code_node = _if;
    } else {
    }

    if (IS_PASSTHROUGH) {
        for (let prod_id of passthrough_chain.reverse()) {
            const body = grammar[prod_id].bodies[0];
            const body_item = new Item(body.id, body.length, body.length);
            renderItemReduction(code_node, body_item, grammar);
        }
    }

    return { code_node };
}

export function renderItem(
    code_node: SC,
    item: Item,
    options: RenderBodyOptions,
    DONT_CHECK = false,
    lexer_name: VarSC = rec_glob_lex_name
): SC {
    const { grammar, helper: runner } = options;

    if (!item.atEND) {
        const
            { code_node: leaf } = renderItemSymbol(code_node, item, options, DONT_CHECK, lexer_name),
            new_item = item.increment();

        if (!new_item.atEND) {
            const skippable = getSkippableSymbolsFromItems([new_item], grammar);
            leaf.addStatement(createSkipCall(skippable, grammar, runner, lexer_name));
        }

        code_node = renderItem(leaf, item.increment(), options, false, lexer_name);
    } else {
        return renderItemSymbol(code_node, item, options, true, lexer_name).code_node;
    }

    return code_node;
}
