/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { default_EOF, default_GEN_SYM } from '../grammar/nodes/default_symbols.js';
import {
    getFollowSymbolsFromItems,
    getSymbolFromUniqueName,
    getUniqueSymbolName, SymbolsCollide,
    Symbols_Are_The_Same,
    Sym_Is_A_Generic_Identifier,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token, Sym_Is_A_Token, Sym_Is_Defined, Sym_Is_Defined_Identifier, Sym_Is_EOF, Sym_Is_Exclusive
} from "../grammar/nodes/symbol.js";
import { GrammarObject, GrammarProduction, HCG3Symbol, ProductionNode, TokenSymbol } from '../types/grammar_nodes';
import { TransitionForestStateA, TransitionStateType } from "../types/transition_tree_nodes";
import { getClosure } from "../utilities/closure.js";
import { getFirstTerminalSymbols } from '../utilities/first.js';
import { Item } from "../utilities/item.js";
import { getProductionClosure } from '../utilities/production.js';

const end_item_addendum = 1 << 20;

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
            max_tree_depth: 10,
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
            -1,
            [],
            null,
        );

    root_peek_state.items = [...grammar.lr_items.values()].flat();//.filter(i => i.offset == 0);

    const initial_state: TransitionForestStateA =
        createTransitionForestState(
            TransitionStateType.START,
            [],
            -1,
            [],
            null,
        );

    initial_state.items = removeLeftRecursiveItems(roots, roots, grammar);

    const production_cache = grammar.productions;
    grammar.productions = grammar.productions.slice();

    const body_cache = grammar.bodies;
    grammar.bodies = grammar.bodies.slice();

    recognize(
        grammar,
        initial_state,
        root_peek_state,
        resolved_options,
        true
    );

    grammar.bodies = body_cache;
    grammar.productions = production_cache;

    return initial_state.type & TransitionStateType.MULTI
        ? initial_state
        : initial_state.states[0];
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
    IS_INITIAL = false
) {

    const { roots, depth, items: transitioned_items, states } = previous_state;

    // Group items by symbols and get the disambiguating tree for each 

    let incremented_items = IS_INITIAL

        ? transitioned_items
        : transitioned_items.map(i => i.increment());

    if (attemptSingleGroupShift(
        incremented_items,
        grammar,
        previous_state,
        root_peek_state,
        options,
    )) return;

    /**
     * Resolves SHIFT-REDUCE conflicts
     */
    if (
        incremented_items.group(i => i.getProductionID(grammar)).length == 1
        &&
        incremented_items.some(i => i.atEND)
    ) {

        const active_items = incremented_items.filter(i => !i.atEND);
        const end_items = incremented_items.filter(i => i.atEND);

        if (attemptSingleGroupShift(
            active_items,
            grammar,
            previous_state,
            root_peek_state,
            options,
        )) {

            if (end_items.length > 1) {
                //Multiple end items are resolved through the peek
                debugger;
            }

            if (attemptSingleGroupShift(
                end_items,
                grammar,
                previous_state,
                root_peek_state,
                options,
            )) {

                const first = new Set(
                    previous_state.states[0]
                        .symbols
                        .filter(Sym_Is_A_Token)
                        .filter(s => !Sym_Is_EOF(s))
                        .map(i => i.id)
                );
                const follow = getFollowSymbolsFromItems(end_items, grammar).filter(i => !first.has(i.id));

                const multi_item_state = createTransitionForestState(
                    TransitionStateType.MULTI,
                    [],
                    -103,
                    [],
                    previous_state
                );

                previous_state.states[1].symbols.push(...follow);

                //This is a free action state.
                multi_item_state.items = incremented_items;

                multi_item_state.states = previous_state.states;
                previous_state.states = [multi_item_state];

                return;
            }
        }

        previous_state.states.length = 0;
    }

    /**
     * Resolves all conflicts
     */
    createPeekTreeStates(
        incremented_items,
        grammar,
        previous_state,
        root_peek_state,
        options,
    );

    return true;
}

