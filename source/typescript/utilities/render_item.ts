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
import { Item } from "./item.js";
import { SC, VarSC } from "./skribble.js";
import {
    getRootSym,
    getSkippableSymbolsFromItems,

    Sym_Is_A_Production
} from "./symbol.js";

export function renderItemReduction(
    code_node: SC,
    item: Item,
    grammar: Grammar) {
    //Virtual productions do not reduce
    if (item.getProduction(grammar).type == "virtual-production") {
        // code_node.addStatement("---------Virtual Productions Do Not Reduce-----------");
        return;
    }

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
//*
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
            const production = grammar[sym.val];

            if (Production_Is_Trivial(production)) {
                //console.log(syms[0], production);

                const syms = getTokenSymbolsFromItems(getClosure(getProductionClosure(production.id, grammar), grammar), grammar);

                bool_expression = getIncludeBooleans(<TokenSymbol[]>syms, grammar, runner, lexer_name);

                if (options.helper.ANNOTATED)
                    code_node.addStatement(`------------- folded ::${production.name} -------------`);

                const _if = SC.If(bool_expression).addStatement(createConsume(lexer_name));
                code_node.addStatement(_if);
                code_node.addStatement(SC.Empty());
                code_node = _if;

                RENDER_WITH_NO_CHECK = true;

            } else {


                ({ IS_PASSTHROUGH, first_non_passthrough, passthrough_chain } = getProductionPassthroughInformation(sym.val, grammar));

                bool_expression = createProductionCall(grammar[first_non_passthrough], options, lexer_name);

                RENDER_WITH_NO_CHECK = false;
            }


        } else if (RENDER_WITH_NO_CHECK) {
            code_node.addStatement(createConsume(lexer_name));
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
}//*/

export function renderItem(
    leaf_node: SC,
    item: Item,
    options: RenderBodyOptions,
    RENDER_WITH_NO_CHECK = false,
    lexer_name: VarSC = rec_glob_lex_name,
    FROM_UPPER = false
): SC {
    const { grammar, helper: runner, called_productions } = options;

    if (!item.atEND) {

        if (FROM_UPPER) {
            const skippable = getSkippableSymbolsFromItems([item], grammar);
            leaf_node.addStatement(createSkipCall(skippable, grammar, runner, lexer_name));
        }

        let bool_expression = null;

        const sym = getRootSym(item.sym(grammar), grammar);

        if (Sym_Is_A_Production(sym)) {

            const production = grammar[sym.val];

            called_productions.add(<number>production.id);

            const { first_non_passthrough, passthrough_chain, IS_PASSTHROUGH } = getProductionPassthroughInformation(production.id, grammar);

            let call_body = new SC;

            if (IS_PASSTHROUGH) {
                for (let prod_id of passthrough_chain.reverse()) {
                    const body = grammar[prod_id].bodies[0];
                    const body_item = new Item(body.id, body.length, body.length);
                    renderItemReduction(call_body, body_item, grammar);
                }
            }

            const code = renderItem(call_body, item.increment(), options, false, lexer_name, true);

            const call_name = createBranchFunction([item.increment()], call_body, grammar, runner);

            const rc = new SC;

            rc.addStatement(SC.Call("pushFN", "data", call_name));
            rc.addStatement(SC.Call("pushFN", "data", getProductionFunctionName(grammar[first_non_passthrough], grammar)));
            rc.addStatement(SC.UnaryPre(SC.Return, SC.Value("0")));

            leaf_node.addStatement(rc);

            return code;

        } else if (RENDER_WITH_NO_CHECK) {
            leaf_node.addStatement(createConsume(lexer_name));
        } else {
            bool_expression = createAssertionShift(grammar, runner, sym, lexer_name);
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

    } else

        renderItemReduction(leaf_node, item, grammar);

    return leaf_node;
}

/*
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
*/