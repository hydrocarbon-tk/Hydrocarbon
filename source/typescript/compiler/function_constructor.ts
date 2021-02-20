import { performance } from "perf_hooks";
import { Grammar } from "../types/grammar.js";
import { Production } from "../types/production";
import { RDProductionFunction } from "../types/rd_production_function";
import { RenderBodyOptions } from "../types/render_body_options";
import { Symbol } from "../types/symbol.js";
import { Leaf, TRANSITION_TYPE } from "../types/transition_node.js";
import { collapseBranchNames, createBranchFunction, getProductionFunctionName } from "../utilities/code_generating.js";
import { const_EMPTY_ARRAY } from "../utilities/const_EMPTY_ARRAY.js";
import { rec_glob_data_name, rec_glob_lex_name, rec_state } from "../utilities/global_names.js";
import { Item, ItemIndex } from "../utilities/item.js";
import { getProductionClosure } from "../utilities/production.js";
import { renderItem } from "../utilities/render_item.js";
import { SC } from "../utilities/skribble.js";
import { Sym_Is_A_Production } from "../utilities/symbol.js";
import { createVirtualProductions } from "../utilities/virtual_productions.js";
import { Helper } from "./helper.js";
import { addLeafStatements, addVirtualProductionLeafStatements } from "./transitions/add_leaf_statements.js";
import { default_resolveBranches } from "./transitions/default_branch_resolution.js";
import { addClauseSuccessCheck, resolveGOTOBranches } from "./transitions/default_state_build.js";
import { processTransitionNodes } from "./transitions/process_transition_nodes.js";
import { yieldGOTOTransitions } from "./transitions/yield_goto_transitions.js";
import { yieldTransitions } from "./transitions/yield_transitions.js";

export function constructHybridFunction(production: Production, grammar: Grammar, runner: Helper): RDProductionFunction {

    const

        rd_fn_name = SC.Constant(getProductionFunctionName(production, grammar) + ":unsigned int") /* skrb_id `${name}:unsigned`  */,

        goto_fn_name = SC.Constant(getProductionFunctionName(production, grammar) + "_goto:unsigned int"),

        start = performance.now(),

        { RDOptions, GOTO_Options, RD_fn_contents, GOTO_fn_contents }
            = compileProductionFunctions(grammar, runner, [production]),

        RD_function = SC.Function(
            rd_fn_name,
            rec_glob_lex_name,
            rec_glob_data_name,
            rec_state).addStatement(RD_fn_contents),

        GOTO_function = SC.Function(
            goto_fn_name,
            rec_glob_lex_name,
            rec_glob_data_name,
            rec_state,
            SC.Variable("prod:int")
        ).addStatement(GOTO_fn_contents);

    addLeafStatements(
        RD_fn_contents,
        GOTO_fn_contents,
        rd_fn_name,
        goto_fn_name,
        RDOptions,
        GOTO_Options);

    collapseBranchNames(RDOptions);
    collapseBranchNames(GOTO_Options);

    if (!GOTO_Options.NO_GOTOS)
        GOTO_function.addStatement(addClauseSuccessCheck(RDOptions));


    const annotation = SC.Expressions(SC.Comment(
        `production name: ${production.name}
            grammar index: ${production.id}
            bodies:\n\t${getStartItemsFromProduction(production).map(i => i.renderUnformattedWithProduction(grammar) + " - " + grammar.item_map.get(i.id).reset_sym.join(",")).join("\n\t\t")}
            compile time: ${((((performance.now() - start) * 1000) | 0) / 1000)}ms`));

    return {
        productions: new Set([...RDOptions.called_productions.values(), ...GOTO_Options.called_productions.values(), ...runner.referenced_production_ids.values()]),
        id: production.id,
        fn: (new SC).addStatement(
            (runner.ANNOTATED) ? annotation : undefined,
            RD_function,
            GOTO_Options.NO_GOTOS ? undefined : GOTO_function
        )
    };
}


