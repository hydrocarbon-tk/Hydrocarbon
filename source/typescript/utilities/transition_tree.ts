
/* Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
* see /source/typescript/hydrocarbon.ts for full copyright and warranty 
* disclaimer notice.
*/

import { EOFSymbol, TokenSymbol } from '@candlelib/hydrocarbon/build/types/types/grammar_nodes';
import { default_EOF, default_EOP } from '../grammar/nodes/default_symbols.js';
import {
    getUniqueSymbolName, SymbolsCollide,
    Symbols_Are_The_Same,
    Sym_Is_A_Generic_Identifier,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token,
    Sym_Is_Defined, Sym_Is_Exclusive
} from "../grammar/nodes/symbol.js";
import { GrammarObject, AmbiguousSymbol } from "../types/grammar_nodes";
import { TRANSITION_TYPE } from '../types/transition_node.js';
import { TransitionForestState, TransitionForestNode, TransitionForestStateA, TransitionStateType } from "../types/transition_tree_nodes";
import { getClosure, getFollowClosure } from "./closure.js";
import { generateHybridIdentifier } from "./code_generating.js";
import { Item } from "./item.js";
import { getProductionClosure } from './production.js';


const goto_items = new Map();


interface TransitionForestOptions {
    expanded_limit: number;
    max_tree_depth: number;
    max_no_progress: number;
    /**
     * Max amount of time the search process may take,
     * measured in milliseconds.
     *
     * Default is 150 milliseconds
     */
    time_limit: number;
}

/**
 * This system is essentially an Earley recognizer that attempts to 
 * disambiguate the parse decision encountered for a given set 
 * of items `roots` by constructing the parser forest of those 
 * roots up to a depth `options.max_state_depth`. 
 * 
 * Returns a tree of transition states that have leaf states of 
 * either a single root item or set of root items that could not 
 * be disambiguated, or that meets some condition of an acceptable 
 * ambiguous state. In that case the ambiguous nature of the leaf 
 * state is caused by one of the following conditions:
 * 
 * - A: The parse of the root items is not finite within the 
 *    constraints of `options.time_limit` or `options.max_state_depth`. 
 *    If recognition where to continue, the depth of the 
 *    resulting parse forest could be unbounded.
 * 
 * 
 * - B: The root items have a common descendent production that 
 *    allows LR behaviour to occur. This means the root items
 *    have been replaced by the items of this common descendent
 *    with the expectation that the compiled parser should
 *    transition to the initial production state that will be 
 *    common to the set of new root items.
 * 
 * 
 * - C: The items transition on the same production and can be
 *    exited early. The consumer of these root items can 
 *    make a state to transition directly to parse tree of
 *    this production and then re-enter the parse forest 
 *    with new root items that have transitioned on this 
 *    production. 
 * 
 * @param grammar 
 * @param roots 
 * @param lr_transition_items 
 * @param options 
 * @param __depth__ - Internal Iteration Usage
 * @param __states__ - Internal Iteration Usage
 * @param __len__ - Internal Iteration Usage
 * @param __last_progress__ - Internal Iteration Usage
 * @param __root_time__ - Internal Iteration Usage
 * @param __new_roots__ - Internal Iteration Usage
 * @param __seen_hashes__ - Internal Iteration Usage
 * @returns 
 */
export function constructTransitionForest(
    grammar: GrammarObject,
    roots: Item[],
    options: TransitionForestOptions = null,
    //Internal recursive arguments
): TransitionForestStateA {

    const resolved_options: TransitionForestOptions = Object.assign(
        {},
        {
            expanded_limit: 0,
            max_tree_depth: 4,
            max_no_progress: 8,
            time_limit: 150,
        },
        options || {},
    );

    // Initial construction of the root state of the 
    // transition forest. 

    const initial_state = <TransitionForestStateA>{
        type: TransitionStateType.START,
        parent: null,
        states: [],
        roots: roots,
        transitioned_items: getClosure(roots, grammar),
        closure: getClosure(roots, grammar),
        depth: 0,
        symbols: [],
    };

    if (Divert_To_Production_Condition_Met(initial_state)) {

        initial_state.roots = initial_state.transitioned_items.slice();
    } else {

        constructTransitionForest_Iteration(
            grammar,
            initial_state,
            resolved_options
        );
    }

    return initial_state;
}
/**
 * Takes an initial TransitionForest state and iteratively 
 * constructs the transition forest.
 */
