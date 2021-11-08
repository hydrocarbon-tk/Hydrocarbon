/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    getUniqueSymbolName, Sym_Is_A_Production, Sym_Is_EOF
} from "../../grammar/nodes/symbol.js";
import { GrammarObject, HCG3Symbol, SymbolType, TransitionForestStateA, TransitionStateType } from "../../types/";
import { getClosure } from "../../utilities/closure.js";
import { getFirstTerminalSymbols } from '../../utilities/first.js';
import { Item, itemsToProductionIDs } from "../../utilities/item.js";
import { end_item_addendum, GlobalState, LocalState, OutOfScopeItemState } from '../../utilities/magic_numbers.js';
import { getStartItemsFromProduction } from '../../utilities/production.js';
import { disambiguate } from './disambiguate.js';
import { isRecursive } from './STARTs.js';

export function constructTransitionForest(
    grammar: GrammarObject,
    roots: Item[],
    options: TransitionForestOptions = null,
    root_scope: Item[] = [],

    //Internal recursive arguments
): TransitionForestStateA {

    const resolved_options: TransitionForestOptions = Object.assign(
        <TransitionForestOptions>{
            expanded_limit: 0,
            max_tree_depth: 10,
            max_no_progress: 8,
            time_limit: 150,
            resolved_items: [],
            PRODUCTION_IS_SCANNER: false,
            root_production: 0
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

            options.resolved_items.push(...val);

            state.items = val;

            state.type |= TransitionStateType.END | TransitionStateType.COMPLETED;
        } else {
            state.items = val;
            recognize(grammar, state, root_peek_state, options);
        }

        return true;
    }

    return false;
}

