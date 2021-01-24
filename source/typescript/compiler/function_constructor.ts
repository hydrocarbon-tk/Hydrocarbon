import { performance } from "perf_hooks";
import { Grammar } from "../types/grammar.js";
import { Production } from "../types/production";
import { RDProductionFunction } from "../types/rd_production_function";
import { RenderBodyOptions } from "../types/render_body_options";
import { SymbolType } from "../types/symbol_type";
import { getClosure } from "../utilities/closure.js";
import {
    rec_glob_lex_name,
    rec_state
} from "../utilities/global_names.js";
import { Item } from "../utilities/item.js";
import { SC } from "../utilities/skribble.js";
import { isSymAProduction } from "../utilities/symbol.js";

import { Helper } from "./helper.js";
import { processRecognizerStates } from "./states/process_recognizer_states.js";
import { completeFunctionProduction, createDebugCall, defaultSelectionClause, processGoTOStates } from "./states/default_state_build.js";
import { yieldGotoStates } from "./states/yield_goto_states.js";
import { yieldStates } from "./states/yield_states.js";
import { getProductionFunctionName } from "../utilities/code_generating.js";
export const accept_loop_flag = SC.Variable("ACCEPT:boolean");

function generateOptions(
    grammar: Grammar,
    runner: Helper,
    /**
     * The production currently being processed.
     */
    production: Production,
    /**
     * Set of all production ids that are referenced within the function
     */
    goto_productions: Item[]
): RenderBodyOptions {
    return {
        grammar,
        helper: runner,
        production,
        goto_items: goto_productions,
        extended_goto_items: [],
        called_productions: new Set(),
        leaf_productions: new Set(),
        //cache: new Map(),
        active_keys: [],
        leaves: [],
        NO_GOTOS: false
    };
}
export function constructHybridFunction(production: Production, grammar: Grammar, runner: Helper): RDProductionFunction {

    const
        rd_fn_name = SC.Constant(getProductionFunctionName(production, grammar) + ":unsigned int"),

        goto_fn_name = SC.Constant(getProductionFunctionName(production, grammar) + "_goto:unsigned int"),

        start = performance.now(),

        p = production,

        code_node_rd = SC.Function(
            rd_fn_name,
            rec_glob_lex_name,
            rec_state),

        code_node_goto = SC.Function(
            goto_fn_name,
            rec_glob_lex_name,
            rec_state,
            SC.Variable("prod:int")
        );

    let items: Item[] = p.bodies.map(b => new Item(b.id, b.length, 0));


    try {

        const

            goto_productions = getClosure(items, grammar).filter(i => !i.atEND && i.sym(grammar).type == SymbolType.PRODUCTION),

            RDOptions = generateOptions(
                grammar, runner,
                production,
                goto_productions
            ),

            rd_states = yieldStates(
                //Filter out items that are left recursive for the given production
                items.filter(i => {

                    const sym = i.sym(grammar);

                    if (sym && isSymAProduction(sym) && sym.val == production.id)
                        return false;

                    return true;
                }), RDOptions, rec_glob_lex_name
            ),

            { code: initial_pass, prods: completed_productions, leaves: rd_leaves }
                = processRecognizerStates(RDOptions, rd_states, defaultSelectionClause),

            GOTO_Options = generateOptions(
                grammar, runner,
                production,
                goto_productions.slice()
            ),

            { code: production_shift_pass, leaves: goto_leaves }
                = processRecognizerStates(
                    GOTO_Options,
                    yieldGotoStates(GOTO_Options, completed_productions),
                    processGoTOStates
                );

        RDOptions.leaves = rd_leaves;
        GOTO_Options.leaves = goto_leaves;

        code_node_rd.addStatement(
            createDebugCall(RDOptions, "RD START"),
            initial_pass,
            createDebugCall(RDOptions, "RD FAILED")
        );

        code_node_goto.addStatement(
            createDebugCall(RDOptions, "GOTO START"),
            production_shift_pass,
            createDebugCall(RDOptions, "GOTO END"),
        );

        completeFunctionProduction(
            code_node_rd,
            code_node_goto,
            rd_fn_name,
            goto_fn_name,
            RDOptions,
            GOTO_Options);

        const end = performance.now();

        const annotation = SC.Expressions(SC.Comment(
            `production name: ${production.name}
            grammar index: ${production.id}
            bodies:\n\t${items.map(i => i.renderUnformattedWithProduction(grammar) + " - " + grammar.item_map.get(i.id).reset_sym.join(",")).join("\n\t\t")}
            compile time: ${((((end - start) * 1000) | 0) / 1000)}ms`));

        return {
            productions: new Set([...RDOptions.called_productions.values(), ...GOTO_Options.called_productions.values(), ...runner.referenced_production_ids.values()]),
            id: p.id,
            fn: (new SC).addStatement(
                (runner.ANNOTATED) ? annotation : undefined,
                code_node_rd,
                GOTO_Options.NO_GOTOS ? undefined : code_node_goto
            )
        };
    } catch (e) {

        const annotation = SC.Expressions(SC.Comment(
            `production name: ${production.name}
grammar index: ${production.id}
bodies:\n\t${items.map(i => i.renderUnformattedWithProduction(grammar) + " - " + grammar.item_map.get(i.id).reset_sym.join(",")).join("\n\t\t")}`));

        return {
            productions: new Set,
            id: p.id,
            fn: code_node_rd.addStatement(annotation, SC.Expressions(SC.Comment(`Could Not Parse [${production.name}] in Recursive Descent Mode \n${e.message + e.stack + ""}\n`)))
        };
    }

}