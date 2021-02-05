import { performance } from "perf_hooks";
import { Grammar } from "../types/grammar.js";
import { Production } from "../types/production";
import { RDProductionFunction } from "../types/rd_production_function";
import { RenderBodyOptions } from "../types/render_body_options";
import { getProductionFunctionName } from "../utilities/code_generating.js";
import {
    rec_glob_data_name,
    rec_glob_lex_name,
    rec_state
} from "../utilities/global_names.js";
import { Item } from "../utilities/item.js";
import { getProductionClosure } from "../utilities/production.js";
import { ConstSC, SC, VarSC } from "../utilities/skribble.js";
import { Sym_Is_A_Production } from "../utilities/symbol.js";
import { Helper } from "./helper.js";
import { default_getSelectionClause } from "./states/default_getSelectionClause.js";
import { completeFunctionProduction, processGoTOStates } from "./states/default_state_build.js";
import { processRecognizerStates } from "./states/process_recognizer_states.js";
import { yieldGotoStates } from "./states/yield_goto_states.js";
import { yieldStates } from "./states/yield_states.js";
export const accept_loop_flag = SC.Variable("ACCEPT:boolean");

export function generateOptions(
    grammar: Grammar,
    runner: Helper,
    /**
     * The production currently being processed.
     */
    productions: Production[]
): RenderBodyOptions {
    return {
        grammar,
        helper: runner,
        productions: productions,
        production_ids: productions.map(p => p.id),
        goto_items: productions.flatMap(p => getGotoItemsFromProductionClosure(p, grammar)).setFilter(i => i.id),
        extended_goto_items: [],
        called_productions: new Set(),
        leaf_productions: new Set(),
        active_keys: [],
        leaves: [],
        NO_GOTOS: false,
        global_production_items: [...grammar.item_map.values()].map(i => i.item).filter(i => !i.atEND && Sym_Is_A_Production(i.sym(grammar)))
    };
}

export function getGotoItemsFromProductionClosure(production: Production, grammar: Grammar): Item[] {
    return getProductionClosure(production.id, grammar).filter(i => !i.atEND && Sym_Is_A_Production(i.sym(grammar)));
}

export function getItemsFromProduction(production: Production): Item[] {
    return production.bodies.map(b => new Item(b.id, b.length, 0));
}

export function getProductionItemsThatAreNotRightRecursive(productions: Production[], grammar: Grammar): Item[] {
    return productions.flatMap(p => getItemsFromProduction(p).filter(i => {

        const sym = i.sym(grammar);

        if (sym && Sym_Is_A_Production(sym) && sym.val == p.id)
            return false;

        return true;
    })).setFilter(i => i.id);
}

export function constructHybridFunction(production: Production, grammar: Grammar, runner: Helper): RDProductionFunction {

    const

        rd_fn_name = SC.Constant(getProductionFunctionName(production, grammar) + ":unsigned int"),

        goto_fn_name = SC.Constant(getProductionFunctionName(production, grammar) + "_goto:unsigned int"),

        start = performance.now(),

        { RDOptions, GOTO_Options, RD_fn_contents, GOTO_fn_contents }
            = compileProductionFunctions(grammar, runner, [production]),

        rd_function = SC.Function(
            rd_fn_name,
            rec_glob_lex_name,
            rec_glob_data_name,
            rec_state).addStatement(RD_fn_contents),

        goto_function = SC.Function(
            goto_fn_name,
            rec_glob_lex_name,
            rec_glob_data_name,
            rec_state,
            SC.Variable("prod:int")
        ).addStatement(GOTO_fn_contents);

    completeFunctionProduction(
        RD_fn_contents,
        GOTO_fn_contents,
        rd_fn_name,
        goto_fn_name,
        RDOptions,
        GOTO_Options);


    const annotation = SC.Expressions(SC.Comment(
        `production name: ${production.name}
            grammar index: ${production.id}
            bodies:\n\t${getItemsFromProduction(production).map(i => i.renderUnformattedWithProduction(grammar) + " - " + grammar.item_map.get(i.id).reset_sym.join(",")).join("\n\t\t")}
            compile time: ${((((performance.now() - start) * 1000) | 0) / 1000)}ms`));

    return {
        productions: new Set([...RDOptions.called_productions.values(), ...GOTO_Options.called_productions.values(), ...runner.referenced_production_ids.values()]),
        id: production.id,
        fn: (new SC).addStatement(
            (runner.ANNOTATED) ? annotation : undefined,
            rd_function,
            GOTO_Options.NO_GOTOS ? undefined : goto_function
        )
    };
}

export function compileProductionFunctions(
    grammar: Grammar,
    runner: Helper,
    productions: Production[],
    /** 
     * Only include transitions with the
     * with the matching symbols. Only applies
     * to the first transition encountered.
     */
    filter_symbols: Symbol[] = []
) {
    const

        RDOptions = generateOptions(
            grammar, runner,
            productions
        ),

        rd_states = yieldStates(
            //Filter out items that are left recursive for the given production
            getProductionItemsThatAreNotRightRecursive(productions, grammar),
            RDOptions
        ),

        { code: RD_fn_contents, prods: completed_productions, leaves: rd_leaves } = processRecognizerStates(RDOptions, rd_states, default_getSelectionClause),

        GOTO_Options = generateOptions(
            grammar, runner,
            productions
        ),

        { code: GOTO_fn_contents, leaves: goto_leaves } = processRecognizerStates(
            GOTO_Options,
            yieldGotoStates(GOTO_Options, completed_productions),
            processGoTOStates
        );

    RDOptions.leaves = rd_leaves;
    GOTO_Options.leaves = goto_leaves;

    return { RDOptions, GOTO_Options, RD_fn_contents, GOTO_fn_contents };
}