function constructTransitionForest_Iteration(
    grammar: GrammarObject,
    previous_state: TransitionForestStateA,
    options: TransitionForestOptions,
    //Internal recursive arguments
    __depth__: number = 0,
    __len__ = 0,
    __last_progress__ = 0,
    __root_time__ = performance.now(),
    __seen_hashes__: Map<string, number> = new Map()
) {

    const {
        roots,
        transitioned_items,
        states,
        depth,
        type: par_type,
        closure,
    } = previous_state;

    let type: TransitionStateType = (
        par_type &
        (
            TransitionStateType.PEEK
            |
            TransitionStateType.EXTENDED
            |
            TransitionStateType.UNDEFINED)
    );

    const end_body_id_set = new Set(roots.map(i => i.body));

    //Resolve any items that are in the end position
    const local_closure = transitioned_items.slice(); //closure.slice();//getClosure(transitioned_items, grammar);
    const seen = new Set(local_closure.map(i => i.id));
    const end_items = local_closure.filter(i => i.atEND);
    const active_items = local_closure.filter(i => !i.atEND);

    const resolved_items: Item[] = [];

    for (const end_item of end_items) {

        const body_id = end_item.body;
        if ((type & TransitionStateType.EXTENDED) > 0) {

        } else {
            // if the end_item is of the same body
            // as one of the root items, then this 
            // state is a potential leaf. 

            if (roots.some(i => i.body == body_id))
                resolved_items.push(end_item);

            type |= TransitionStateType.END;

            // Walk the previous states and collect a 
            // set of items that have production symbols that match
            // the end item's production id. 
            const production_id = end_item.getProductionID(grammar);
            let matching_items: Item[] = [];
            let prev = previous_state;

            while (prev) {

                const { closure, parent } = prev;
                matching_items.push(...closure.filter(i => {
                    const sym = i.sym(grammar);
                    if (Sym_Is_A_Production(sym) && sym.val == production_id)
                        return true;
                    return false;
                }));

                prev = parent;
            }

            if (matching_items.length == 0) {

                resolved_items.push(end_item);

            } else {



                // Make sure we are only dealing with items that have not
                // yet encountered and increment items that are not in the
                // end position.
                matching_items = matching_items.setFilter(i => i.id)
                    .filter(i => !seen.has(i.id))
                    .map(i => (i.atEND ? i : i.increment()))
                    .map(i => (seen.add(i.id), i));

                // These items will be incorporated in the existing closure 
                // for further parsing.
                end_items.push(...matching_items.filter(i => i.atEND));

                active_items.push(...matching_items.filter(
                    i => !i.atEND
                ));

            }

        }
    }



    //Create transition states to resolved items
    if (resolved_items.length > 0) {
        const root_lookup = roots.groupMap(i => i.body);
        const new_roots = resolved_items.flatMap(i => root_lookup.get(i.body));
        const production_ids = new_roots.map(i => i.getProductionID(grammar)).setFilter();

        if (resolved_items.length > 1) {

            if (
                production_ids.length == 1
                ||
                (type & TransitionStateType.EXTENDED) > 0
            ) {

                // TODO: Resolve ambiguities resulting from bodies of the same
                //       production having the same parse path.

                states.push({
                    type: TransitionStateType.ACCEPT
                        | TransitionStateType.AMBIGUOUS,
                    depth,
                    roots: new_roots,
                    transitioned_items: resolved_items,
                    closure: [],
                    parent: previous_state,
                    states: [],
                    symbols: []
                });

            } else {

                // If at this point then there is general ambiguity that cannot be resolved
                // through current scope provided by the root items. 

                // The decision is made to extend our search scope to include all items
                // that can transition on the production id

                type |= TransitionStateType.EXTENDED | TransitionStateType.START;

                const closure = getClosure(
                    production_ids.flatMap(p_id =>
                        grammar.lr_items.get(p_id)
                    ).map(i => i.increment()),
                    grammar
                );

                console.log("-------------------------------------------------------------");

                const state = {

                };
                //states.push(state);
            }
        } else {
            states.push({
                str: resolved_items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n"),
                str_cls: closure.map(i => i.renderUnformattedWithProduction(grammar)).join("\n"),
                symbols: [default_EOF, default_EOP],
                roots: new_roots,
                depth: depth + 1,
                transitioned_items: resolved_items,
                parent: previous_state,
                states: [],
                type: type | TransitionStateType.ACCEPT | TransitionStateType.END
            });
        }
    }


    if (depth > 10 /* options.max_tree_depth */) {
        states.push({
            type: TransitionStateType.ACCEPT
                | TransitionStateType.AMBIGUOUS,
            depth: depth + 1,
            roots,
            transitioned_items: closure,
            closure: closure,
            parent: previous_state,
            states: [],
            symbols: []
        });
        return;
    }

    //Create transition states groups for terminal symbols
    const terminal_token_groups = active_items.filter(
        item => !Sym_Is_A_Production(item.sym(grammar))
    ).groupMap(
        item => {
            const sym = item.sym(grammar);
            return getUniqueSymbolName(sym);
        }
    );

    // This is used for handling ambiguous tokens.
    const ambiguated_groups = [...terminal_token_groups]
        .map(i => {

        });

    type |= TransitionStateType.TERMINAL;

    for (const [sym, group] of terminal_token_groups) {
        const
            symbols: TokenSymbol[] = <any>group
                .map(g => g.sym(grammar))
                .setFilter(getUniqueSymbolName);

        if (group.some(i => i.offset == 0)) {

            type |= TransitionStateType.PRODUCTION;

            const ALL_PRODUCTION_TRANSITION =
                group.every(i => i.offset == 0);

            const ALL_PRODUCTIONS_ARE_THE_SAME =
                group.setFilter(i => i.getProductionID(grammar)).length == 1;

            if (depth > 0) {

                if (
                    ALL_PRODUCTION_TRANSITION
                    &&
                    ALL_PRODUCTIONS_ARE_THE_SAME
                    &&
                    (type & (TransitionStateType.EXTENDED)) == 0
                ) {
                    // Can transition on a single production.
                    // Care must be made to ensure that we 
                    // reenter the transition tree with all items 
                    // incremented by one

                    const production_id = group[0].getProductionID(grammar);
                    const transitioned_items = closure
                        .filter(i => i.getProductionAtSymbol(grammar)?.id == production_id)
                        .map(i => i.increment());
                    const new_transitioned_items = group.map(i => i.toEND()).slice(1);

                    const state = {
                        str: group[0].getProduction(grammar).name,
                        str_clrs: transitioned_items
                            .map(i => i.decrement().renderUnformattedWithProduction(grammar)).join("\n"),
                        type: type,
                        symbols: symbols,
                        roots: roots,
                        transitioned_items: transitioned_items,
                        closure: getClosure(transitioned_items, grammar),
                        depth: depth + 1,
                        parent: previous_state.parent, //Popping the stack
                        states: [],
                    };

                    constructTransitionForest_Iteration(grammar, state, options);

                    //parent_state.states.push(state);
                    states.push(state);

                    continue;
                } //else if (!ALL_PRODUCTIONS_ARE_THE_SAME) {
                //  type |= TransitionStateType.PEEK;
                //}
            }
        }

        const
            transitioned_items = group.map(i => i.increment()),

            state = {
                str: transitioned_items.map(i => i.renderUnformattedWithProduction(grammar)).join("\n"),
                str_clrs: closure.map(i => i.renderUnformattedWithProduction(grammar)).join("\n"),
                type: type,
                symbols: symbols,
                roots: roots,
                transitioned_items: transitioned_items,
                closure: getClosure(transitioned_items, grammar),
                depth: depth + 1,
                parent: previous_state,
                states: [],
            };

        constructTransitionForest_Iteration(grammar, state, options);

        states.push(state);
    }

    return null;
}