function attemptSingleGroupShift(
    active_items: Item[],
    grammar: GrammarObject,
    previous_state: TransitionForestStateA,
    root_peek_state: TransitionForestStateA,
    options: TransitionForestOptions,
) {
    const { states } = previous_state;

    const symbols_groups = active_items
        .group(s => getUniqueSymbolName(s.sym(grammar)));

    if (symbols_groups.length == 1
        &&
        (
            !Sym_Is_EOF(active_items[0].sym(grammar))
            ||
            active_items.length == 1
        )) {
        //Create a new state that transitions on the symbol
        const val = symbols_groups[0];

        const sym = val[0].sym(grammar);

        const state = createTransitionForestState(
            Sym_Is_A_Production(sym)
                ? TransitionStateType.PRODUCTION
                : TransitionStateType.TERMINAL,
            [Object.assign({}, sym, { production: null })],
            Sym_Is_A_Production(sym) ? -101 : -201,
            [],
            previous_state
        );

        if (Sym_Is_A_Production(sym)) {
            state.symbols.push(
                ...getFirstTerminalSymbols(sym.val, grammar)
                    .filter(s => !Sym_Is_EOF(s))
            );
        }

        states.push(state);
        if (val.some(i => i.atEND)) {

            state.items = val;

            state.type |= TransitionStateType.END;
        } else {
            state.items = val;
            recognize(grammar, state, root_peek_state, options);
        }

        return true;
    }

    return false;
}

