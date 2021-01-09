import { Grammar, Production } from "../types/grammar.js";
import { ProductionSymbol } from "../types/Symbol";
import { Item } from "../util/common.js";
import {
    createNoCheckShift,
    getRootSym,
    createReduceFunction,
    createDefaultReduceFunction,
    createAssertionShift,
    isSymAProduction,
    g_lexer_name,
    addSkipCallNew,
    getSkippableSymbolsFromItems
} from "./utilities/utilities.js";
import { CompilerRunner } from "./types/CompilerRunner.js";
import { SC, VarSC } from "./utilities/skribble.js";


export function renderProduction(
    code_node: SC,
    production: Production,
    productions: Set<number> = new Set,
    lexer_name: VarSC = g_lexer_name,
    USE_IF: boolean = true
): { code_node: SC; } {

    productions.add(<number>production.id);

    if (USE_IF) {
        const _if = SC.If(SC.Call(SC.Constant("$" + production.name), lexer_name));
        code_node.addStatement(_if);
        code_node.addStatement(SC.Empty());
        return { code_node: _if };
    } else {
        code_node.addStatement(SC.Call(SC.Constant("$" + production.name), lexer_name));
        return { code_node };
    }
}
export function renderItemProduction(
    code_node: SC,
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    lexer_name: VarSC = g_lexer_name,
    USE_IF: boolean = true
): { code_node: SC; } {
    const production = item.offset == 0 ? item.getProduction(grammar)
        : item.getProductionAtSymbol(grammar) ?? item.getProduction(grammar);
    return renderProduction(code_node, production, productions, lexer_name, USE_IF);
}
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
function isProductionPassthrough(production_id: number, grammar: Grammar): {
    IS_PASSTHROUGH: boolean; first_non_passthrough: number; passthrough_chain: number[];
} {
    const production = grammar[production_id];

    const IS_PASSTHROUGH = production.bodies.length == 1
        && production.bodies[0].sym.length == 1
        && isSymAProduction(production.bodies[0].sym[0]);

    let first_non_passthrough = -1, passthrough_chain = [];

    if (IS_PASSTHROUGH) {
        const sym = <ProductionSymbol>production.bodies[0].sym[0];

        const { first_non_passthrough: fnp, passthrough_chain: pc } = isProductionPassthrough(sym.val, grammar);
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
export function renderItemSym(
    code_node: SC,
    item: Item,
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    RENDER_WITH_NO_CHECK = false,
    lexer_name: VarSC = g_lexer_name
): { code_node: SC; } {

    let bool_expression = null;
    let IS_PASSTHROUGH = false, passthrough_chain = null, first_non_passthrough = 0;
    if (item.atEND) {
        renderItemReduction(code_node, item, grammar);
    } else {
        const sym = getRootSym(item.sym(grammar), grammar);

        if (sym.type == "production") {

            ({ IS_PASSTHROUGH, first_non_passthrough, passthrough_chain } = isProductionPassthrough(sym.val, grammar));

            bool_expression = SC.Call(SC.Constant("$" + grammar[first_non_passthrough].name), lexer_name);

            productions.add(first_non_passthrough);

            RENDER_WITH_NO_CHECK = false;

        } else {
            if (RENDER_WITH_NO_CHECK) {
                code_node.addStatement(createNoCheckShift(grammar, runner, lexer_name));
            } else {
                bool_expression = createAssertionShift(grammar, runner, sym, lexer_name).expressions[0];

                RENDER_WITH_NO_CHECK = false;
            }
        }
    }

    if (!RENDER_WITH_NO_CHECK) {
        const _if = SC.If(bool_expression);
        code_node.addStatement(_if);
        code_node.addStatement(SC.Empty());
        code_node = _if;
    } else if (bool_expression) {
        code_node.addStatement(bool_expression);
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
    grammar: Grammar,
    runner: CompilerRunner,
    productions: Set<number> = new Set,
    DONT_CHECK = false,
    lexer_name: VarSC = g_lexer_name
): SC {


    if (!item.atEND) {
        const { code_node: leaf } = renderItemSym(code_node, item, grammar, runner, productions, DONT_CHECK, lexer_name);
        const new_item = item.increment();

        if (!new_item.atEND) {
            const { reset_sym } = grammar.item_map.get(item.id),
                skippable = getSkippableSymbolsFromItems([item], grammar);
            leaf.addStatement(addSkipCallNew(skippable, grammar, runner, lexer_name));
        }

        code_node = renderItem(leaf, item.increment(), grammar, runner, productions, false, lexer_name);
    } else {
        return renderItemSym(code_node, item, grammar, runner, productions, true, lexer_name).code_node;
    }

    return code_node;
}
