import { default_EOF, default_GEN_SYM } from '../grammar/nodes/default_symbols.js';
import {
    getSymbolFromUniqueName,
    getUniqueSymbolName, SymbolsCollide,
    Symbols_Are_The_Same,
    Sym_Is_A_Generic_Identifier, Sym_Is_A_Production,
    Sym_Is_A_Production_Token, Sym_Is_A_Token, Sym_Is_Defined, Sym_Is_Defined_Identifier, Sym_Is_Exclusive
} from "../grammar/nodes/symbol.js";
import { GrammarObject, TokenSymbol } from '../types/grammar_nodes';
import { TransitionForestStateA, TransitionStateType } from "../types/transition_tree_nodes";
import { getClosure } from "../utilities/closure.js";
import { Item } from "../utilities/item.js";
import { end_item_addendum, GlobalState, LocalState, OutOfScopeItemState } from './magic_numbers.js';
import { createTransitionForestState, TransitionForestGraph, TransitionForestOptions } from './transition_tree.js';

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
 *      the depth of the resulting parse forest could be unbounded and
 *      the function may not return.
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
export function disambiguate(
    grammar: GrammarObject,
    filter_out_productions: Set<number>,
    peek_states: TransitionForestStateA[],
    options: TransitionForestOptions,
    INITIAL_STATE: boolean = false,
    start_time: number = performance.now(),
    AUTO_EXIT: boolean = false,
): TransitionForestGraph {

    const graph_node: TransitionForestGraph = {
        symbol: null,

        AMBIGUOUS: true,

        nodes: [],

        state: mergeStates(
            TransitionStateType.PEEK
            | TransitionStateType.AMBIGUOUS
            | TransitionStateType.TERMINAL,
            peek_states
        )
    };

    if (peek_states[0].depth > options.max_tree_depth
        ||
        (performance.now() - start_time) > options.time_limit
        ||
        AUTO_EXIT
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

        let considered_items = incremented_items
            .flatMap(i => i.atEND
                ? getClosure(resolveEndItem(i, previous_state, grammar), grammar, i.state)
                : getClosure([i], grammar, i.state)
            )
            .setFilter(i => i.id);

        if (depth < 0 && par_type & TransitionStateType.OUT_OF_SCOPE) {
            // Filter out of scope out items that would 
            // conflict with the in scope items.

            considered_items = considered_items.filter(i => {
                if (filter_out_productions.has(i.getProductionID(grammar)))
                    return false;
                return true;
            });
        }

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

                const

                    symbols: TokenSymbol[] = <any>group
                        .map(g => g.sym(grammar))

                        .setFilter(getUniqueSymbolName);


                let state: TransitionForestStateA = createTransitionForestState(TransitionStateType.UNDEFINED,
                    symbols,
                    depth + 1,
                    roots,
                    previous_state);
                state.items = considered_items.filter(i => Sym_Is_A_Token(i.sym(grammar)));

                states.push(state);
            }
        }

        if (
            considered_items.length == 0
        ) {
            // The only solution at this point is an end of file state.
            let state: TransitionForestStateA = createTransitionForestState(TransitionStateType.UNDEFINED,
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

    mergeGroupsWithOccludingSymbols(grouped_roots, grammar);

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

    for (let [key, states] of grouped_roots) {

        let child_graph_node = null;

        if (
            states.length > 1
            &&
            states.some(i => i.items.some(i => i.state == LocalState))
            &&
            states.some(i => i.items.some(i => i.state == GlobalState))
        ) {
            //Modify states whose roots that are SHIFT/REDUCE conflicts in favor of SHIFT
            const shift_states = states.filter(i => i.items.some(i => i.state == LocalState));
            const reduce_states = states.filter(i => i.items.some(i => i.state == GlobalState));
            const reduce_keeps = [], shift_items = new Set(shift_states.flatMap(s => s.items.map(i => i.id)));

            for (const reduce_state of reduce_states) {
                if (reduce_state.items.some(i => shift_items.has(i.id)))
                    continue;

                reduce_keeps.push(reduce_state);
            }

            states = shift_states.concat(reduce_keeps);
        }

        if (states.length > 1) {

            if (INITIAL_STATE)
                start_time = performance.now();
            const key_symbol = getSymbolFromUniqueName(grammar, key);
            let new_states = states.map(s => Object.assign({}, s, {
                items: s.items.filter(
                    i => i.sym(grammar).id == key_symbol.id
                        ||
                        SymbolsCollide(i.sym(grammar), key_symbol, grammar))
            }));

            if (
                key == getUniqueSymbolName(default_EOF)
                ||
                //If States have identical closures, then there will be now way to disambiguate
                states.group(s => s.items.map(i => i.id).sort().join()).length == 1
            ) {
                //do nothing, this is as far as we get with these states
                child_graph_node = disambiguate(grammar,
                    filter_out_productions,
                    new_states,
                    options,
                    false,
                    start_time,
                    true
                );
            } else {
                child_graph_node = disambiguate(grammar,
                    filter_out_productions,
                    new_states,
                    options,
                    false,
                    start_time
                );
            }

            child_graph_node.symbol = key;

            if (child_graph_node.AMBIGUOUS)
                child_graph_node.nodes.length = 0;

            graph_node.nodes.push(child_graph_node);

        } else {

            disambiguated_node.symbol = key;

            //if (key == getUniqueSymbolName(default_EOF))
            //    disambiguated_node.AMBIGUOUS = true;

            dissambiguated_multi_node.symbol = key;

            disambiguated_node.state = states[0];

            states[0].type = TransitionStateType.PEEK | TransitionStateType.TERMINAL;

            dissambiguated_multi_node.state.states.push(states[0]);

            dissambiguated_multi_node.state.items.push(
                ...states[0].items//.map(i => i)
            );

            if (states[0].roots.some(i => i >= end_item_addendum))
                REQUIRE_MULTI_DISAMBIGUATE_NODE = true;
        }
    }

    if (
        dissambiguated_multi_node.state.states.length > 1
        ||
        REQUIRE_MULTI_DISAMBIGUATE_NODE
    ) {

        REQUIRE_MULTI_DISAMBIGUATE_NODE = true;

        dissambiguated_multi_node.symbol = getUniqueSymbolName(default_GEN_SYM);

        graph_node.nodes.push(dissambiguated_multi_node);

        dissambiguated_multi_node.state.items =
            dissambiguated_multi_node.state.items
                //.map(i => i.atEND ? i : i.decrement())
                .setFilter(i => i.id);

        dissambiguated_multi_node.AMBIGUOUS =
            dissambiguated_multi_node.state.items.every(i => i.atEND)
            &&
            dissambiguated_multi_node.state.items.length > 1;
        //dissambiguated_multi_node.AMBIGUOUS = dissambiguated_multi_node.state.items.every(i => i.atEND);
    } else if (disambiguated_node.state != null)
        graph_node.nodes.push(disambiguated_node);


    graph_node.AMBIGUOUS = graph_node.nodes.some(n => n.AMBIGUOUS)
        ||
        graph_node.nodes.length == 0;

    return graph_node;
}


function mergeGroupsWithOccludingSymbols(grouped_roots: Map<string, TransitionForestStateA[]>, grammar: GrammarObject) {

    for (const [key, group_a] of grouped_roots) {

        const incoming_sym = getSymbolFromUniqueName(grammar, key);
        if (
            Sym_Is_A_Production_Token(incoming_sym)
            ||
            Sym_Is_A_Generic_Identifier(incoming_sym)
            ||
            (
                Sym_Is_Defined_Identifier(incoming_sym)
                &&
                Sym_Is_Exclusive(incoming_sym)
            )
            //||
            //Sym_Is_A_Generic_Symbol(incoming_sym)
        )
            for (const [key, group_b] of grouped_roots) {

                const root_sym = getSymbolFromUniqueName(grammar, key);
                const existing_states = new Set(group_b.flatMap(i => i.roots));

                if (
                    (
                        Sym_Is_Defined_Identifier(root_sym)
                        //  ||
                        //  (
                        //      Sym_Is_Defined_Symbol(root_sym)
                        //      &&
                        //      root_sym.byte_length == 1
                        //  )
                    )
                    &&
                    !Sym_Is_Exclusive(root_sym)
                    &&
                    !Symbols_Are_The_Same(incoming_sym, root_sym)
                    &&
                    SymbolsCollide(incoming_sym, root_sym, grammar)) {

                    group_b.push(
                        ...group_a
                            /*
                            .filter(
                                a => {
                                    return !group_b.includes(a)
                                        &&
                                        a.roots.some(r => !existing_states.has(r));
                                }
        
                            )*/
                            //Remove states to prevent symbol overlapping
                            .map(g => Object.assign({}, g, { states: [] }))
                    );

                    //  if (Sym_Is_Exclusive(incoming_sym))
                    //      grouped_roots.delete(key);
                }
            }
    }
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
        items: states.flatMap(i => i.items).setFilter(i => i.id),

        peek_items: [],

        hash_action: null
    };
}
function resolveEndItem(
    end_item: Item,
    state: TransitionForestStateA,
    grammar: GrammarObject,
    depth: number = 0

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

            if (
                depth == end_item.state
                ||
                ((matching_items.length == 0 || end_item.state == OutOfScopeItemState) && depth < 0)
            ) {

                matching_items.push(...items.filter(
                    i => ((i.getProductionAtSymbol(grammar)?.id ?? -1) == production_id)
                ).map(i => i.toState(end_item.state)));
            }

            prev = parent;
        }

        if (matching_items.length == 0) {
        } else {

            for (const item of matching_items.setFilter(i => i.id)) {

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
