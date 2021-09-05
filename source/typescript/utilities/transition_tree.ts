
/* Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
* see /source/typescript/hydrocarbon.ts for full copyright and warranty 
* disclaimer notice.
*/

import { getStartItemsFromProduction } from '../build/table_constructor.js';
import { default_EOF } from '../grammar/nodes/default_symbols.js';
import {
    getSymbolFromUniqueName,
    getUniqueSymbolName, SymbolsCollide,
    Symbols_Are_The_Same,
    Sym_Is_A_Generic_Identifier,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token,
    Sym_Is_Defined, Sym_Is_EOF, Sym_Is_Exclusive
} from "../grammar/nodes/symbol.js";
import { buildItemMaps } from '../grammar/passes/item_map.js';
import { AmbiguousSymbol, GeneralProductionNode, GrammarObject, GrammarProduction, HCG3ProductionBody, HCG3Symbol, ProductionNode, RECURSIVE_STATE, TokenSymbol } from '../types/grammar_nodes';
import { TransitionForestNode, TransitionForestState, TransitionForestStateA, TransitionStateType } from "../types/transition_tree_nodes";
import { getClosure, getFollowClosure } from "./closure.js";
import { generateHybridIdentifier } from "./code_generating.js";
import { Item } from "./item.js";
import { getProductionClosure } from './production.js';


const goto_items = new Map();

export function getGotoItems(production: GrammarProduction, seed_items: Item[], grammar: GrammarObject): Map<number, Item[]> {

    const lr_items = getProductionClosure(production.id, grammar).filter(i =>
        i.offset == 0
        &&
        !i.atEND
        &&
        Sym_Is_A_Production(i.sym(grammar))
    ).groupMap(i => i.getProductionAtSymbol(grammar).id);
    const batch = seed_items.map(i => i.getProductionID(grammar)).setFilter();

    const output: Map<number, Item[]> = new Map();

    for (const id of batch) {

        if (!output.has(id) && lr_items.has(id)) {

            const items = lr_items.get(id);

            output.set(id, items);
            batch.push(...items.map(i => i.getProductionID(grammar)));
        }

    }

    return output;
}

export function getDescentItems(production: GrammarProduction, grammar: GrammarObject) {
    const initial_candidates = getStartItemsFromProduction(production);
    const output_items = initial_candidates.filter(i => !Sym_Is_A_Production(i.sym(grammar)));
    const descend_candidates = initial_candidates.filter(i => Sym_Is_A_Production(i.sym(grammar)));

    for (const descend_candidate of descend_candidates)
        extractAcceptableDescendItems(production, descend_candidate, output_items, grammar);
    return output_items.setFilter(i => i.id);
}

function extractAcceptableDescendItems(
    root_production: GrammarProduction,
    candidate_item: Item,
    output_items: Item[],
    grammar: GrammarObject,
    check_items: Set<string> = new Set
) {
    // Check for recursion with root candidate. If 
    // known is found than the candidate is available
    // for use with the original grammar. 

    const closure = getClosure([candidate_item], grammar);
    if (closure.some(i => (i.getProductionAtSymbol(grammar)?.id ?? -1) == root_production.id)) {

        const production_candidate =
            grammar.productions[candidate_item.getProductionAtSymbol(grammar).id];

        const initial_candidates = getStartItemsFromProduction(production_candidate);
        output_items.push(...initial_candidates.filter(i => !Sym_Is_A_Production(i.sym(grammar))));
        const descend_candidates = initial_candidates.filter(
            i => Sym_Is_A_Production(i.sym(grammar))
                && i.getProductionID(grammar) != root_production.id
                && !check_items.has(i.id)
        );

        for (const descend_candidate of descend_candidates) {
            check_items.add(descend_candidate.id);
            extractAcceptableDescendItems(
                root_production,
                descend_candidate,
                output_items,
                grammar,
                check_items
            );
        }

    } else {
        output_items.push(candidate_item);
    }
}

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
    const root_peek_state: TransitionForestStateA =
        createTransitionForestState(
            TransitionStateType.START,
            [],
            <any>{ roots, depth: -3 }
        );

    root_peek_state.parent = null;

    root_peek_state.transitioned_items = [...grammar.lr_items.values()].flat();

    const initial_state: TransitionForestStateA =
        createTransitionForestState(
            TransitionStateType.START,
            [],
            <any>{ roots, depth: -1 }
        );

    initial_state.parent = null;

    initial_state.transitioned_items = removeLeftRecursiveItems(roots, roots, grammar);
    initial_state.str = initial_state.transitioned_items.map(i => i.renderUnformattedWithProduction(grammar));

    const production_cache = grammar.productions;
    grammar.productions = grammar.productions.slice();

    const body_cache = grammar.bodies;
    grammar.bodies = grammar.bodies.slice();

    recognize(
        grammar,
        initial_state,
        root_peek_state,
        resolved_options,
    );

    grammar.bodies = body_cache;
    grammar.productions = production_cache;

    return initial_state;
}