function createPeekTreeStates(
    active_items: Item[],
    grammar: GrammarObject,
    previous_state: TransitionForestStateA,
    root_peek_state: TransitionForestStateA,
    options: TransitionForestOptions,
) {

    const in_scope_items = active_items.filter(i => i.state != OutOfScopeItemState);

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

    const root_states: TransitionForestStateA[] = [];

    const active_productions = new Set([
        ...in_scope_items
            .filter(
                i => !i.atEND && Sym_Is_A_Production(i.sym(grammar))
            )
            .map(i => i.getProductionAtSymbol(grammar).id),
    ]);

    const active_bodies = new Set([
        ...in_scope_items
            .map(i => i.id),
        ...in_scope_items.filter(i => !i.atEND && Sym_Is_A_Production(i.sym(grammar)))
            .flatMap(i => getStartItemsFromProduction(i.getProductionAtSymbol(grammar)))
            .map(i => i.id)
    ]);

    const filter_out_productions = new Set([...in_scope_items.map(i => i.getProductionAtSymbol(grammar)?.id ?? -1)]);

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

        if (
            state == OutOfScopeItemState
            &&
            Sym_Is_A_Production(group[0].sym(grammar))
            &&
            filter_out_productions.has(group[0].getProductionAtSymbol(grammar).id)
        ) {
            // Ignore groups that transition on the same PRODUCTION
            // that in scope groups also transition on
            continue;
        }

        const
            contextual_state: TransitionForestStateA = (state >= 0) ? Object.assign({},
                root_peek_state, {
                items: contextual_items.map(i => i.toState(state))
            }) : Object.assign({},
                root_peek_state.parent, {
                items: root_peek_state.parent.items.map(i => i.toState(state))
            }),

            initial_state: TransitionForestStateA =
                createTransitionForestState(
                    TransitionStateType.START,
                    [],
                    -1, <any>[(group.some(g => g.atEND) ? end_item_addendum : 0) | i],
                    contextual_state
                );

        initial_state.depth = 0;

        if (group.some(i => i.state == OutOfScopeItemState))
            initial_state.type |= TransitionStateType.OUT_OF_SCOPE;

        initial_state.items = getClosure(group.map(i => i.toState(state)), grammar, state);

        root_states.push(initial_state);

        i++;
    }

    if (options.PRODUCTION_IS_SCANNER)
        processPeekGraphLeavesScanner(
            grammar,
            active_items,
            previous_state,
            root_peek_state,
            symbols_groups,
            root_states,
            options
        );
    else
        processPeekGraphLeavesStandard(
            grammar,
            active_items,
            previous_state,
            root_peek_state,
            symbols_groups,
            root_states,
            options
        );

}
function processPeekGraphLeavesScanner(
    grammar: GrammarObject,
    active_items: Item[],
    previous_state: TransitionForestStateA,
    root_peek_state: TransitionForestStateA,
    symbols_groups: Item[][],
    root_states: TransitionForestStateA[],
    options: TransitionForestOptions,
) {

    const { states } = previous_state,

        disambiguated_tree = createDisambiguatedTree(
            grammar,
            root_states,
            options,
            previous_state,
            active_items,
            states
        );

    //Build in new states and create transition for each one.
    //Convert graph into a transition tree and yield leaves
    const token_leaf_states = [], production_leaf_states = [];

    for (const leaf of yieldPeekGraphLeavesScanner(disambiguated_tree, grammar, options)) {
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
                state.type ^= (state.type & TransitionStateType.PEEK);
                state.symbols = state.symbols.setFilter(getUniqueSymbolName);
                leaf.states.push(state);
            }
        }

        const candidate_states = leaf.states.length > 0
            ? leaf.states
            : [leaf];

        for (const origin_state of candidate_states) {

            const items = origin_state.items;

            let groups = (<any>origin_state.roots.setFilter() as number[])
                .map(i => symbols_groups[i & (end_item_addendum - 1)]);
            if (groups.every(g => g.every(i => i.state == OutOfScopeItemState))) {
                origin_state.type |= TransitionStateType.OUT_OF_SCOPE;
                continue;
            }

            if (origin_state.type & TransitionStateType.AMBIGUOUS) {
                if (
                    items.every(i => i.atEND && i.getProduction(grammar).id == options.root_production)
                    &&
                    items.filter(i => (i.body_(grammar).priority || 0) > 0).length == 1
                ) {
                    let sorted = items.sort((a, b) => (b.body_(grammar).priority || 0) - (a.body_(grammar).priority || 0));

                    const new_state = createTransitionForestState(
                        TransitionStateType.END,
                        [],
                        0,
                        [],
                        origin_state
                    );

                    new_state.items = sorted.slice(0, 1);

                    new_state.type |= TransitionStateType.TERMINAL;

                    token_leaf_states.push(new_state);

                    origin_state.states.push(new_state);
                } else {
                    throw new Error("TODO: Implement Scanner Forks");
                    origin_state.type |= TransitionStateType.OUT_OF_SCOPE;
                    continue;

                }
            } else {
                origin_state.states.length = 0;

                const items = origin_state.items;

                /**
                 * If there exists other states that already have items
                 * in the end position then we can filter out end items
                 * in this state. 
                 * 
                 * Why: 
                 * 
                 * The only point at which we have leaf states that
                 * have end items are when there are ambiguous leaf states
                 * that have reached EOF, or when we have unambiguous leaf
                 * state that transitioned as set of items from a previous
                 * symbol, and now include end items. 
                 * 
                 * We allow the  ambiguous leaf states to win since they 
                 * represent the actual parse actions that should occur.
                 */
                if (
                    items.some(i => i.atEND)
                    &&
                    items.some(i => !i.atEND)
                    &&
                    leaf.parent.states.some(s => s.symbols.some(Sym_Is_EOF))
                ) {
                    origin_state.items = items.filter(i => !i.atEND);
                }

                if (items.every(i => i.atEND)) {
                    origin_state.type |= TransitionStateType.COMPLETED;
                    origin_state.type |= TransitionStateType.END;
                } else if (items.length == 1) {
                    origin_state.type = TransitionStateType.TERMINAL;
                    production_leaf_states.push(origin_state);
                } else {
                    origin_state.type = TransitionStateType.MULTI;
                    token_leaf_states.push(origin_state);
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

function processPeekGraphLeavesStandard(
    grammar: GrammarObject,
    active_items: Item[],
    previous_state: TransitionForestStateA,
    root_peek_state: TransitionForestStateA,
    symbols_groups: Item[][],
    root_states: TransitionForestStateA[],
    options: TransitionForestOptions,
) {

    const { states } = previous_state,

        disambiguated_tree = createDisambiguatedTree(
            grammar,
            root_states,
            options,
            previous_state,
            active_items,
            states
        );

    //Build in new states and create transition for each one.
    //Convert graph into a transition tree and yield leaves
    const token_leaf_states = [], production_leaf_states = [];

    for (const leaf of yieldPeekGraphLeaves(disambiguated_tree, grammar, options)) {
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
                        tok: null,
                        meta: null,
                        val: id
                    });
                    options.resolved_items.push(...group);
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
                        options.resolved_items.push(...group);
                        origin_state.type ^= (origin_state.type & TransitionStateType.PEEK);
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
function createDisambiguatedTree(
    grammar: GrammarObject,
    root_states: TransitionForestStateA[],
    options: TransitionForestOptions,
    previous_state: TransitionForestStateA,
    active_items: Item[],
    states: TransitionForestStateA[]
) {
    const disambiguated_tree = disambiguate(grammar, root_states, options, true);

    const branch_states = disambiguated_tree.nodes.map((n => (n.state.parent = null, n.state))).map(n => {
        n.type ^= TransitionStateType.PEEK & n.type;
        return n;
    });

    // Convert the previous state into multi branch state if there is 
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
        multi_item_state.items = active_items;

        multi_item_state.states = branch_states;

        branch_states.map(s => s.parent = multi_item_state);

        states.push(multi_item_state);

    } else {

        disambiguated_tree.state.type ^= (disambiguated_tree.state.type & TransitionStateType.PEEK);

        disambiguated_tree.state.depth = -1;

        branch_states[0].parent = previous_state;

        states.push(...branch_states);
    }

    return disambiguated_tree;
}
function* yieldPeekGraphLeavesScanner(
    graph: TransitionForestGraph,
    grammar: GrammarObject,
    options: TransitionForestOptions
): Generator<TransitionForestStateA> {

    const parent = graph.state;

    parent.type ^= parent.type & TransitionStateType.PEEK;

    if (graph.nodes.length > 0) {

        for (let node of graph.nodes.sort((a, b) => {
            const scoreA = (a.state.type & TransitionStateType.AMBIGUOUS) ? 10 : 0;
            const scoreB = (b.state.type & TransitionStateType.AMBIGUOUS) ? 10 : 0;
            return scoreB - scoreA;
        })) {

            node.state.parent = parent;

            yield* yieldPeekGraphLeavesScanner(node, grammar, options);

            parent.states.push(node.state);
        }

        if (graph.nodes.length > 1 && parent.states.length > 1) {

            const multi_item_state =
                createTransitionForestState(TransitionStateType.MULTI, [], parent.depth + 1, [], parent);

            // Merge child Multi states into parent Multi states if 
            // their depth is the same.
            multi_item_state.states =
                parent.states;//.flatMap(flattenMulti(multi_item_state.depth));

            multi_item_state.items = multi_item_state.states.flatMap(s => s.items);

            multi_item_state.symbols = multi_item_state.states.flatMap(s => s.symbols);

            parent.states = [multi_item_state];
        }
    } else {
        const state = graph.state;

        yield state;
    }

    parent.items = parent.items.setFilter(i => i.id);
}

function* yieldPeekGraphLeaves(
    graph: TransitionForestGraph,
    grammar: GrammarObject,
    options: TransitionForestOptions,
): Generator<TransitionForestStateA> {

    const parent = graph.state;

    if (graph.nodes.length > 0) {

        for (let node of graph.nodes) {

            node.state.parent = parent;

            yield* yieldPeekGraphLeaves(node, grammar, options);

            if (node.state.states.length > 0) {

                parent.states.push(node.state);
            }
        }

        if (graph.nodes.length > 1 && parent.states.length > 0) {

            const multi_item_state = createTransitionForestState(
                TransitionStateType.MULTI | (parent.type & TransitionStateType.PEEK),
                [],

                parent.depth + 1,
                [],
                parent
            );

            // Merge child Multi states into parent Multi states if 
            // their depth is the same.
            multi_item_state.states =
                parent.states.flatMap(flattenMulti(multi_item_state.depth));

            multi_item_state.items =
                multi_item_state.states.flatMap(s => s.items.map(i => i/* .decrement() */));

            multi_item_state.symbols
                = multi_item_state.states.flatMap(s => s.symbols);

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
        if ((s.type & TransitionStateType.MULTI && !(s.type & TransitionStateType.FORK)) && s.depth == depth)
            return s.states.flatMap(fn);
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

    PRODUCTION_IS_SCANNER: boolean;

    resolved_items: Item[];
}
