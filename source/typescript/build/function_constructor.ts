/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Sym_Is_A_Production, Sym_Is_Empty } from "../grammar/nodes/symbol.js";
import { sk } from "../skribble/skribble.js";
import { SKExpression, SKFunction, SKPrimitiveDeclaration } from "../skribble/types/node.js";
import { HCG3Grammar, HCG3Production, HCG3Symbol } from "../types/grammar_nodes.js";
import { RDProductionFunction } from "../types/rd_production_function";
import { RenderBodyOptions } from "../types/render_body_options";
import { Leaf, TRANSITION_TYPE } from "../types/transition_node.js";
import { collapseBranchNames, createBranchFunction, createScanFunctionCall, getProductionFunctionName } from "../utilities/code_generating.js";
import { const_EMPTY_ARRAY } from "../utilities/const_EMPTY_ARRAY.js";
import { Item, ItemIndex } from "../utilities/item.js";
import { getProductionClosure } from "../utilities/production.js";
import { renderItem } from "../utilities/render_item.js";
import { createVirtualProductions } from "../utilities/virtual_productions.js";
import { default_resolveBranches } from "./branch_resolution/default_branch_resolution.js";
import { addClauseSuccessCheck, resolveGOTOBranches } from "./branch_resolution/goto_resolution.js";
import { Helper } from "./helper.js";
import { addLeafStatements, addVirtualProductionLeafStatements } from "./transitions/add_leaf_statements.js";
import { processTransitionNodes } from "./transitions/process_transition_nodes.js";
import { yieldGOTOTransitions } from "./transitions/yield_goto_transitions.js";
import { yieldTransitions } from "./transitions/yield_transitions.js";

export function constructHybridFunction(production: HCG3Production, grammar: HCG3Grammar, runner: Helper): RDProductionFunction {

    grammar.branches = [];

    const body_len = grammar.bodies.length;
    const production_len = grammar.productions.length;
    const meta_item_cache = new Map(grammar.item_map.entries());
    const cached_item_map = grammar.item_map;
    grammar.item_map = meta_item_cache;

    const

        rd_fn_name = <SKPrimitiveDeclaration>sk`[priv] ${getProductionFunctionName(production)}:u32`,

        goto_fn_name = <SKPrimitiveDeclaration>sk`[priv] ${getProductionFunctionName(production)}_goto:u32`,

        RD_function = <SKFunction>sk`

        [pub] fn ${getProductionFunctionName(production)}:i32(state:__ParserState$ref, db:__ParserStateBuffer$ref, prod:i32){ ${runner.ANNOTATED ? "" : ""} }`,

        GOTO_function = <SKFunction>sk`
        [pub] fn ${getProductionFunctionName(production)}_goto:i32(state:__ParserState$ref, db:__ParserStateBuffer$ref, [mut] prod:i32){ ${runner.ANNOTATED ? "" : ""} }`,

        { RDOptions, GOTO_Options, RD_fn_contents, GOTO_fn_contents }
            = compileProductionFunctions(grammar, runner, [production]);

    RD_function.expressions.push(...RD_fn_contents);

    if (RD_fn_contents.slice(-1)[0].type !== "return") {
        /**
         * If the production contains an empty body, we'll 
         * want to complete the production even if all other
         * bodies have failed to parse.
         */
        const empty_body = production.bodies.filter(b => Sym_Is_Empty(b.sym[0]))[0];
        if (empty_body) {
            const item = new Item(empty_body.id, empty_body.length, 0);

            //TODO: Reset output pointer to production start

            renderItem(RD_function.expressions, item, RDOptions, true);

            RD_function.expressions.push(<SKExpression>sk`return:${production.id}`);
        } else {
            RD_function.expressions.push(<SKExpression>sk`return:-1`);
        }
    }

    GOTO_function.expressions.push(...GOTO_fn_contents);

    addLeafStatements(
        RD_fn_contents,
        GOTO_fn_contents,
        rd_fn_name,
        goto_fn_name.name,
        RDOptions,
        GOTO_Options);

    collapseBranchNames(GOTO_Options);

    if (!GOTO_Options.NO_GOTOS)
        GOTO_function.expressions.push(addClauseSuccessCheck(RDOptions));

    //clean up virtual productions
    grammar.bodies.length = body_len;
    grammar.productions.length = production_len;
    grammar.item_map = cached_item_map;

    return {
        productions: new Set([...RDOptions.called_productions.values(), ...GOTO_Options.called_productions.values(), ...runner.referenced_production_ids.values()]),
        id: production.id,
        fn: [
            RD_function,
            GOTO_Options.NO_GOTOS ? undefined : GOTO_function,
            null//ReduceFunction
        ],
        RENDER: false
    };
}


