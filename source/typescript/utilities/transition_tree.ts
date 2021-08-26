
/* Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
* see /source/typescript/hydrocarbon.ts for full copyright and warranty 
* disclaimer notice.
*/

import { performance } from "perf_hooks";
import { default_EOP } from "../grammar/nodes/default_symbols.js";
import {
    getFollowSymbolsFromItems,
    getUniqueSymbolName,
    getUnskippableSymbolsFromClosure,
    SymbolsCollide,
    Symbols_Are_The_Same,
    Sym_Is_A_Generic_Identifier,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token,
    Sym_Is_Defined,
    Sym_Is_EOF,
    Sym_Is_Exclusive
} from "../grammar/nodes/symbol.js";
import { HCG3Grammar, TokenSymbol } from "../types/grammar_nodes";
import { ClosureGroup, TransitionTreeNode } from "../types/transition_tree_nodes";
import { getClosure, getFollowClosure } from "./closure.js";
import { generateHybridIdentifier } from "./code_generating.js";
import { Item } from "./item.js";


const goto_items = new Map();

/**
 * Givin a set of root items, return a tree of nodes where each node represents a
 * transition on a symbol and a the collection of root items that still exist at
 * that node. Depth limited to some givin value to prevent infinite recursion.
 *
 * Default depth is 1.
 */