export function createVirtualProductionSequence(
    options: RenderBodyOptions,
    items: Item[],
    expected_symbols: Symbol[] = [],
    root: SC,
    out_leaves: Leaf[],
    out_prods: number[] = [],
    /**
     * If true, creates a new, globally consistent function
     * and creates a call to this function in the current
     * context of the output code. 
     * 
     * Otherwise, the virtual production code will be directly 
     * inserted into the current code context.
     * 
     */
    ALLOCATE_FUNCTION: boolean = false,
    transition_type: TRANSITION_TYPE = TRANSITION_TYPE.ASSERT_END,
    CLEAN = false
) {
    const
        { grammar } = options,
        { links: virtual_links, V_PRODS_ALREADY_EXIST } = createVirtualProductions(items, options);

    if (V_PRODS_ALREADY_EXIST)
        throw new Error("Virtual productions already exists, interminable loop detected");

    if (options.VIRTUAL_LEVEL > 8)
        throw new Error("Virtual production level too high");

    const { RDOptions, GOTO_Options, RD_fn_contents, GOTO_fn_contents }
        = compileProductionFunctions(
            options.grammar,
            options.helper,
            Array.from(virtual_links.values()).map(({ p }) => p),
            expected_symbols,
            (CLEAN ? 1 : options.VIRTUAL_LEVEL + 1)
        );

    const rd_virtual_name = createBranchFunction(RD_fn_contents, RD_fn_contents, RDOptions);

    const goto_virtual_name = createBranchFunction(RD_fn_contents, GOTO_fn_contents, GOTO_Options);

    const gen = addVirtualProductionLeafStatements(
        RD_fn_contents,
        GOTO_fn_contents,
        rd_virtual_name,
        goto_virtual_name,
        RDOptions,
        GOTO_Options,
        virtual_links
    );

    for (let { item_id, leaf, prods } of gen) {

        const item = grammar.item_map.get(item_id).item;

        let leaf_node = leaf;

        prods = [item.getProduction(grammar).id];

        if (options.VIRTUAL_LEVEL == 0) {

            item[ItemIndex.offset] = item[ItemIndex.length];

            ({ prods, leaf_node } = renderItem(leaf, item, options));
        }

        out_prods.push(...prods);

        out_leaves.push({
            prods: prods,
            root: leaf,
            leaf: leaf_node,
            hash: "----------------",
            transition_type: TRANSITION_TYPE.ASSERT
        });
    }

    if (options.helper.ANNOTATED) {

        root.addStatement(
            "-------------VPROD-------------------------",
            items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n")
        );

    }
    root.addStatement(SC.Call("pushFN", "data", rd_virtual_name));
    root.addStatement(SC.UnaryPre(SC.Return, SC.Value(0)));


    collapseBranchNames(RDOptions);
    collapseBranchNames(GOTO_Options);
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
    filter_symbols: Symbol[] = const_EMPTY_ARRAY,
    IS_VIRTUAL: number = 0
) {
    //if (IS_VIRTUAL > 32) throw new Error("Virtual production depth is too high");

    const

        initial_items = getProductionItemsThatAreNotRightRecursive(productions, grammar),

        RDOptions = generateOptions(
            grammar, runner,
            productions,
            IS_VIRTUAL
        ),

        rd_nodes = yieldTransitions(
            //Filter out items that are left recursive for the given production
            initial_items,
            RDOptions,
            0,
            filter_symbols
        ),

        { code: RD_fn_contents, prods: completed_productions, leaves: rd_leaves }
            = processTransitionNodes(RDOptions, rd_nodes, default_resolveBranches),

        GOTO_Options = generateOptions(
            grammar, runner,
            productions,
            IS_VIRTUAL,
            "GOTO"
        ),

        { code: GOTO_fn_contents, leaves: goto_leaves } = processTransitionNodes(
            GOTO_Options,
            yieldGOTOTransitions(GOTO_Options, completed_productions),
            resolveGOTOBranches
        );

    RDOptions.leaves = rd_leaves;
    GOTO_Options.leaves = goto_leaves;

    return { RDOptions, GOTO_Options, RD_fn_contents, GOTO_fn_contents };
}
export function generateOptions(
    grammar: Grammar,
    runner: Helper,
    /**
     * The production currently being processed.
     */
    productions: Production[],
    IS_VIRTUAL: number = 0,
    scope: "RD" | "GOTO" = "RD"
): RenderBodyOptions {
    return {
        scope,
        grammar,
        helper: runner,
        productions: productions,
        production_ids: productions.map(p => p.id),
        goto_items: productions.flatMap(
            p => getGotoItemsFromProductionClosure(p, grammar)
        ).setFilter(i => i.id),
        extended_goto_items: [],
        called_productions: new Set(),
        leaf_productions: new Set(),
        active_keys: [],
        leaves: [],
        branches: [],
        VIRTUAL_LEVEL: IS_VIRTUAL,
        NO_GOTOS: false,
        global_production_items: [...grammar.item_map.values()].map(i => i.item).filter(i => !i.atEND && Sym_Is_A_Production(i.sym(grammar)))
    };
}

export function getGotoItemsFromProductionClosure(production: Production, grammar: Grammar): Item[] {
    return getProductionClosure(production.id, grammar).filter(i => !i.atEND && Sym_Is_A_Production(i.sym(grammar)));
}

export function getStartItemsFromProduction(production: Production): Item[] {
    return production.bodies.map(b => new Item(b.id, b.length, 0));
}

export function getProductionItemsThatAreNotRightRecursive(productions: Production[], grammar: Grammar): Item[] {
    return productions.flatMap(p => getStartItemsFromProduction(p).filter(i => {

        const sym = i.sym(grammar);

        if (sym && Sym_Is_A_Production(sym) && sym.val == p.id)
            return false;

        return true;
    })).setFilter(i => i.id);
}