interface TransitionForestGraph {
    symbol: string,
    AMBIGUOUS: boolean,
    nodes: TransitionForestGraph[];

    state: TransitionForestStateA;
}


function removeLeftRecursiveItems(roots: Item[], root_closure: Item[], grammar: GrammarObject): Item[] {
    const root_prods = new Set(roots.map(i => i.getProductionID(grammar)));

    return root_closure
        .filter(i => (
            i.offset > 0 || (
                (
                    ((i.getProductionAtSymbol(grammar)?.id ?? -1) != i.getProductionID(grammar))
                    &&
                    !root_prods.has((i.getProductionAtSymbol(grammar)?.id ?? -1))
                )
            )));
}

function recognize(
    grammar: GrammarObject,
    previous_state: TransitionForestStateA,
    root_peek_state: TransitionForestStateA,
    options: TransitionForestOptions,
    token_production_map: Map<string, ProductionNode> = new Map
) {

    const { roots, depth, transitioned_items, states } = previous_state;

    // Group items by symbols and get the disambiguating tree for each 

    const symbols_groups = transitioned_items.group(s => getUniqueSymbolName(s.sym(grammar)));

    if (symbols_groups.length == 1) {
        //Create a new state that transitions on the symbol

        const val = symbols_groups[0];

        const sym = val[0].sym(grammar);

        const state = createTransitionForestState(
            Sym_Is_A_Production(sym)
                ? TransitionStateType.PRODUCTION
                : TransitionStateType.TERMINAL,
            [Object.assign({}, sym, { production: null })],
            previous_state,
        );

        state.transitioned_items = val.filter(i => !i.atEND).map(i => i.increment());

        state.str = state.transitioned_items.map(i => i.renderUnformattedWithProduction(grammar));

        states.push(state);

        for (const state of states)
            recognize(grammar, state, root_peek_state, options, token_production_map);

    } else if (symbols_groups.length > 1) {

        const leaf_states = [];

        const root_states: TransitionForestStateA[] = [];

        const contextual_state: TransitionForestStateA =
            createTransitionForestState(
                TransitionStateType.START,
                [],
                root_peek_state
            );

        contextual_state.transitioned_items = getClosure(transitioned_items.slice(), grammar);

        let i = 0;

        const origin_symbols = [];

        for (const group of symbols_groups) {

            const

                sym = group[0].sym(grammar),

                roots = Sym_Is_A_Production(sym)
                    ? sym.production.bodies.map(b => new Item(b.id, b.length, 0))
                    : group.slice(),

                initial_state: TransitionForestStateA =
                    createTransitionForestState(
                        TransitionStateType.START,
                        [],
                        contextual_state
                    );

            origin_symbols.push(sym);

            initial_state.depth = contextual_state.depth;

            initial_state.roots = <any>[i++];

            initial_state.transitioned_items = removeLeftRecursiveItems(roots, getClosure(roots, grammar), grammar);
            initial_state.str = initial_state.transitioned_items.map(i => i.renderUnformattedWithProduction(grammar));

            root_states.push(initial_state);
        }

        const graph = disambiguate(grammar, root_states, options);

        //Convert graph into a tree and yield leaves

        states.push(...graph.nodes.map((n => (n.state.parent = null, n.state))));

        //Build in new states and create transition for each one.

        for (const leaf of yieldPeekGraphLeaves(graph)) {

            const groups = (<any>leaf.roots as number[]).map(i => symbols_groups[i]);

            leaf.states.length = 0;

            if (
                groups.length > 1
            ) {
                leaf.type |= TransitionStateType.FORK;
                for (const group of groups) {

                    const sym = group[0].sym(grammar);
                    const state = createTransitionForestState(
                        0,
                        [],
                        leaf,
                    );

                    if (Sym_Is_A_Production(sym)) {
                        state.type = TransitionStateType.PRODUCTION;
                        state.symbols.push(Object.assign({}, sym, { production: null }));
                    } else {
                        state.type = TransitionStateType.TERMINAL;
                    }

                    state.transitioned_items = group.map(i => i.increment());

                    state.str = state.transitioned_items.map(i => i.renderUnformattedWithProduction(grammar));

                    leaf_states.push(state);
                    leaf.states.push(state);
                }
            } else {

                const group = groups[0];

                const sym = group[0].sym(grammar);


                if (Sym_Is_A_Production(sym)) {
                    leaf.type = TransitionStateType.PRODUCTION | TransitionStateType.PEEK;
                    leaf.symbols.push(Object.assign({}, sym, { production: null }));
                } else {
                    leaf.type = TransitionStateType.PEEK;
                }

                leaf.transitioned_items = group.map(r => r.increment());
                leaf.str = leaf.transitioned_items.map(i => i.renderUnformattedWithProduction(grammar));

                leaf_states.push(leaf);
            }
        }

        for (const state of leaf_states)
            recognize(grammar, state, root_peek_state, options, token_production_map);
    }
}

