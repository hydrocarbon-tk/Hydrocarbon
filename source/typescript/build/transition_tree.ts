/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    getFollowSymbolsFromItems,
    getUniqueSymbolName, Sym_Is_A_Production,
    Sym_Is_A_Token, Sym_Is_EOF
} from "../grammar/nodes/symbol.js";
import { GrammarObject, GrammarProduction, HCG3Symbol, ProductionNode } from '../types/grammar_nodes';
import { TransitionForestStateA, TransitionStateType } from "../types/transition_tree_nodes";
import { getClosure } from "../utilities/closure.js";
import { getFirstTerminalSymbols } from '../utilities/first.js';
import { Item } from "../utilities/item.js";
import { getProductionClosure } from '../utilities/production.js';
import { disambiguate } from './disambiguate.js';

export const end_item_addendum = 1 << 20;
export const OutOfScopeItemState = -9999;

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

    recognize(
        grammar,
        initial_state,
        root_peek_state,
        resolved_options,
        true
    );

    return initial_state.type & TransitionStateType.MULTI
        ? initial_state
        : initial_state.states[0];
}

export interface TransitionForestGraph {
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

                const follow = getFollowSymbolsFromItems(end_items, grammar)
                    .filter(i => !first.has(i.id));

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
     * Resolves all other conflicts
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
            if (s.state == OutOfScopeItemState)
                return "out-of-scope-state";

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

