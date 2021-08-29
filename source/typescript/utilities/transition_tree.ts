
/* Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
* see /source/typescript/hydrocarbon.ts for full copyright and warranty 
* disclaimer notice.
*/

import { performance } from "perf_hooks";
import { default_EOF, default_EOP } from '../grammar/nodes/default_symbols.js';
import {
    getFollowSymbolsFromItems,
    getUniqueSymbolName, SymbolsCollide,
    Symbols_Are_The_Same,
    Sym_Is_A_Generic_Identifier,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token,
    Sym_Is_Defined,
    Sym_Is_EOF,
    Sym_Is_Exclusive
} from "../grammar/nodes/symbol.js";
import { HCG3Grammar } from "../types/grammar_nodes";
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
    __new_roots__: Item[] = [],
    __seen_hashes__: Map<string, number> = new Map()
): { tree_nodes: TransitionTreeNode[]; clear: boolean; AMBIGUOUS: boolean; max_depth: number; } {

    if (!__groups__) {

        if (!goto_items.has(grammar))
            goto_items.set(grammar, [...grammar.item_map.values()].map(i => i.item).filter(i => !i.atEND && Sym_Is_A_Production(i.sym(grammar))));

        __groups__ = root_items.map((i, index) => {
            const c = getClosure([i], grammar);

            return ({
                final: -Infinity,
                sym: null,
                index,
                closure: c,
                production_shift_items: lr_transition_items.concat(c).filter(i => Sym_Is_A_Production(i.sym(grammar))).setFilter(i => i.id),
                tree_depth: 0,
            });
        });

        const { AMBIGUOUS, clear, max_depth, tree_nodes } = getTransitionTree(
            grammar,
            root_items,
            lr_transition_items,
            {
                expanded_limit,
                max_tree_depth,
                max_no_progress,
                max_time_limit,
            },
            0,
            __groups__,
            __len__,
            __last_progress__,
            __root_time__,
            __new_roots__,
            __seen_hashes__
        );

        return {
            AMBIGUOUS,
            clear,
            max_depth,
            tree_nodes: [
                {
                    item_ids: [],
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
                //collision_groups.push([...extant_group, ...group]);
            }
        }
    }
    const groups = [...new_groups, ...collision_groups];


    const new_hash = new Map(__seen_hashes__.entries());



    const hash = groups.map(g => g.map(g => g.closure[0].id).setFilter().sort().join("---")).setFilter().sort().join("----");


    if (!new_hash.has(hash))
        new_hash.set(hash, 0);
    else if (__depth__ > max_no_progress) {
        return { tree_nodes: [], clear: true, AMBIGUOUS: true, max_depth: __depth__ };
    }

    for (const group of groups) {

        let next = [];
        let sym = group[0].sym;

        const syms = group.map(g => g.sym).setFilter(getUniqueSymbolName),

            hash = group.map(g => g.closure[0].id).setFilter().sort().join("---"),

            tree_depth = Math.max(...group.map(i => i.tree_depth)),

            new_roots = group.map(cg => cg.index).setFilter().map(i => root_items[i]),

            closure = group.flatMap(g => g.closure).filter(i => i.offset > 0).setFilter(i => i.id),

            starts = group.flatMap(g => g.starts ?? []).setFilter(i => i.id);


        if (!new_hash.has(hash))
            new_hash.set(hash, 0);
        else if (__depth__ > max_no_progress) {

            __last_progress__ = -Infinity;
        }

        const

            progress = true || new_roots.length != __len__,

            quit = (__depth__ - __last_progress__) >= Math.max(max_tree_depth - __depth__, max_no_progress),

            curr_progress = progress ? __depth__ : __last_progress__;

        if (progress)
            GLOBAL_PROGRESS = true;

        const bodies = group.map(g => g.closure[0]).map(a => a ? a.body : -1).setFilter();
        if (
            bodies.length == 1
            &&
            new_roots.some(s => bodies[0] == s.body)
        ) {
            // All current active items are the same representation 
            // of one of  root items at an offset > 0

            new_roots.length = 0;
            new_roots.push(...root_items.filter(a => a.body == bodies[0]));

        } else if (!quit) {

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
                    new_roots,
                    new_hash
                );

            AMBIGUOUS = AMBIGUOUS || A;

            if (clear)
                CLEAR_REQUESTED = true;
            else {
                max_depth = Math.max(md, max_depth + 1);
                next = tree_nodes;
            }
        } else

            CLEAR_REQUESTED = true;

        if (syms.length > 1) {
            //*
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
            //*/
        }

        tree_nodes.push({
            last_progress: __depth__ - __last_progress__,
            progress,
            sym: getUniqueSymbolName(sym),
            item_ids: group.map(i => i.item_id),
            depth: __depth__,
            closure,
            roots: new_roots,
            starts,
            next: next,
            tree_depth,
            final_count: group.reduce((r, c) => c.final + r, 0)
        });
    }

    if (CLEAR_REQUESTED && !GLOBAL_PROGRESS)
        return { tree_nodes: [], clear: true, AMBIGUOUS: true, max_depth: max_depth };

    return { tree_nodes, clear: false, AMBIGUOUS, max_depth: max_depth };
}
function getClosureGroups(
    grammar: HCG3Grammar,
    incoming_group: ClosureGroup,
    lr_transition_items: Item[],
    root_items: Item[],
    expanded_limit = 0,
    new_previous_group = incoming_group,
    production_trap = new Set
): ClosureGroup[] {

    const { index, closure, final, starts, production_shift_items, tree_depth, previous_group } = incoming_group;

    if (final > expanded_limit) {
        return [];
    }

    const
        group: ClosureGroup[] = [];

    for (const item of closure) {

        const sym = item.sym?.(grammar);
        if (item.atEND) {

            //Find items that shift on the production within previous groups

            const prod_id = item.getProduction(grammar).id;

            let NO_TRANSITIONS = true;

            let prev = previous_group;

            while (prev && NO_TRANSITIONS) {

                for (const item of prev.production_shift_items) {


                    const sym = item.sym(grammar);

                    if (Sym_Is_A_Production(sym) && sym.val == prod_id && !production_trap.has(item.id)) {

                        production_trap.add(item.id);

                        NO_TRANSITIONS = false;

                        //increment_symbol and do closure group with the symbol.

                        let new_item = item.increment();

                        let new_closure = getClosure([new_item], grammar);

                        const new_group = getClosureGroups(
                            grammar,
                            {
                                sym: null,
                                item_id: item.id,
                                index,
                                closure: new_closure,
                                final: prev.final,
                                starts: starts,
                                tree_depth: prev.tree_depth,
                                production_shift_items: production_shift_items.concat(prev.closure)

                                    .filter(i => Sym_Is_A_Production(i.sym(grammar)))

                                    .setFilter(i => i.id),
                                previous_group
                            },
                            lr_transition_items,
                            root_items,
                            expanded_limit,
                            prev,
                            production_trap
                        );

                        group.push(...new_group);
                    }
                }

                prev = prev.previous_group;
            }

            if (NO_TRANSITIONS && !prev) {

                // Stack is exhausted and any other transitions exist outside
                // the scope of the root items. We may proceed to consider transitions
                // from the global scope (i.e. any transitions from the grammar that match 
                // the on the production id), however, as this can lead to infinity recursion
                // final is now converted to a positive integer value and will be incremented
                // here on until its value is equal to expand_limit. The 
                // graph evaluation is stopped once this occurs

                const new_closure = getFollowClosure([item], grammar.lr_items, grammar, undefined, undefined, true).filter(i => root_items.some(g => g.body == i.body));

                const new_group = getClosureGroups(
                    grammar,
                    {
                        sym: null,
                        item_id: item.id,
                        index,
                        closure: new_closure,
                        final: final >= 0 ? final + 1 : 0,
                        starts: starts,
                        tree_depth: 1,
                        production_shift_items: grammar.lr_items,
                        previous_group: {
                            closure: new_closure,
                            previous_group: null,
                            final: Infinity,
                            index,
                            production_shift_items: grammar.lr_items,
                            sym: null,
                            item_id: item.id,
                            starts: starts,
                            tree_depth: 0
                        }
                    },
                    lr_transition_items,
                    root_items,
                    expanded_limit,
                    undefined,
                    production_trap

                );

                group.push(...new_group);
            }

            if (root_items.some(r => r.body == item.body))
                group.push({
                    sym: default_EOF,
                    index,
                    item_id: item.decrement().id,
                    closure: [item],
                    final: Infinity,
                    tree_depth: tree_depth - 1,
                    previous_group: null,
                    production_shift_items: []
                });

        } else if (!Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym)) {

            const new_closure = incrementWithClosure(grammar, item);

            const psi = production_shift_items.concat(new_closure.filter(i => Sym_Is_A_Production(i.sym(grammar))));

            group.push({
                sym,
                index: index,
                item_id: item.id,
                closure: new_closure.setFilter(i => i.id),
                final: final,
                starts: starts ? starts : [item],
                tree_depth: tree_depth + 1,
                production_shift_items: psi,
                previous_group: new_previous_group
            });
        }
    }

    return group;
}
function incrementWithClosure(grammar: HCG3Grammar, item: Item): Item[] {
    return getClosure([item.increment()], grammar);
}

