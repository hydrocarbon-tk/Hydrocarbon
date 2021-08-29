/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Sym_Is_A_Production } from "../grammar/nodes/symbol.js";
import { HCG3Grammar, HCG3Production } from "../types/grammar_nodes.js";
import { RenderBodyOptions } from "../types/render_body_options";
import { Item } from "../utilities/item.js";
import { getProductionClosure } from "../utilities/production.js";
import { table_resolveBranches } from "./table_branch_resolution/table_branch_resolution.js";
import { table_resolveGOTOBranches } from "./table_branch_resolution/table_goto_resolution.js";
import { table_resolveResolvedLeaf } from "./table_branch_resolution/table_resolved_leaf_resolution.js";
import { table_resolveUnresolvedLeaves } from "./table_branch_resolution/table_unresolved_leaves_resolution.js";
import { processTransitionNodes } from "./transitions/process_transition_nodes.js";
import { yieldGOTOTransitions } from "./transitions/yield_goto_transitions.js";
import { yieldTransitions } from "./transitions/yield_transitions.js";

export function constructTableParser(production: HCG3Production, grammar: HCG3Grammar): {
    tables: Map<string, string>;
    id: number;
} {
    const body_len = grammar.bodies.length;
    const production_len = grammar.productions.length;
    const meta_item_cache = new Map(grammar.item_map.entries());
    const cached_item_map = grammar.item_map;

    grammar.item_map = meta_item_cache;

    const
        { RDOptions }
            = compileProductionTables(grammar, [production]);

    //clean up virtual productions

    grammar.bodies.length = body_len;
    grammar.productions.length = production_len;
    grammar.item_map = cached_item_map;

    return {
        tables: RDOptions.table.map,
        id: production.id,
    };
}

export function compileProductionTables(
    grammar: HCG3Grammar,
    productions: HCG3Production[],
    /** 
     * Only include transitions with the
     * with the matching symbols. Only applies
     * to the first transition encountered.
     */
    IS_VIRTUAL: number = 0
) {
    if (IS_VIRTUAL > 32) throw new Error("Virtual production depth is too high");

    grammar.lr_items = [...grammar.item_map.values()].filter(i => !i.item.atEND && Sym_Is_A_Production(i.item.sym(grammar))).map(i => i.item);

    const

        initial_items = getProductionItemsThatAreNotRightRecursive(productions, grammar),

        RDOptions = createBuildOptions(
            grammar,
            productions,
            IS_VIRTUAL,
        ),

        rd_nodes = yieldTransitions(
            //Filter out items that are left recursive for the given production
            initial_items,
            RDOptions,
            0
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
            productions,
            IS_VIRTUAL,
            "GOTO",
            RDOptions.table
        ),

        { leaves: goto_leaves, hash: goto_hash } = processTransitionNodes(
            GOTO_Options,
            yieldGOTOTransitions(
                GOTO_Options,
                [...completed_productions, ...GOTO_Options.goto_items.map(i => i.getProduction(grammar).id)].setFilter(),
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