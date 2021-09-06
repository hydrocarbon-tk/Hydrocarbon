/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    getSymbolFromUniqueName,
    getUniqueSymbolName, SymbolsCollide,
    Symbols_Are_The_Same,
    Sym_Is_A_Generic_Identifier,
    Sym_Is_A_Production,
    Sym_Is_A_Production_Token, Sym_Is_Defined, Sym_Is_EOF
} from "../grammar/nodes/symbol.js";
import { GrammarObject, GrammarProduction, HCG3Symbol, ProductionNode, TokenSymbol } from '../types/grammar_nodes';
import { TransitionForestStateA, TransitionStateType } from "../types/transition_tree_nodes";
import { getClosure } from "../utilities/closure.js";
import { Item } from "../utilities/item.js";
import { getProductionClosure } from '../utilities/production.js';


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
            <any>{ roots, depth: -300 }
        );

    root_peek_state.parent = null;

    root_peek_state.transitioned_items = [...grammar.lr_items.values()].flat();

    const initial_state: TransitionForestStateA =
        createTransitionForestState(
            TransitionStateType.START,
            [],
            <any>{ roots, depth: -300 }
        );

    initial_state.parent = null;

    initial_state.transitioned_items = removeLeftRecursiveItems(roots, roots, grammar);

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

        state.depth = -100;

        state.transitioned_items = val.filter(i => !i.atEND).map(i => i.increment());

        if (state.transitioned_items.some(i => i.atEND) || Sym_Is_EOF(sym))
            state.type |= TransitionStateType.END;

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

            initial_state.depth = -1;

            initial_state.roots = <any>[i++];

            initial_state.transitioned_items = removeLeftRecursiveItems(roots, getClosure(roots, grammar), grammar);

            root_states.push(initial_state);
        }

        const graph = disambiguate(grammar, root_states, options);

        //Convert graph into a tree and yield leaves

        previous_state.type |= TransitionStateType.PEEK;

        states.push(...graph.nodes.map((n => (n.state.parent = null, n.state))));

        //Build in new states and create transition for each one.

        for (const leaf of yieldPeekGraphLeaves(graph)) {
            /*
                At this point the leaf indicates a successful resolution of 
                conflicting actions on given sequence of symbols, or the 
                conflicts could not be reasonably resolved. In the former case, 
                the leaf will map to one set of root items to it, whereas 
                in tha latter case the leaf will map to multiple root item groups.  

                In the single root item case the leaf can serve as the post peek
                state and directly lead to the continuing parse of the root items.

                In the multi-root case the leaf is used to fork to new actions
            */


            const groups = (<any>leaf.roots as number[]).map(i => symbols_groups[i]);

            leaf.states.length = 0;

            if (
                groups.length > 1
            ) {
                leaf.type |= TransitionStateType.FORK;

                console.log({ ld: leaf.depth });

                for (const group of groups) {

                    const sym = group[0].sym(grammar);

                    const state = createTransitionForestState(
                        0,
                        [],
                        leaf,
                    );

                    if (Sym_Is_A_Production(sym)) {

                        state.type |= TransitionStateType.PRODUCTION;

                        state.symbols.push(Object.assign({}, sym, { production: null }));

                    } else {
                        state.transitioned_items = group;
                        state.type |= TransitionStateType.TERMINAL;
                    }

                    state.transitioned_items = group;


                    leaf_states.push(state);
                    leaf.states.push(state);
                }

            } else {

                const group = groups[0];

                const sym = group[0].sym(grammar);

                leaf.type ^= TransitionStateType.PEEK;

                if (Sym_Is_A_Production(sym)) {
                    leaf.type |= TransitionStateType.PRODUCTION;
                    leaf.symbols.push(Object.assign({}, sym, { production: null }));
                } else {
                    leaf.depth = -1;
                }

                leaf.transitioned_items = group.map(r => r.increment());

                if (leaf.transitioned_items[0].atEND)
                    leaf.type |= TransitionStateType.END;

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
    const symbols = states.flatMap(s => s.symbols).setFilter(getUniqueSymbolName);

    let resolved_symbols = symbols.slice();

    if (symbols.length > 1)
        resolved_symbols = resolved_symbols.filter(Sym_Is_Defined);

    return {

        type: type,

        depth: states[0].depth,

        parent: null,
        roots: states.flatMap(r => r.roots),
        states: [],
        symbols: resolved_symbols,
        transitioned_items: states.flatMap(i => i.transitioned_items).setFilter(i => i.id)
    };
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

    if (peek_states[0].depth > 10 /* options.max_tree_depth */)
        return graph_node;

    const states: TransitionForestStateA[] = [];

    for (const previous_state of peek_states) {

        //Do one level of Earley 
        const { depth, type: par_type, parent, roots, symbols, transitioned_items } = previous_state;

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

            const { transitioned_items, parent } = prev;

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
        type: type,
        depth: depth >= -1 ? depth + 1 : -2,
        symbols: symbols,
        roots: roots,
        states: [],
        transitioned_items: [],
        parent: previous_state,
    };
}