function* yieldPeekGraphLeaves(graph: TransitionForestGraph): Generator<TransitionForestStateA> {
    const parent = graph.state;
    if (graph.nodes.length > 0)
        for (let node of graph.nodes) {
            node.state.parent = null;
            parent.states.push(node.state);
            yield* yieldPeekGraphLeaves(node);
        }
    else
        yield graph.state;

}


function mergeStates(type, states: TransitionForestStateA[]): TransitionForestStateA {
    return {

        type: type,

        depth: states[0].depth,

        parent: null,
        roots: states.flatMap(r => r.roots),
        states: [],
        symbols: states.flatMap(s => s.symbols).setFilter(getUniqueSymbolName),
        transitioned_items: states.flatMap(i => i.transitioned_items).setFilter(i => i.id)
    };
}

function disambiguate(
    grammar: GrammarObject,
    peek_states: TransitionForestStateA[],
    options: TransitionForestOptions
): TransitionForestGraph {

    const graph_node: TransitionForestGraph = {

        symbol: null,

        AMBIGUOUS: true,

        nodes: [],

        state: mergeStates(
            TransitionStateType.PEEK | TransitionStateType.AMBIGUOUS | TransitionStateType.TERMINAL,
            peek_states
        )
    };

    //TEMPORARY
    graph_node.state.str = peek_states.flatMap(i => i.transitioned_items.flatMap(i => i.renderUnformattedWithProduction(grammar))).setFilter();

    if (peek_states[0].depth > 10 /* options.max_tree_depth */)
        return graph_node;

    const states: TransitionForestStateA[] = [];

    for (const previous_state of peek_states) {

        //Do one level of Earley 
        const { depth, type: par_type, parent, roots, symbols, transitioned_items } = previous_state;

        //const local_closure = getClosure(transitioned_items.slice(), grammar); //closure.slice();//getClosure(transitioned_items, grammar);
        //const root_production_ids = roots.map(i => i.getProductionID(grammar)).setFilter();
        previous_state.transitioned_items = getClosure(
            [...transitioned_items, ...resolveEndItem(0, previous_state, grammar)],
            grammar
        );

        if (previous_state.transitioned_items.length > 0) {

            //Create transition states groups for terminal symbols
            const terminal_token_groups = previous_state.transitioned_items.filter(
                item => !Sym_Is_A_Production(item.sym(grammar))
            ).groupMap(
                item => {
                    const sym = item.sym(grammar);
                    return getUniqueSymbolName(sym);
                }
            );

            for (const [sym, group] of terminal_token_groups) {
                //If sym is eof create states from active_states found in resolved end items

                const

                    symbols: TokenSymbol[] = <any>group
                        .map(g => g.sym(grammar))

                        .setFilter(getUniqueSymbolName);


                let state: TransitionForestStateA =
                    createTransitionForestState(0, symbols, previous_state);

                const
                    transitioned_items = group.map(i => i.increment()).filter(i => !!i);

                state.transitioned_items = transitioned_items;
                state.str = group.map(i => i.renderUnformattedWithProduction(grammar)).join("  |  ");

                states.push(state);
            }
        }
    }

    //Group states by symbol. Join groups that have mutually ambiguous symbols
    const grouped_roots = states.groupMap(s => s.symbols.map(getUniqueSymbolName));


    for (const [key, group_a] of grouped_roots) {

        const incoming_sym = getSymbolFromUniqueName(grammar, key);
        if (
            Sym_Is_A_Production_Token(incoming_sym)
            ||
            Sym_Is_A_Generic_Identifier(incoming_sym)

        ) for (const [key, group_b] of grouped_roots) {

            const root_sym = getSymbolFromUniqueName(grammar, key);

            if (!Symbols_Are_The_Same(incoming_sym, root_sym) && SymbolsCollide(incoming_sym, root_sym, grammar)) {
                group_b.push(...group_a.map(g => Object.assign({}, g, { states: [] })));
            }
        }
    }

    for (const [key, states] of grouped_roots) {

        let child_graph_node = null;

        if (states.length > 1) {

            child_graph_node = disambiguate(grammar, states, options);

            child_graph_node.symbol = key;

            if (child_graph_node.AMBIGUOUS)
                child_graph_node.nodes.length = 0;

        } else {
            child_graph_node = <TransitionForestGraph>{
                symbol: key,

                AMBIGUOUS: false,
                s: states[0].transitioned_items.map(i => i.renderUnformattedWithProduction(grammar)),

                state: states[0],

                nodes: []
            };

            states[0].type = TransitionStateType.PEEK | TransitionStateType.TERMINAL;
        }

        graph_node.nodes.push(child_graph_node);
    }

    graph_node.AMBIGUOUS = graph_node.nodes.every(
        n => n.AMBIGUOUS || Sym_Is_EOF(getSymbolFromUniqueName(grammar, n.symbol))
    );

    return graph_node;
}