export function createVirtualProductionSequence(
    options: RenderBodyOptions,
    items: Item[],
    expected_symbols: HCG3Symbol[] = [],
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
): SKExpression[] {
    const
        out: SKExpression[] = [],
        { grammar, helper } = options,
        { links: virtual_links, V_PRODS_ALREADY_EXIST } = createVirtualProductions(items, options);

    if (V_PRODS_ALREADY_EXIST)
        throw new Error("Virtual productions already exists, interminable loop detected");

    if (options.VIRTUAL_LEVEL > 8)
        throw new Error("Virtual production level too high");

    const { RDOptions, GOTO_Options, RD_fn_contents, GOTO_fn_contents }
        = compileProductionFunctions(
            grammar,
            helper,
            Array.from(virtual_links.values()).map(({ p }) => p),
            expected_symbols,
            (CLEAN ? 1 : options.VIRTUAL_LEVEL + 1)
        ),

        rd_virtual_name = createBranchFunction(RD_fn_contents, RDOptions),

        goto_virtual_name = createBranchFunction(GOTO_fn_contents, GOTO_Options),

        gen = addVirtualProductionLeafStatements(
            RD_fn_contents,
            GOTO_fn_contents,
            rd_virtual_name,
            goto_virtual_name,
            RDOptions,
            GOTO_Options,
            virtual_links
        );

    if (!GOTO_Options.NO_GOTOS)
        GOTO_fn_contents.push(addClauseSuccessCheck(RDOptions));

    for (let { item_id, leaf, prods } of gen) {

        const item = grammar.item_map.get(item_id).item;

        let leaf_node = leaf;

        prods = [item.getProduction(grammar).id];

        let original_prods = prods;

        if (options.VIRTUAL_LEVEL == 0) {

            item[ItemIndex.offset] = item[ItemIndex.length];

            ({ prods, leaf_node, original_prods } = renderItem(leaf, item, options));
        }

        out_prods.push(...prods);

        out_leaves.push({
            prods: prods,
            root: leaf,
            leaf: leaf_node,
            original_prods,
            hash: "----------------",
            transition_type: TRANSITION_TYPE.ASSERT
        });
    }

    if (options.helper.ANNOTATED) {
        out.push(
            <SKExpression>sk`"-------------VPROD-------------------------"`,
            //<SKExpression>sk`"${items.map(i => i.renderUnformattedWithProduction(grammar)).join(" ")}"`,
        );
    }

    out.push(
        <SKExpression>sk`state.push_fn(&> ${rd_virtual_name}, 0)`,
        <SKExpression>sk`return:0`,
    );

    //collapseBranchNames(RDOptions);
    //collapseBranchNames(GOTO_Options);

    return out;
}

export function compileProductionFunctions(
    grammar: HCG3Grammar,
    runner: Helper,
    productions: HCG3Production[],
    /** 
     * Only include transitions with the
     * with the matching symbols. Only applies
     * to the first transition encountered.
     */
    filter_symbols: Symbol[] = const_EMPTY_ARRAY,
    IS_VIRTUAL: number = 0
) {
    if (IS_VIRTUAL > 32) throw new Error("Virtual production depth is too high");

    grammar.lr_items = [...grammar.item_map.values()].filter(i => !i.item.atEND && Sym_Is_A_Production(i.item.sym(grammar))).map(i => i.item);

    const

        initial_items = getProductionItemsThatAreNotRightRecursive(productions, grammar),

        RDOptions = createBuildOptions(
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

        GOTO_Options = createBuildOptions(
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



    if (rd_nodes.length == 1 && (rd_nodes[0].transition_type == TRANSITION_TYPE.ASSERT_PRODUCTION_CALL || rd_nodes[0].transition_type == TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS)) {

    } else
        RD_fn_contents.unshift(createScanFunctionCall(initial_items, RDOptions, "state.lexer", false));

    RDOptions.leaves = rd_leaves;
    GOTO_Options.leaves = goto_leaves;

    return { RDOptions, GOTO_Options, RD_fn_contents, GOTO_fn_contents };
}
export function createBuildOptions(
    grammar: HCG3Grammar,
    runner: Helper,
    /**
     * The production currently being processed.
     */
    productions: HCG3Production[],
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
        extended_goto_items: new Set(),
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

export function getGotoItemsFromProductionClosure(production: HCG3Production, grammar: HCG3Grammar): Item[] {
    return getProductionClosure(production.id, grammar).filter(i => !i.atEND && Sym_Is_A_Production(i.sym(grammar)));
}

export function getStartItemsFromProduction(production: HCG3Production): Item[] {
    return production.bodies.map(b => new Item(b.id, b.length, 0));
}

export function getProductionItemsThatAreNotRightRecursive(productions: HCG3Production[], grammar: HCG3Grammar): Item[] {
    return productions.flatMap(p => getStartItemsFromProduction(p).filter(i => {

        const sym = i.sym(grammar);

        if (sym && Sym_Is_A_Production(sym) && sym.val == p.id)
            return false;

        return true;
    })).setFilter(i => i.id);
}