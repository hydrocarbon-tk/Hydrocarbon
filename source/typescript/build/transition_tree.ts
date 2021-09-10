/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    getUniqueSymbolName, Sym_Is_A_Production, Sym_Is_EOF
} from "../grammar/nodes/symbol.js";
import { GrammarObject, HCG3Symbol } from '../types/grammar_nodes';
import { TransitionForestStateA, TransitionStateType } from "../types/transition_tree_nodes";
import { getClosure } from "../utilities/closure.js";
import { getFirstTerminalSymbols } from '../utilities/first.js';
import { Item } from "../utilities/item.js";
import { disambiguate } from './disambiguate.js';
import { end_item_addendum, GlobalState, OutOfScopeItemState } from './magic_numbers.js';
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

    root_peek_state.items = [...grammar.lr_items.values()].flat().map(i => i.toState(GlobalState));//.filter(i => i.offset == 0);

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

    const active_productions = new Set(active_items
        .filter(i => !i.atEND && Sym_Is_A_Production(i.sym(grammar)))
        .map(i => i.getProductionAtSymbol(grammar).id));

    const LocalState = 0;

    const contextual_state: TransitionForestStateA = createTransitionForestState(
        TransitionStateType.START, [], LocalState, [], Object.assign({},
            root_peek_state, {
            items: root_peek_state.items.filter(
                i => !Sym_Is_A_Production(i.sym(grammar))
                    ||
                    !(
                        active_productions.has(i.getProductionAtSymbol(grammar).id)
                        ||
                        active_productions.has(i.getProductionID(grammar))
                    )
            )
        })
    );

    const u = undefined;
    contextual_state.items = getClosure(incremented_items, grammar).map(i => i.toState(LocalState));

    let i = 0;

    for (const group of symbols_groups) {

        const

            initial_state: TransitionForestStateA =
                createTransitionForestState(
                    TransitionStateType.START,
                    [],
                    -1, <any>[(group.some(g => g.atEND) ? end_item_addendum : 0) | i++],
                    contextual_state
                );

        const state = group.some(i => i.atEND || i.state == OutOfScopeItemState)
            ? GlobalState
            : LocalState;

        initial_state.depth = state;

        initial_state.items =
            group.map(i => i.toState(state));

        root_states.push(initial_state);
    }

    const disambiguated_tree = disambiguate(grammar, root_states, options, true);

    const branch_states = disambiguated_tree.nodes.map((n => (n.state.parent = null, n.state)));

    // Convert the previous state into multi branch state if there are 
    // more than one branch state
    if (branch_states.length > 1) {
        //*
        const multi_item_state = createTransitionForestState(
            TransitionStateType.MULTI,
            [],
            -103,
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

    for (const leaf of yieldPeekGraphLeaves(disambiguated_tree)) {
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

                    if (origin_state !== leaf)
                        origin_state.depth = -1;

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

            if (node.state.states.length > 0) {
                node.state.depth = parent.depth + 1;
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