function resolveEndItem(
    type: TransitionStateType,
    state: TransitionForestStateA,
    grammar: GrammarObject,

): Item[] {

    const active_items = [];
    const end_items = state.transitioned_items.filter(i => i.atEND);
    const seen = new Set(state.transitioned_items.map(i => i.id));

    for (const end_item of end_items) {

        // if (roots.some(i => i.body == end_item.body))

        //   stack_end_items.push(end_item);

        const production_id = end_item.getProductionID(grammar);

        let matching_items: Item[] = [];

        let prev = state;

        while (prev) {

            const { transitioned_items, parent, production_captures } = prev;

            matching_items.push(...transitioned_items.filter(
                i => ((i.getProductionAtSymbol(grammar)?.id ?? -1) == production_id)
            ));

            prev = parent;
        }

        if (matching_items.length == 0) {

        } else {

            for (const item of matching_items) {
                // Make sure we are only dealing with items that have not
                // yet encountered and increment items that are not in the
                // end position.

                if (seen.has(item.id))
                    continue;

                seen.add(item.id);

                if (item.atEND) {

                    // These items will be incorporated in the existing closure 
                    // for further parsing.

                    end_items.push(item);
                } else {

                    const production_complete_item = item.increment();

                    seen.add(production_complete_item.id);

                    if (production_complete_item.atEND) {

                        end_items.push(production_complete_item);

                    } else {

                        active_items.push(production_complete_item);
                    }
                }
            }
        }
    }
    return active_items.setFilter(i => i.id);
}
function createTransitionForestState(
    type: TransitionStateType,
    symbols: HCG3Symbol[],
    previous_state: TransitionForestStateA
): TransitionForestStateA {

    const { depth, roots } = previous_state;

    return {
        str: [],
        type: type,
        depth: depth + 1,
        symbols: symbols,
        roots: roots,
        production_captures: new Set,
        states: [],
        transitioned_items: [],
        parent: previous_state,
    };
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