function createPeekTreeStates(
    incremented_items: Item[],
    grammar: GrammarObject,
    previous_state: TransitionForestStateA,
    root_peek_state: TransitionForestStateA,
    options: TransitionForestOptions,
) {

    const { roots, depth, items: transitioned_items, states } = previous_state;

    const active_items = incremented_items; //.filter(i => !i.atEND);

    let end_item = 0;

    const symbols_groups = active_items.group(
        s => {
            if (s.atEND) {
                return "end" + end_item++;
            } else {
                return getUniqueSymbolName(s.sym(grammar));
            }
        }
    );

    const leaf_states = [];

    const root_states: TransitionForestStateA[] = [];

    const contextual_state: TransitionForestStateA = createTransitionForestState(
        TransitionStateType.START, [], -1, [], root_peek_state
    );

    const u = undefined;
    contextual_state.items = getClosure(incremented_items.slice().map(i => i.copy(u, u, u, -2)), grammar, -2);

    let i = 0;

    const origin_symbols = [];

    for (const group of symbols_groups) {

        const

            sym = group[0].sym(grammar), roots = Sym_Is_A_Production(sym)
                ? sym.production.bodies.map(b => new Item(b.id, b.length, 0))
                : group.slice(), initial_state: TransitionForestStateA = createTransitionForestState(
                    TransitionStateType.START,
                    [], -1, [],
                    contextual_state
                );

        origin_symbols.push(sym);

        initial_state.depth = -1;
        initial_state.roots = <any>[(group.some(g => g.atEND) ? end_item_addendum : 0) | i++];

        initial_state.items = removeLeftRecursiveItems(roots, getClosure(roots, grammar, -1), grammar)
            .map(i => i.copy(u, u, u, -1));

        root_states.push(initial_state);
    }

    if (incremented_items.some(i => i.body == 84 && i.offset == 0)) {
        debugger;
    }

    const graph = disambiguate(grammar, root_states, options, true);

    states.push(...graph.nodes.map((n => (n.state.parent = null, n.state))));

    // Convert the previous state into multi branch state if there are 
    // more than one branch state
    if (states.length > 1)
        previous_state.type |= TransitionStateType.MULTI;

    //Build in new states and create transition for each one.
    //Convert graph into a transition tree and yield leaves
    for (const leaf of yieldPeekGraphLeaves(graph)) {
        /*
            At this point the leaf indicates a set of successful resolution of
            conflicting actions on given sequence of symbols, or the
            conflicts could not be reasonably resolved. In the former case,
            the leaf will map to one set of root items to it, whereas
            in tha latter case the leaf will map to multiple root item groups.

            In the single root item case the leaf can serve as the post peek
            state and directly lead to the continuing parse of the root items.

            In the multi-root case the leaf is used to fork to new actions
        */
        //leaf.items.length = 0;

        const candidate_states = leaf.states.length > 0
            ? leaf.states
            : [leaf];

        for (const origin_state of candidate_states) {
            const groups = (<any>origin_state.roots.setFilter() as number[]).map(i => symbols_groups[i & (end_item_addendum - 1)]);

            origin_state.peek_items = origin_state.items;

            if (groups.length > 1) {

                //Heuristic: If all items shift on the same symbol then simply yield a shift.
                if (groups.flat().group(i => getUniqueSymbolName(i.sym(grammar))).length == 1) {
                    leaf.items.length = 0;
                    leaf.items.push(...groups.flat().setFilter(i => i.id));
                    leaf_states.push(leaf);
                    debugger;
                    continue;

                }

                //TODO Rebuild the groups while removing out of scope items.
                origin_state.type |= TransitionStateType.FORK | TransitionStateType.MULTI;

                for (const group of groups) {

                    if (group[0].depth <= -9999) {
                        // This is an out of scope item, and 
                        // should be removed from the finale
                        debugger;
                    }

                    const sym = group[0].sym(grammar);

                    const new_state = createTransitionForestState(
                        TransitionStateType.UNDEFINED,
                        [],
                        0,
                        [],
                        origin_state
                    );

                    /*  if (Sym_Is_A_Production(sym)) {
                         new_state.type |= TransitionStateType.PRODUCTION;
                         new_state.symbols.push(Object.assign({}, sym, { production: null }));
                     } else {
                         new_state.depth = origin_state.depth;
                     } */
                    if (Sym_Is_A_Production(sym)) {
                        new_state.type |= TransitionStateType.PRODUCTION;
                        new_state.symbols.push(Object.assign({}, sym, { production: null }));
                        //   if (new_state.depth <= 0)
                        new_state.depth = -203;
                        // new_state.type ^= TransitionStateType.PEEK;
                        new_state.symbols.push(...getFirstTerminalSymbols(sym.val, grammar));
                        new_state.items = group.map(r => r.increment());
                    } else {
                        new_state.symbols.push(sym);
                        new_state.depth = -103;
                        new_state.items = group.map(r => r);
                        new_state.type |= TransitionStateType.TERMINAL;
                    }

                    //new_state.items = group;
                    leaf_states.push(new_state);

                    origin_state.states.push(new_state);
                }
            } else {

                origin_state.states.length = 0;
                origin_state.type |= TransitionStateType.PEEK;

                const group = groups[0];
                const sym = group[0].sym(grammar);

                if (Sym_Is_A_Production(sym)) {
                    //origin_state.type |= TransitionStateType.PRODUCTION;
                    //origin_state.symbols.push(Object.assign({}, sym, { production: null }));
                    //origin_state.type ^= TransitionStateType.PEEK;
                    //origin_state.symbols.push(...getFirstTerminalSymbols(sym.val, grammar));
                    origin_state.items = group.slice();

                } else {

                    origin_state.depth = leaf.depth;

                    if (origin_state.depth <= -200) {
                        // If the offset remains at zero than this state can be
                        // turned into a consume an the items can be shifted 
                        // by 1 to take into account this consume.
                        origin_state.items = group.map(r => r.atEND ? r : r.increment());
                        origin_state.type ^= TransitionStateType.PEEK;
                        origin_state.depth = -104;
                    } else {
                        origin_state.items = group.slice();
                    }
                }
                if (group.some(g => g.depth <= -9999)) {
                    origin_state.type |= TransitionStateType.EXTENDED;
                }

                if (origin_state.items[0].atEND) {
                    //No need to process this state further
                    origin_state.type ^= TransitionStateType.PEEK;
                    origin_state.type |= TransitionStateType.END;
                    //origin_state.items = origin_state.peek_items;
                } else {
                    leaf_states.push(origin_state);
                }
            }
        }
    }

    for (const state of leaf_states) {
        if (state.items.length > incremented_items.length)
            debugger;
        recognize(grammar, state, root_peek_state, options, true);
    }
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
 * - A: The parse of the root items is not finite (leading to a single 
 *      leaf with one root) within the constraints of `options.time_limit` 
 *      or `options.max_state_depth`. If recognition where to continue, 
 *      the depth of the resulting parse forest could be unbounded.
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
function disambiguate(
    grammar: GrammarObject,
    peek_states: TransitionForestStateA[],
    options: TransitionForestOptions,
    INITIAL_STATE: boolean = false,
    start_time: number = performance.now()
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

    if (
        peek_states[0].depth > options.max_tree_depth
        ||
        (performance.now() - start_time) > options.time_limit
    )
        return graph_node;

    const states: TransitionForestStateA[] = [];

    for (const previous_state of peek_states) {

        //Do one level of Earley 
        const { depth, type: par_type, parent, roots, symbols, items } = previous_state;

        const incremented_items = INITIAL_STATE
            ? items
            : items.map(
                i => {
                    if (i.atEND || Sym_Is_A_Production(i.sym(grammar)))
                        return i;
                    return i.increment();
                }
            );

        const considered_items = incremented_items
            .flatMap(i =>
                i.atEND
                    ? getClosure(resolveEndItem(i, previous_state, grammar), grammar, i.depth)
                    : getClosure([i], grammar, depth + 1)
            )
            .setFilter(i => i.id);

        if (considered_items.length > 0) {

            //Create transition states groups for terminal symbols
            const terminal_token_groups = considered_items.filter(
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
                    createTransitionForestState(TransitionStateType.UNDEFINED,
                        symbols,
                        depth + 1,
                        roots,
                        previous_state);

                const
                    transitioned_items = group.map(i => i).filter(i => !!i);

                state.items = considered_items;

                states.push(state);
            }
        }

        if (
            incremented_items.some(i => i.atEND)
            //considered_items.length == 0
        ) {
            // The only solution at this point is an end of file state.
            let state: TransitionForestStateA =
                createTransitionForestState(TransitionStateType.UNDEFINED,
                    [default_EOF],
                    depth + 1,
                    roots,
                    previous_state
                );

            state.items = incremented_items.filter(i => i.atEND);

            states.push(state);
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
            const existing_states = new Set(group_b.flatMap(i => i.roots));

            if (
                Sym_Is_Defined_Identifier(root_sym)
                &&
                !Sym_Is_Exclusive(root_sym)
                &&
                !Symbols_Are_The_Same(incoming_sym, root_sym)
                &&
                SymbolsCollide(incoming_sym, root_sym, grammar)
            ) {


                group_b.push(
                    ...group_a.filter(
                        a => {
                            return !group_b.includes(a)
                                &&
                                a.roots.some(r => !existing_states.has(r));
                        }

                    )
                        //Remove states to prevent symbol overlapping
                        .map(g => Object.assign({}, g, { states: [] }))
                );
            }
        }
    }

    const dissambiguated_multi_node = <TransitionForestGraph>{
        symbol: null,

        AMBIGUOUS: false,

        state: {
            depth: peek_states[0].depth + 1,
            parent: null,
            roots: [],
            states: [],
            symbols: [],
            type: TransitionStateType.PEEK | TransitionStateType.MULTI,
            items: [],
        },

        nodes: []
    };

    const disambiguated_node = <TransitionForestGraph>{

        symbol: null,

        AMBIGUOUS: false,

        s: null,

        state: null,

        nodes: []
    };

    let REQUIRE_MULTI_DISAMBIGUATE_NODE = false;

    for (const [key, states] of grouped_roots) {

        if (!key) debugger;

        let child_graph_node = null;

        if (states.length > 1) {

            if (INITIAL_STATE)
                start_time = performance.now();

            child_graph_node = disambiguate(grammar, states, options, false, start_time);

            child_graph_node.symbol = key;

            if (child_graph_node.AMBIGUOUS)
                child_graph_node.nodes.length = 0;

            graph_node.nodes.push(child_graph_node);

        } else {

            disambiguated_node.symbol = key;

            dissambiguated_multi_node.symbol = key;

            disambiguated_node.state = states[0];

            states[0].type = TransitionStateType.PEEK | TransitionStateType.TERMINAL;

            dissambiguated_multi_node.state.states.push(states[0]);

            dissambiguated_multi_node.state.items.push(
                ...states[0].items.map(i => i.atEND ? i : i.increment())
            );

            if (states[0].roots.some(i => i <= end_item_addendum))
                REQUIRE_MULTI_DISAMBIGUATE_NODE = true;
        }
    }

    if (
        dissambiguated_multi_node.state.states.length > 1
        ||
        REQUIRE_MULTI_DISAMBIGUATE_NODE
    ) {


        dissambiguated_multi_node.symbol = getUniqueSymbolName(default_GEN_SYM);

        graph_node.nodes.push(dissambiguated_multi_node);

        dissambiguated_multi_node.state.items =
            dissambiguated_multi_node.state.items
                .map(i => i.atEND ? i : i.decrement())
                .setFilter(i => i.id);
        //dissambiguated_multi_node.AMBIGUOUS = dissambiguated_multi_node.state.items.every(i => i.atEND);


    } else if (disambiguated_node.state != null)

        graph_node.nodes.push(disambiguated_node);


    graph_node.AMBIGUOUS = graph_node.nodes.every(
        n => n.AMBIGUOUS
            ||
            dissambiguated_multi_node.state.items.every(i => i.atEND)
    ) || graph_node.nodes.length == 0;

    //if (graph_node.AMBIGUOUS)
    //    graph_node.nodes.length = 0;

    return graph_node;
}

function* yieldPeekGraphLeaves(graph: TransitionForestGraph): Generator<TransitionForestStateA> {
    const parent = graph.state;
    if (graph.nodes.length > 0) {

        for (let node of graph.nodes) {
            node.state.parent = parent;
            parent.states.push(node.state);
            yield* yieldPeekGraphLeaves(node);
        }

        if (graph.nodes.length > 1) {

            const multi_item_state = createTransitionForestState(
                TransitionStateType.MULTI,
                [],
                -103,
                [],
                parent
            );

            //This is a free action state.
            multi_item_state.items = parent.states.flatMap(s => s.items).setFilter(i => i.id);
            multi_item_state.states = parent.states;
            parent.states = [multi_item_state];

        }
    }
    else
        yield graph.state;

}

function mergeStates(type, states: TransitionForestStateA[]): TransitionForestStateA {
    const symbols = states.flatMap(s => s.symbols).setFilter(getUniqueSymbolName);

    let resolved_symbols = symbols.slice();

    if (symbols.length > 1)
        resolved_symbols = resolved_symbols.filter(Sym_Is_Defined);

    return {
        USED: false,

        type: type,

        depth: states[0].depth,

        parent: null,
        roots: states.flatMap(r => r.roots),
        states: [],
        symbols: resolved_symbols,
        items: states.flatMap(i => i.items).setFilter(i => i.id)
    };
}
function resolveEndItem(
    end_item: Item,
    state: TransitionForestStateA,
    grammar: GrammarObject,

): Item[] {

    const active_items = [];

    const end_items = [end_item];

    const seen = new Set();

    for (const end_item of end_items) {

        const production_id = end_item.getProductionID(grammar);

        let matching_items: Item[] = [];

        let prev = state;

        while (prev) {

            const { items, parent, depth } = prev;

            if (depth == end_item.depth) {

                matching_items.push(...items.filter(
                    i => ((i.getProductionAtSymbol(grammar)?.id ?? -1) == production_id)
                ).map(i => i.setDepth(end_item.depth)));

                //if (matching_items.length > 0)
                //    break;
            }

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
    depth: number,
    roots: (Item | number)[],
    previous_state: TransitionForestStateA
): TransitionForestStateA {

    return {
        USED: false,
        type: type,
        depth: depth,
        symbols: symbols,
        roots: roots,
        states: [],
        items: [],
        parent: previous_state,
    };
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

export function getStartItemsFromProduction(production: GrammarProduction): Item[] {
    return production.bodies.map(b => new Item(b.id, b.length, 0));
}

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

            let items = lr_items.get(id);

            if (
                id == production.id
                &&
                lr_items.get(id).some(i => i.increment().atEND)
            ) {

                console.log({ id });


                const seen = new Set([]);

                /**
                 * Mark items with depth (state) 9999 as "in scope" and items
                 * -9999 as "out of scope". Out of scope items are only used
                 * to determine if a production should be reduced to another
                 * production or left alone.
                 */

                items = [
                    ...items.map(i => i.copy(undefined, undefined, undefined, 9999)),
                    ...grammar.lr_items.get(production.id)
                        .flatMap(s => getOuterScopeGotoItems(grammar, seen, s))
                        .map(i => i.copy(undefined, undefined, undefined, -9999))
                ].setFilter(i => i.id);
            }


            output.set(id, items);
            batch.push(...items.map(i => i.getProductionID(grammar)));
        }
    }

    return output;
}

function getOuterScopeGotoItems(grammar: GrammarObject, seen: Set<number>, i: Item, out: Item[] = []) {
    out.push(i);

    const id = i.getProductionAtSymbol(grammar).id;

    if (!seen.has(id) && i.increment().atEND) {

        let id = i.getProductionAtSymbol(grammar).id;

        seen.add(id);

        out.push(...(grammar.lr_items.get(id) ?? []).flatMap(s => getOuterScopeGotoItems(grammar, seen, s)));
    }

    return out;

}

export function getSTARTs(production: GrammarProduction, grammar: GrammarObject) {

    const initial_candidates = getStartItemsFromProduction(production);
    const START_set = initial_candidates.filter(i => !Sym_Is_A_Production(i.sym(grammar)));
    const descend_candidates = initial_candidates.filter(i => Sym_Is_A_Production(i.sym(grammar)));

    for (const descend_candidate of descend_candidates)
        extractSTARTItems(production, descend_candidate, START_set, grammar);
    return START_set.setFilter(i => i.id);
}

function extractSTARTItems(
    root_production: GrammarProduction,
    candidate_item: Item,
    START_set: Item[],
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
        START_set.push(...initial_candidates.filter(i => !Sym_Is_A_Production(i.sym(grammar))));

        const descend_candidates = initial_candidates.filter(
            i => Sym_Is_A_Production(i.sym(grammar))
                && i.getProductionID(grammar) != root_production.id
                && !check_items.has(i.id)
        );

        for (const descend_candidate of descend_candidates) {
            check_items.add(descend_candidate.id);
            extractSTARTItems(
                root_production,
                descend_candidate,
                START_set,
                grammar,
                check_items
            );
        }

    } else {
        START_set.push(candidate_item);
    }
}