export function getTransitionTree(
    grammar: HCG3Grammar,
    root_items: Item[],
    lr_transition_items: Item[],
    {
        expanded_limit = 0,
        max_tree_depth = 1,
        max_no_progress = 3,
        max_time_limit = 150,
    }: {
        expanded_limit: number,
        max_tree_depth: number,
        max_no_progress: number,
        /**
         * Max amount of time the search process may take,
         * measured in milliseconds.
         *
         * Default is 150 milliseconds
         */
        max_time_limit: number,
    } = {
            expanded_limit: 0,
            max_tree_depth: 4,
            max_no_progress: 8,
            max_time_limit: 150,
        },
    //Internal arguments
    __depth__: number = -1,
    __groups__: ClosureGroup[] = null,
    __len__ = 0,
    __last_progress__ = 0,
    __root_time__ = performance.now(),
    __new_roots__: Item[] = []
): { tree_nodes: TransitionTreeNode[]; clear: boolean; AMBIGUOUS: boolean; max_depth: number; } {

    if (!__groups__) {

        if (!goto_items.has(grammar))
            goto_items.set(grammar, [...grammar.item_map.values()].map(i => i.item).filter(i => !i.atEND && Sym_Is_A_Production(i.sym(grammar))));

        __groups__ = root_items.map((i, index) => {
            const c = getClosure([i], grammar);

            return ({
                final: 0,
                sym: null,
                index,
                closure: c,
                production_shift_items: lr_transition_items.concat(c).filter(i => Sym_Is_A_Production(i.sym(grammar))).setFilter(i => i.id)
            });
        });

        const { AMBIGUOUS, clear, max_depth, tree_nodes } = getTransitionTree(grammar, root_items, lr_transition_items, {
            expanded_limit, max_tree_depth, max_no_progress, max_time_limit,
        }, 0, __groups__);

        return {
            AMBIGUOUS,
            clear,
            max_depth,
            tree_nodes: [
                {
                    item_ids: [],
                    unskippable: [],
                    depth: -1,
                    next: tree_nodes,
                    roots: root_items,
                    sym: null,
                    closure: [],
                    final_count: 0
                }
            ]
        };
    }

    if (__new_roots__.length == 1)
        return { tree_nodes: [], clear: true, AMBIGUOUS: false, max_depth: __depth__ };

    if (

        // If the represented root items can be transitioned on the same symbol, then perform an early exit
        (__new_roots__.length > 1 && __new_roots__.map(i => i.sym(grammar).id).setFilter().length == 1)
        ||
        performance.now() - __root_time__ > max_time_limit
        ||
        __depth__ > max_tree_depth
    )
        return { tree_nodes: [], clear: true, AMBIGUOUS: true, max_depth: __depth__ };


    let
        GLOBAL_PROGRESS = false,
        CLEAR_REQUESTED = false,
        AMBIGUOUS = false,
        max_depth = __depth__;

    //Combine collision groups

    const
        new_groups = __groups__
            .flatMap(cg => getClosureGroups(grammar, cg, lr_transition_items, root_items, expanded_limit))
            .group(cg => {

                if (Sym_Is_Defined(cg.sym)) {
                    return cg.sym.val + "--DEFINED";
                }

                return getUniqueSymbolName(cg.sym);
            }),

        tree_nodes: TransitionTreeNode[] = [];

    const collision_groups = [];

    for (const group of new_groups) {
        const incoming_sym = group[0].sym;
        if (
            Sym_Is_A_Production_Token(incoming_sym)
            ||
            Sym_Is_A_Generic_Identifier(incoming_sym)
        ) for (const extant_group of new_groups) {
            const root_sym = extant_group[0].sym;
            if (!Symbols_Are_The_Same(incoming_sym, root_sym) && SymbolsCollide(incoming_sym, root_sym, grammar)) {
                extant_group.push(...group);
                //    collision_groups.push([...extant_group, ...group]);

            }
        }
    }

    for (const group of [...new_groups, ...collision_groups]) {

        let next = [];
        let sym = group[0].sym;

        const syms = group.map(g => g.sym).setFilter(getUniqueSymbolName),

            root_id = group[0].root_id,
            unskippable = group.flatMap(g => g.unskippable),

            new_roots = group.map(cg => cg.index).setFilter().map(i => root_items[i]),

            progress = new_roots.length != __len__,

            quit = (__depth__ - __last_progress__) >= Math.max(max_tree_depth - __depth__, max_no_progress),

            closure = group.filter(g => g.final == 0).flatMap(g => g.closure).filter(i => i.offset > 0).setFilter(i => i.id),

            starts = group.flatMap(g => g.starts ?? []).setFilter(i => i.id),

            curr_progress = progress ? __depth__ : __last_progress__;

        if (progress)
            GLOBAL_PROGRESS = true;

        if (quit)
            CLEAR_REQUESTED = true;

        if (!quit) {

            const { tree_nodes, clear, AMBIGUOUS: A, max_depth: md }
                = getTransitionTree(
                    grammar,
                    root_items,
                    lr_transition_items,
                    {
                        max_tree_depth,
                        max_no_progress,
                        max_time_limit,
                        expanded_limit
                    },
                    __depth__ + 1,
                    group,
                    new_roots.length,
                    curr_progress,
                    __root_time__,
                    new_roots
                );

            AMBIGUOUS = AMBIGUOUS || A;

            if (clear)
                CLEAR_REQUESTED = true;
            else {
                max_depth = Math.max(md, max_depth + 1);
                next = tree_nodes;
            }
        }

        if (syms.length > 1) {

            if (syms.every(Sym_Is_Defined)) {
                // Extract the exclusive terminal which will suffice
                // to match items that need the exclusive terminal
                // as well as non-exclusive versions.
                sym = syms.filter(Sym_Is_Exclusive)[0] || sym[0];
            } else {
                const considered_syms = syms
                    .sort((a, b) => b.id - a.id)
                    .setFilter(getUniqueSymbolName);

                //generate a hybrid symbol
                const id = generateHybridIdentifier(considered_syms);

                sym = {
                    type: "hybrid",
                    val: "hybrid-" + id + `[${considered_syms.map(getUniqueSymbolName).join("  ")}]`,
                    syms: considered_syms,
                    id: id
                };

                if (!grammar.meta.all_symbols.has(getUniqueSymbolName(sym)))
                    grammar.meta.all_symbols.set(getUniqueSymbolName(sym), sym);
            }
        }

        tree_nodes.push({
            last_progress: __depth__ - __last_progress__,
            progress,
            sym: getUniqueSymbolName(sym),
            item_ids: group.map(i => i.item_id),
            unskippable,
            depth: __depth__,
            closure,
            roots: new_roots,
            starts,
            next: next,
            root_id,
            final_count: group.reduce((r, c) => c.final + r, 0)
        });
    }

    if (CLEAR_REQUESTED && !GLOBAL_PROGRESS)
        return { tree_nodes: [], clear: true, AMBIGUOUS: true, max_depth: max_depth };

    return { tree_nodes, clear: false, AMBIGUOUS, max_depth: max_depth };
}
function getClosureGroups(
    grammar: HCG3Grammar,
    { index, closure, final, starts, production_shift_items, root_id }: ClosureGroup,
    lr_transition_items: Item[],
    root_items: Item[],
    expanded_limit = 0
): ClosureGroup[] {

    if (final > expanded_limit) {
        return [];
    }

    const
        group = [],
        unskippable: TokenSymbol[] = <any>getUnskippableSymbolsFromClosure(closure, grammar);

    for (const item of closure) {

        const sym = item.sym?.(grammar);

        if (item.atEND) {

            let new_final = final;

            let new_closure = getFollowClosure([item], production_shift_items, grammar);

            const production_id = closure[0].getProduction(grammar).id;

            if (new_closure.length == 0) {

                new_final += 1;
                new_closure = getFollowClosure([item], grammar.lr_items, grammar, undefined, undefined, true).filter(i => root_items.some(g => g.body == i.body));
            }

            const non_end_items = new_closure.filter(i => !i.atEND);
            const end_productions: [number, Item][] = new_closure.filter(i => i.atEND).map(i => [i.getProduction(grammar).id, i]);

            if (end_productions.length > 0) {

                const goal_productions = root_items.map(i => i.getProduction(grammar).id);
                const result = end_productions.filter(p => goal_productions.includes(p[0])).map(([, i]) => i);

                if (result.length > 0) {

                    const follow_syms = getFollowClosure(result, grammar.lr_items.filter(i => !production_shift_items.some(j => j.id == i.id)), grammar).filter(i => !i.atEND);

                    for (const item of [...follow_syms.filter(i => !i.getProductionAtSymbol(grammar))]) {

                        const sym = item.sym(grammar);

                        group.push({ sym, index, item_id: item.id, unskippable, stats: [], closure: [], final: new_final, production_shift_items: [], root_id: root_id ?? sym.id, });
                    }

                    group.push({ sym: default_EOP, index, item_id: item.decrement().id, unskippable, stats: [], closure: [], final: new_final, production_shift_items: [], root_id: root_id ?? sym.id, });
                }

            } if (non_end_items.length > 0) {

                const new_group = getClosureGroups(
                    grammar,
                    {
                        sym: null,
                        item_id: item.id,
                        unskippable,
                        index,
                        closure: non_end_items,
                        final: new_final,
                        starts: starts,
                        root_id,
                        production_shift_items: production_shift_items.concat(non_end_items)
                            .filter(i => Sym_Is_A_Production(i.sym(grammar)))

                            .setFilter(i => i.id)
                            .flatMap(i => {
                                if (i.getProductionAtSymbol(grammar).id == production_id) {
                                    const inc = i.increment();
                                    if (!inc.atEND && Sym_Is_A_Production(inc.sym(grammar)))
                                        return [inc];
                                    return [];
                                }
                                return [i];
                            }).setFilter(i => i.id),
                    },
                    lr_transition_items,
                    root_items,
                    expanded_limit
                );

                group.push(...new_group);
            }
            for (const sym of getFollowSymbolsFromItems([item], grammar).filter(i => Sym_Is_EOF(i)))
                group.push({ sym, index, item_id: item.decrement().id, unskippable, closure: closure.slice(0, 1), final: Infinity, root_id: root_id ?? sym.id });

        } else if (!Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym)) {

            const new_closure = incrementWithClosure(grammar, item);

            const psi = production_shift_items.concat(new_closure.filter(i => Sym_Is_A_Production(i.sym(grammar))));

            group.push({
                sym,
                index: index,
                item_id: item.id,
                unskippable,
                closure: new_closure.setFilter(i => i.id),
                final: final,
                starts: starts ? starts : [item],
                root_id: root_id ?? sym.id,
                production_shift_items: psi
            });
        }
    }
    return group;
}
function incrementWithClosure(grammar: HCG3Grammar, item: Item): Item[] {
    return getClosure([item.increment()], grammar);
}