function Divert_To_Production_Condition_Met(state: TransitionForestStateA): boolean {

    // here we can check for early exit condition C.
    // This condition is only applies if the following
    // sub conditions are met:
    //
    //      A: The root items must all be at offset 0
    //      B: TODO

    // If the roots have a common left most production closure, where
    //    A. All items in closure are of the same production 
    //    B. The root items are at offset 0
    // Then allow early exit
    return false;
}

/**
 * Givin a set of root items, return a tree of nodes where each node represents a
 * transition on a symbol and a the collection of root items that still exist at
 * that node. Depth limited to some givin value to prevent infinite recursion.
 *
 * Default depth is 1.
 */
export function getTransitionTree(
    grammar: GrammarObject,
    root_items: Item[],
    lr_transition_items: Item[],
    {
        expanded_limit = 0,
        max_tree_depth = 1,
        max_no_progress = 3,
        time_limit: max_time_limit = 150,
    }: TransitionForestOptions = {
            expanded_limit: 0,
            max_tree_depth: 4,
            max_no_progress: 8,
            time_limit: 150,
        },
    //Internal arguments
    __depth__: number = -1,
    __groups__: TransitionForestState[] = null,
    __len__ = 0,
    __last_progress__ = 0,
    __root_time__ = performance.now(),
    __new_roots__: Item[] = [],
    __seen_hashes__: Map<string, number> = new Map()
): { tree_nodes: TransitionForestNode[]; clear: boolean; AMBIGUOUS: boolean; max_depth: number; } {

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
                time_limit: max_time_limit,
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
                    final_count: 0,
                    tree_depth: 0
                }
            ]
        };
    }

    if (__new_roots__.length == 1)
        return { tree_nodes: [], clear: true, AMBIGUOUS: false, max_depth: __depth__ };


    if (

        // If the represented root items can be transitioned on the same symbol, then perform an early exit
        //(__new_roots__.length > 1 && __new_roots__.map(i => i.sym(grammar).id).setFilter().length == 1)
        //||
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

        tree_nodes: TransitionForestNode[] = [];

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

            closure: Item[] = group.flatMap(g => g.closure).filter(i => i.offset > 0).setFilter(i => i.id),

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
            // of one of root items at an offset > 0

            new_roots.length = 0;
            new_roots.push(...root_items.filter(a => a.body == bodies[0]));

        } else if (
            Common_Descendent_Production(new_roots, closure, grammar)
            &&
            __depth__ == 0
        ) {
            // If the roots have a common left most production closure, where
            //    A. All items in closure are of the same production 
            //    B. The root items are at offset 0
            // Then allow early exit
            new_roots.length = 0;
            new_roots.push(...closure.map(i => i.decrement()));
        } else if (!quit) {

            const { tree_nodes, clear, AMBIGUOUS: A, max_depth: md }
                = getTransitionTree(
                    grammar,
                    root_items,
                    lr_transition_items,
                    {
                        max_tree_depth,
                        max_no_progress,
                        time_limit: max_time_limit,
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

                sym = <AmbiguousSymbol>{
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
function Common_Descendent_Production(new_roots: Item[], closure: Item[], grammar: GrammarObject) {

    const set_items = closure.map(i => i.decrement());

    const closure_productions = set_items.map(i => i.getProduction(grammar).id).setFilter();
    const sym_ids = set_items.filter(i => Sym_Is_A_Production(i.sym(grammar))).map(i => i.getProductionAtSymbol(grammar).id).setFilter();
    const root_productions = new_roots.map(i => i.getProduction(grammar).id).setFilter();
    return new_roots.length > 1
        &&
        new_roots.every(i => i.offset == 0)
        &&
        set_items.every(i => i.offset == 0)
        &&
        closure_productions.length == 1
        &&
        //Make sure there is no left recursion present
        !((closure_productions.concat(sym_ids)).some(i => root_productions.includes(i)));
}

function getClosureGroups(
    grammar: GrammarObject,
    incoming_group: TransitionForestState,
    lr_transition_items: Item[],
    root_items: Item[],
    expanded_limit = 0,
    new_previous_group = incoming_group,
    production_trap = new Set
): TransitionForestState[] {

    const { index, closure, final, starts, production_shift_items, tree_depth, previous_group } = incoming_group;

    if (final > expanded_limit) {
        return [];
    }

    const
        group: TransitionForestState[] = [];

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

            if (NO_TRANSITIONS
                && !prev
                && previous_group
                && previous_group.final < Infinity
                && previous_group.final > -Infinity
            ) {

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
function incrementWithClosure(grammar: GrammarObject, item: Item): Item[] {
    return getClosure([item.increment()], grammar);
}

