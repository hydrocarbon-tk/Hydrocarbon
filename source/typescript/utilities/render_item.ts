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