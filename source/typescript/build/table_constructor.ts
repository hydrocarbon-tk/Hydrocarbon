/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Sym_Is_A_Production } from "../grammar/nodes/symbol.js";
import { sk } from "../skribble/skribble.js";
import { SKExpression } from "../skribble/types/node.js";
import { HCG3Grammar, HCG3Production, HCG3Symbol } from "../types/grammar_nodes.js";
import { RenderBodyOptions } from "../types/render_body_options";
import { Leaf, TRANSITION_TYPE } from "../types/transition_node.js";
import { const_EMPTY_ARRAY } from "../utilities/const_EMPTY_ARRAY.js";
import { Item, ItemIndex } from "../utilities/item.js";
import { getProductionClosure } from "../utilities/production.js";
import { renderItem } from "../utilities/render_item.js";
import { createVirtualProductions } from "../utilities/virtual_productions.js";
import { Helper } from "./helper.js";
import { table_resolveBranches } from "./table_branch_resolution/table_branch_resolution.js";
import { table_resolveGOTOBranches } from "./table_branch_resolution/table_goto_resolution.js";
import { table_resolveResolvedLeaf } from "./table_branch_resolution/table_resolved_leaf_resolution.js";
import { table_resolveUnresolvedLeaves } from "./table_branch_resolution/table_unresolved_leaves_resolution.js";
import { processTransitionNodes } from "./transitions/process_transition_nodes.js";
import { yieldGOTOTransitions } from "./transitions/yield_goto_transitions.js";
import { yieldTransitions } from "./transitions/yield_transitions.js";

export function constructTableParser(production: HCG3Production, grammar: HCG3Grammar, runner: Helper): {
    tables: Map<string, string>;
    id: number;
} {

    grammar.branches = [];

    const body_len = grammar.bodies.length;
    const production_len = grammar.productions.length;
    const meta_item_cache = new Map(grammar.item_map.entries());
    const cached_item_map = grammar.item_map;
    grammar.item_map = meta_item_cache;

    const
        { RDOptions }
            = compileProductionTables(grammar, runner, [production]);

    //clean up virtual productions

    grammar.bodies.length = body_len;
    grammar.productions.length = production_len;
    grammar.item_map = cached_item_map;

    return {
        tables: RDOptions.table.map,
        id: production.id,
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

    const { RDOptions, GOTO_Options }
        = compileProductionTables(
            grammar,
            helper,
            Array.from(virtual_links.values()).map(({ p }) => p),
            expected_symbols,
            (CLEAN ? 1 : options.VIRTUAL_LEVEL + 1)
        );


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

export function compileProductionTables(
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
            IS_VIRTUAL,
        ),

        rd_nodes = yieldTransitions(
            //Filter out items that are left recursive for the given production
            initial_items,
            RDOptions,
            0,
            filter_symbols
        ),

        { prods: completed_productions, leaves: rd_leaves, hash }
            = processTransitionNodes(
                RDOptions,
                rd_nodes,
                table_resolveBranches,
                table_resolveUnresolvedLeaves,
                table_resolveResolvedLeaf
            ),

        GOTO_Options = createBuildOptions(
            grammar,
            runner,
            productions,
            IS_VIRTUAL,
            "GOTO",
            RDOptions.table
        ),

        { leaves: goto_leaves, hash: goto_hash } = processTransitionNodes(
            GOTO_Options,
            yieldGOTOTransitions(
                GOTO_Options,
                GOTO_Options.goto_items.map(i => i.getProduction(grammar).id),
                table_resolveBranches,
                table_resolveUnresolvedLeaves,
                table_resolveResolvedLeaf
            ),
            table_resolveGOTOBranches,
            table_resolveUnresolvedLeaves,
            table_resolveResolvedLeaf
        );

    const code = `
state [${productions[0].name}]    

    goto state [${hash}] ${GOTO_Options.NO_GOTOS ? `` : `then goto state [${productions[0].name}_goto]`}
    `;

    RDOptions.table.map.set(productions[0].name, code);
    RDOptions.table.entries.push(code);

    

    return { RDOptions, GOTO_Options };
}
export function createBuildOptions(
    grammar: HCG3Grammar,
    runner: Helper,
    /**
     * The production currently being processed.
     */
    productions: HCG3Production[],
    IS_VIRTUAL: number = 0,
    scope: "RD" | "GOTO" = "RD",
    table: RenderBodyOptions["table"] = {
        entries: [],
        map: new Map()
    }
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
        table: table,
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