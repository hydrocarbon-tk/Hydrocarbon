/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    getUniqueSymbolName, Sym_Is_A_Production, Sym_Is_EOF
} from "../grammar/nodes/symbol.js";
import { GrammarObject, HCG3Symbol, SymbolType } from '../types/grammar_nodes';
import { TransitionForestStateA, TransitionStateType } from "../types/transition_tree_nodes";
import { getClosure } from "../utilities/closure.js";
import { getFirstTerminalSymbols } from '../utilities/first.js';
import { Item } from "../utilities/item.js";
import { getStartItemsFromProduction } from '../utilities/production.js';
import { disambiguate } from './disambiguate.js';
import { end_item_addendum, GlobalState, LocalState, OutOfScopeItemState } from './magic_numbers.js';
import { isRecursive } from './STARTs.js';

export function constructTransitionForest(
    grammar: GrammarObject,
    roots: Item[],
    options: TransitionForestOptions = null,
    root_scope: Item[] = []
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

    root_peek_state.items = [...grammar.lr_items.values()].flat().map(i => i.toState(GlobalState));//.filter(i => i.offset == (GOTO ? 1 : 0));


    const root_scope_state: TransitionForestStateA =
        createTransitionForestState(
            TransitionStateType.START,
            [],
            LocalState,
            [],
            root_peek_state,
        );

    root_scope_state.items = root_scope;



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
        root_scope_state,
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
    if (transitioned_items.some(i => !i))
        debugger;
    if (!transitioned_items.some(i => i.state == OutOfScopeItemState))
        if (attemptSingleGroupShift(
            incremented_items,
            grammar,
            previous_state,
            root_peek_state,
            options,
        )) return;

    /**
     * Resolves conflicts
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

    const active_items = incremented_items;

    let end_item = 0;

    const symbols_groups = active_items.group(
        s => {
            if (s.state == OutOfScopeItemState)
                return "out-of-scope-state-" + getUniqueSymbolName(s.sym(grammar));
            if (s.atEND) {
                return "end" + end_item++;
            } else {
                return getUniqueSymbolName(s.sym(grammar));
            }
        }
    );

    const token_leaf_states = [], production_leaf_states = [];

    const root_states: TransitionForestStateA[] = [];

    const active_productions = new Set([...active_items
        .filter(i => !i.atEND && Sym_Is_A_Production(i.sym(grammar)))
        .map(i => i.getProductionAtSymbol(grammar).id),
    ]);

    const active_bodies = new Set([
        ...active_items
            .map(i => i.id),
        ...active_items.filter(i => !i.atEND && Sym_Is_A_Production(i.sym(grammar)))
            .flatMap(i => getStartItemsFromProduction(i.getProductionAtSymbol(grammar)))
            .map(i => i.id)
    ]);

    const filter_out_productions = new Set([...active_items
        .filter(i => i.state != OutOfScopeItemState)
        .flatMap(i => {
            if (i.offset == 0 || i.atEND)
                return i.getProductionID(grammar);
            return [i.getProductionID(grammar), i.getProductionAtSymbol(grammar)?.id ?? -1];
        }),
    ]);

    let i = 0;

    const contextual_items = root_peek_state.items
        .filter(
            i =>
                !active_productions.has(i.getProductionID(grammar))
                &&
                !active_bodies.has(i.id)
        );



    for (const group of symbols_groups) {

        const state =
            (group.some(i => i.state == OutOfScopeItemState))
                ? OutOfScopeItemState :
                group.some(i => !i.atEND)
                    ? 1 + (1 * i)
                    : -1 + (-1 * i);

        const contextual_state: TransitionForestStateA = (state >= 0) ? Object.assign({},
            root_peek_state, {
            items: contextual_items.map(i => i.toState(state))
        }) : Object.assign({},
            root_peek_state.parent, {
            items: root_peek_state.parent.items.map(i => i.toState(state))
        });

        const

            initial_state: TransitionForestStateA =
                createTransitionForestState(
                    TransitionStateType.START,
                    [],
                    -1, <any>[(group.some(g => g.atEND) ? end_item_addendum : 0) | i],
                    contextual_state
                );

        initial_state.depth = -1;

        if (group.some(i => i.state == OutOfScopeItemState))
            initial_state.type |= TransitionStateType.OUT_OF_SCOPE;

        initial_state.items = getClosure(group.map(i => i.toState(state)), grammar, state);

        root_states.push(initial_state);

        i++;
    }

    const disambiguated_tree = disambiguate(grammar, filter_out_productions, root_states, options, true);

    const branch_states = disambiguated_tree.nodes.map((n => (n.state.parent = null, n.state)));

    // Convert the previous state into multi branch state if there are 
    // more than one branch state
    if (branch_states.length > 1) {

        //*
        const multi_item_state = createTransitionForestState(
            TransitionStateType.MULTI,
            [],
            -1001,
            [],
            previous_state
        );

        //This is a free action state.
        multi_item_state.items = incremented_items;

        multi_item_state.states = branch_states;

        branch_states.map(s => s.parent = multi_item_state);

        states.push(multi_item_state);

    } else {
        disambiguated_tree.state.depth = -1;
        //previous_state.depth = -1;
        branch_states[0].parent = previous_state;
        states.push(...branch_states);
    }

    //Build in new states and create transition for each one.
    //Convert graph into a transition tree and yield leaves

    for (const leaf of yieldPeekGraphLeaves(disambiguated_tree, grammar)) {
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

        if (leaf.states.length > 0) {
            //merge leaf states
            const pending_leaf_states: Map<string, TransitionForestStateA> = new Map();

            for (const state of leaf.states) {
                const id = state.roots.sort().join("") + state.items.map(i => i.id).sort().join("");

                if (!pending_leaf_states.has(id))
                    pending_leaf_states.set(id, state);
                else
                    pending_leaf_states.get(id).symbols.push(...state.symbols);
            }

            leaf.states.length = 0;

            for (const [, state] of pending_leaf_states) {
                state.symbols = state.symbols.setFilter(getUniqueSymbolName);
                leaf.states.push(state);
            }
        }

        const candidate_states = leaf.states.length > 0
            ? leaf.states
            : [leaf];

        for (const origin_state of candidate_states) {

            let groups = (<any>origin_state.roots.setFilter() as number[])
                .map(i => symbols_groups[i & (end_item_addendum - 1)]);

            origin_state.peek_items = origin_state.items;

            if (groups.every(g => g.every(i => i.state == OutOfScopeItemState))) {
                origin_state.type = TransitionStateType.OUT_OF_SCOPE;
                continue;
            }

            if (groups.length > 1) {

                const dependent_states = new Map(leaf.items.map(i => [i.state, 0]));

                const getClosureStates =

                    (node: TransitionForestStateA) =>
                        node.items.filter(i => dependent_states.has(i.state)).group(i => i.state);

                const priority_graph = (root_states.filter(i => dependent_states.has(i.items[0].state))
                    .map(s => getClosureStates(s)));

                let node = leaf;

                while (node) {
                    priority_graph.push(getClosureStates(node));
                    node = node.parent;
                }

                let highest_priority = 0;

                for (const level of priority_graph) {

                    for (const group of level) {

                        const state = group[0].state;
                        const priority = group.reduce((r, i) => (i.body_(grammar)?.priority ?? 0) + r, 0);

                        let temp = dependent_states.get(state) + priority;

                        highest_priority = Math.max(temp, highest_priority);

                        dependent_states.set(state, temp);
                    }
                }

                groups.length = 0;

                for (const [group_id, priority] of dependent_states) {

                    if (priority >= highest_priority && group_id > OutOfScopeItemState) {

                        let root_index = Math.abs(group_id) - 1;

                        groups.push(symbols_groups[root_index & (end_item_addendum - 1)]);
                    }
                }
            }

            if (
                groups.length > 1
                &&
                leaf.items.some(i => i.state == OutOfScopeItemState)
                &&
                leaf.items.every(i => !Sym_Is_A_Production(i.sym(grammar)))
            ) {
                groups = leaf.items.map(i => i.state)
                    .setFilter()
                    .filter(i => i != OutOfScopeItemState)
                    .map(i => Math.abs(i) - 1)
                    .map(i => symbols_groups[i & (end_item_addendum - 1)]);
            }


            if (groups.length > 1) {
                if (groups.some(i => i.some(i => i.body == 467)) && groups.length > 1)
                    debugger;

                origin_state.type |= TransitionStateType.FORK | TransitionStateType.MULTI;

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

                    if (group.some(i => i.state == OutOfScopeItemState)) {

                        new_state.type |= TransitionStateType.OUT_OF_SCOPE;

                        new_state.symbols.push(sym);

                    } if (Sym_Is_A_Production(sym)) {

                        new_state.type |= TransitionStateType.PRODUCTION;

                        new_state.symbols.push(Object.assign({}, sym, { production: null }));

                        new_state.depth = -203;

                        new_state.symbols.push(...getFirstTerminalSymbols(sym.val, grammar));
                        new_state.items = group.map(r => r.increment());

                        token_leaf_states.push(new_state);

                    } else {

                        new_state.symbols.push(sym);

                        new_state.depth = -1033;
                        new_state.items = group.map(r => r.atEND ? r : r.increment());

                        new_state.type |= TransitionStateType.TERMINAL;

                        token_leaf_states.push(new_state);
                    }


                    origin_state.states.push(new_state);
                }
            } else {

                origin_state.states.length = 0;

                const group = groups[0];
                const sym = group[0].sym(grammar);

                if (

                    group.every(i => i.offset == 0)
                    && group.group(i => i.getProductionID(grammar)).length == 1

                    && group[0].getProductionID(grammar) != options.root_production

                    && !isRecursive(options.root_production, getStartItemsFromProduction(group[0].getProduction(grammar)), grammar)
                ) {
                    const id = group[0].getProductionID(grammar);

                    origin_state.type = TransitionStateType.PRODUCTION;

                    origin_state.depth = -5005;

                    origin_state.symbols.push({
                        type: SymbolType.PRODUCTION,
                        name: grammar.productions[id].name,
                        pos: null,
                        meta: null,
                        val: id
                    });

                    continue;
                } else if (Sym_Is_A_Production(sym)) {
                    origin_state.depth = -1004;
                    origin_state.type |= TransitionStateType.PRODUCTION;
                    origin_state.items = group.slice().map(i => i);
                    origin_state.symbols.push(sym);
                    production_leaf_states.push(origin_state);
                } else {
                    origin_state.type |= TransitionStateType.TERMINAL;
                    origin_state.items = group.slice();
                    if (!group.some(i => i.atEND)) {
                        token_leaf_states.push(origin_state);
                    } else {
                        origin_state.type ^= TransitionStateType.PEEK;
                        origin_state.type |= TransitionStateType.END;
                    }
                }
            }
        }
    }

    for (const state of token_leaf_states) {
        recognize(grammar, state, root_peek_state, options, true);
    }
    for (const state of production_leaf_states) {
        recognize(grammar, state, root_peek_state, options);
    }
}

function* yieldPeekGraphLeaves(graph: TransitionForestGraph, grammar: GrammarObject): Generator<TransitionForestStateA> {
    const parent = graph.state;

    if (graph.nodes.length > 0) {

        for (let node of graph.nodes) {

            node.state.parent = parent;

            //node.state.items = node.state.items.map(i => i.decrement());

            yield* yieldPeekGraphLeaves(node, grammar);

            if (node.state.states.length > 0) {
                parent.states.push(node.state);
            }
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
            multi_item_state.states = parent.states.flatMap(flattenMulti(multi_item_state.depth));
            multi_item_state.items = multi_item_state.states.flatMap(s => s.items.map(i => i/* .decrement() */));
            parent.states = [multi_item_state];
        }
    }
    else {
        const state = graph.state;

        yield state;
    }

    parent.items = parent.items.setFilter(i => i.id);
}

function flattenMulti(depth: number): (
    value: TransitionForestStateA,
    index: number,
    array: TransitionForestStateA[]
) => TransitionForestStateA | TransitionForestStateA[] {
    const fn = s => {
        if (s.type & TransitionStateType.MULTI && s.depth == depth)
            return s.states.map(fn);

        return s;
    };
    return fn;
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

    /**
     * The maximum peek depth allowed before a branch
     * is deemed ambiguous
     */
    max_tree_depth: number;

    /**
     * Max amount of time the search process may take,
     * measured in milliseconds.
     *
     * Default is 150 milliseconds
     */
    time_limit: number;
    /**
     * The id of the root production
     */
    root_production: number;
}