    for (const group of symbols_groups) {

        const

            initial_state: TransitionForestStateA =
                createTransitionForestState(
                    TransitionStateType.START,
                    [], -1, [],
                    contextual_state
                );

        initial_state.depth = -1;
        initial_state.roots = <any>[(group.some(g => g.atEND) ? end_item_addendum : 0) | i++];

        initial_state.items =
            group.map(i => i.copy(u, u, u, -1));

        root_states.push(initial_state);
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

        const candidate_states = leaf.states.length > 0
            ? leaf.states
            : [leaf];

        //Filter out of scope leafs

        for (const origin_state of candidate_states) {

            const groups = (<any>origin_state.roots.setFilter() as number[])
                .map(i => symbols_groups[i & (end_item_addendum - 1)]);

            origin_state.peek_items = origin_state.items;

            if (groups.some(g => g.some(i => i.state == OutOfScopeItemState))) {
                //Remove this item from consideration
                origin_state.type = TransitionStateType.OUT_OF_SCOPE;
                continue;
            }

            if (groups.length > 1) {

                //Heuristic: If all items shift on the same symbol then simply yield a shift.
                if (groups.flat().group(i => getUniqueSymbolName(i.sym(grammar))).length == 1) {
                    leaf.items.length = 0;
                    leaf.items.push(...groups.flat().setFilter(i => i.id));
                    leaf_states.push(leaf);
                    continue;
                }
                //TODO Rebuild the groups while removing out of scope items.
                leaf.type |= TransitionStateType.FORK | TransitionStateType.MULTI;

                for (const group of groups) {

                    const sym = group[0].sym(grammar);

                    const new_state = createTransitionForestState(
                        TransitionStateType.UNDEFINED,
                        [],
                        0,
                        [],
                        origin_state
                    );

                    if (Sym_Is_A_Production(sym)) {
                        new_state.type |= TransitionStateType.PRODUCTION;
                        new_state.symbols.push(Object.assign({}, sym, { production: null }));

                        new_state.depth = -203;

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

                if (origin_state.items[0].atEND) {
                    //No need to process this state further
                    origin_state.type ^= TransitionStateType.PEEK;
                    origin_state.type |= TransitionStateType.END;
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

function* yieldPeekGraphLeaves(graph: TransitionForestGraph): Generator<TransitionForestStateA> {
    const parent = graph.state;
    if (graph.nodes.length > 0) {

        for (let node of graph.nodes) {
            node.state.parent = parent;
            yield* yieldPeekGraphLeaves(node);

            if (node.state.states.length > 0)
                parent.states.push(node.state);
        }

        if (graph.nodes.length > 1 && parent.states.length > 0) {

            const multi_item_state = createTransitionForestState(
                TransitionStateType.MULTI | TransitionStateType.PEEK,
                [],
                parent.depth + 1, // Always a peek level
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

export function createTransitionForestState(
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
        peek_items: [],
        hash_action: null,
        parent: previous_state,
    };
}



export interface TransitionForestOptions {
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

            const ACTIVE_IDS = new Set(items.filter(i => i.increment().atEND).map(i => i.getProductionID(grammar)));

            if (
                id == production.id
                &&
                lr_items.get(id).some(i => i.increment().atEND)
            ) {

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
                        .map(i => i.copy(undefined, undefined, undefined, OutOfScopeItemState))
                        .filter(i => !i.increment().atEND || !ACTIVE_IDS.has(i.getProductionID(grammar)))
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

    let START_set = [];

    let descend_candidates = initial_candidates;

    let seen_candidates = new Set([production.id]);

    while (descend_candidates.length > 0) {

        const START_set_candidates = START_set.slice();

        for (const descend_candidate of descend_candidates)
            extractSTARTCandidates(production, descend_candidate, START_set_candidates, grammar);

        descend_candidates.length = 0;

        START_set = START_set_candidates
            .filter(i => Sym_Is_A_Token(i.sym(grammar)));

        const production_items = START_set_candidates
            .filter(i => Sym_Is_A_Production(i.sym(grammar)))
            .setFilter(i => i.id);

        //Remove mutual conflicts
        const production_conflicts =
            production_items.group(i => {
                const closure = getClosure([i], grammar);
                return closure.map(i => i.id);
            });

        let seen = new Set();
        for (const mutual_conflict of production_conflicts.sort((a, b) => b.length - a.length)) {
            //<<<<<<< KEEP
            if (
                mutual_conflict.length == 1
                ||
                mutual_conflict.group(i => i.getProductionAtSymbol(grammar).id).length == 1
            ) { //<-- Uncomment and COMMIT this line
                //=======
                //if (mutual_conflict.length > 0) { // <--- REMOVE THIS LINE
                //>>>>>>> REMOVE
                START_set.push(...mutual_conflict.filter(i => !seen.has(i.id)));
            } else {

                //Add the production to descend_candidates
                const production = mutual_conflict[0].getProductionAtSymbol(grammar);

                if (!seen_candidates.has(production.id)) {

                    descend_candidates.push(...getStartItemsFromProduction(production));

                    seen_candidates.add(production.id);
                }
            }

            for (const id of mutual_conflict.map(i => i.id))
                seen.add(id);
        }

        START_set = START_set.setFilter(i => i.id);;
    }


    return START_set.setFilter(i => i.id);
}

function extractSTARTCandidates(
    root_production: GrammarProduction,
    candidate_item: Item,
    START_candidate_set: Item[],
    grammar: GrammarObject,
    check_items: Set<string> = new Set
) {
    // Check for recursion with root candidate. If 
    // known is found than the candidate is available
    // for use with the original grammar. 

    const closure = getClosure([candidate_item], grammar);
    if (
        closure.some(i => (i.getProductionAtSymbol(grammar)?.id ?? -1) == root_production.id)
        ||
        closure.every(i => Sym_Is_A_Production(i.sym(grammar)))
    ) {

        const production_candidate =
            grammar.productions[candidate_item.getProductionAtSymbol(grammar).id];

        const initial_candidates = getStartItemsFromProduction(production_candidate);
        START_candidate_set.push(...initial_candidates.filter(i => !Sym_Is_A_Production(i.sym(grammar))));

        const descend_candidates = initial_candidates.filter(
            i => Sym_Is_A_Production(i.sym(grammar))
                && i.getProductionID(grammar) != root_production.id
                && !check_items.has(i.id)
        );

        for (const descend_candidate of descend_candidates) {
            check_items.add(descend_candidate.id);
            extractSTARTCandidates(
                root_production,
                descend_candidate,
                START_candidate_set,
                grammar,
                check_items
            );
        }

    } else {
        START_candidate_set.push(candidate_item);
    }
}