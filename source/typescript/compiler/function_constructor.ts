import { performance } from "perf_hooks";
import { Grammar } from "../types/grammar.js";
import { Production } from "../types/production";
import { RDProductionFunction } from "../types/rd_production_function";
import { RenderBodyOptions } from "../types/render_body_options";
import {
    rec_glob_lex_name,
    rec_state
} from "../utilities/global_names.js";
import { Item } from "../utilities/item.js";
import { SC } from "../utilities/skribble.js";
import { Sym_Is_A_Production } from "../utilities/symbol.js";
import { Helper } from "./helper.js";
import { processRecognizerStates } from "./states/process_recognizer_states.js";
import { completeFunctionProduction, createDebugCall, default_getSelectionClause, processGoTOStates } from "./states/default_state_build.js";
import { yieldGotoStates } from "./states/yield_goto_states.js";
import { yieldStates } from "./states/yield_states.js";
import { getProductionFunctionName } from "../utilities/code_generating.js";
import { getProductionClosure } from "../utilities/production.js";
export const accept_loop_flag = SC.Variable("ACCEPT:boolean");

export function generateOptions(
    grammar: Grammar,
    runner: Helper,
    /**
     * The production currently being processed.
     */
    production: Production
): RenderBodyOptions {
    return {
        grammar,
        helper: runner,
        production,
        goto_items: getGotoItemsFromProductionClosure(production, grammar),
        extended_goto_items: [],
        called_productions: new Set(),
        leaf_productions: new Set(),
        active_keys: [],
        leaves: [],
        NO_GOTOS: false
    };
}

export function getGotoItemsFromProductionClosure(production: Production, grammar: Grammar): Item[] {
    return getProductionClosure(production.id, grammar).filter(i => !i.atEND && Sym_Is_A_Production(i.sym(grammar)));
}

export function getItemsFromProduction(production: Production): Item[] {
    return production.bodies.map(b => new Item(b.id, b.length, 0));
}

export function getProductionItemsThatAreNotRightRecursive(p: Production, grammar: Grammar): Item[] {
    return getItemsFromProduction(p).filter(i => {

        const sym = i.sym(grammar);

        if (sym && Sym_Is_A_Production(sym) && sym.val == p.id)
            return false;

        return true;
    });
}

export function constructHybridFunction(production: Production, grammar: Grammar, runner: Helper): RDProductionFunction {

    const

        rd_fn_name = SC.Constant(getProductionFunctionName(production, grammar) + ":unsigned int"),

        goto_fn_name = SC.Constant(getProductionFunctionName(production, grammar) + "_goto:unsigned int"),

        start = performance.now(),

        code_node_rd = SC.Function(
            rd_fn_name,
            rec_glob_lex_name,
            rec_state),

        code_node_goto = SC.Function(
            goto_fn_name,
            rec_glob_lex_name,
            rec_state,
            SC.Variable("prod:int")
        ),

        RDOptions = generateOptions(
            grammar, runner,
            production
        ),

        rd_states = yieldStates(
            //Filter out items that are left recursive for the given production
            getProductionItemsThatAreNotRightRecursive(production, grammar),
            RDOptions
        ),

        { code: initial_pass, prods: completed_productions, leaves: rd_leaves }
            = processRecognizerStates(RDOptions, rd_states, default_getSelectionClause),

        GOTO_Options = generateOptions(
            grammar, runner,
            production
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
            bodies:\n\t${getItemsFromProduction(production).map(i => i.renderUnformattedWithProduction(grammar) + " - " + grammar.item_map.get(i.id).reset_sym.join(",")).join("\n\t\t")}
            compile time: ${((((end - start) * 1000) | 0) / 1000)}ms`));

    return {
        productions: new Set([...RDOptions.called_productions.values(), ...GOTO_Options.called_productions.values(), ...runner.referenced_production_ids.values()]),
        id: production.id,
        fn: (new SC).addStatement(
            (runner.ANNOTATED) ? annotation : undefined,
            code_node_rd,
            GOTO_Options.NO_GOTOS ? undefined : code_node_goto
        )
    };
}

