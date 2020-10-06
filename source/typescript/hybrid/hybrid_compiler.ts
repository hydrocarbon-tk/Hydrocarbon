import { Grammar, SymbolType } from "../types/grammar.js";
import { processClosure, Item } from "../util/common.js";
import { Lexer } from "@candlefw/wind";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { CompilerErrorStore } from "../lr/state_generation/compiler_error_store.js";

interface State {
    sym: string;

    /**
     * Unique identifier that is comprised of 
     * the non-unique item signatures (no FOLLOW sym) 
     * that have transitioned to this state.
     */
    id: string;

    sid: string;

    /**
     * A unique array of items with FOLLOW 
     */
    items: Item[];

    /**
     * The state only has items produced from the 
     * same production body.
     */
    PURE: boolean;

    /**
     * The state represents a transition 
     * from a non-terminal symbol, i.e: GOTO
     */
    NON_TERMINAL_TRANSITION: boolean;

    /**
     * The state contains at least one item
     * that at the REDUCE point.
     */
    HAS_COMPLETED_PRODUCTION: boolean;

    /**
     * Tracks item full ids to determine if 
     * the merging state has been encountered
     * at a previous point.
     */
    state_merge_tracking: Set<string>;

    /**
     * The states numerical id for tracking linkages.
     */
    index: number;

    /**
     * An map of symbols/productions and the expected transition
     * state(s) that should follow the symbol/production.
     */
    maps: Map<string, number[]>;

    /**
     * Number of proceeding states that will transition to 
     * this state.
     */
    refs: number;
}

export function CompileHybrid(grammar: Grammar, env: GrammarParserEnvironment) {
    const error = new CompilerErrorStore;
    const start_state: State = {
        sym: "",
        sid: "",
        id: "",
        maps: new Map,
        state_merge_tracking: new Set,
        index: 0,
        HAS_COMPLETED_PRODUCTION: false,
        PURE: true,
        NON_TERMINAL_TRANSITION: false,
        items: [],
        refs: 0

    };
    const states: Map<string, State> = new Map([["", start_state]]);
    const unprocessed_state_items = [
        { old_state: start_state, items: [new Item(0, grammar.bodies[0].length, 0, { val: "$eof", precedence: 0, type: SymbolType.GENERATED, pos: new Lexer })] }
    ];

    /*
        Go through each item set ----
        Gather each item that transitions on a particular symbol; 
        This combinations represent whole groups that can transition 
        to a new state;
    */
    for (let i = 0; i < unprocessed_state_items.length; i++) {

        const { items: to_process_items, old_state } = unprocessed_state_items[i];

        processClosure(to_process_items, grammar, error, []);

        [...to_process_items.reduce((groups, i) => {
            if (i.atEND) return groups;

            const sym = i.sym(grammar).val + "";

            if (!groups.has(sym))
                groups.set(sym, { sym: i.sym(grammar), items: [] });

            groups.get(sym).items.push(i.increment());

            return groups;
        }, new Map()).entries()]
            .map(([key, values]) => {
                // Now the items need to have an identifier created to 
                // identify transition groups that have already been 
                // encountered. This identifier is created from the 
                // current names of items in the group
                const id = values.items
                    .map(i => { i.end = i.atEND; return i.id; })
                    .filter((e, i, a) => a.indexOf(e) == i)
                    .sort((a, b) => a < b ? -1 : 1).join("|"),
                    sid = values.items
                        .map(i => i.sid)
                        .filter((e, i, a) => a.indexOf(e) == i)
                        .sort((a, b) => a < b ? -1 : 1).join("");

                //Out pops a new state. 
                return <State>{
                    sym: values.sym.val,
                    id,
                    sid,
                    items: values.items,
                    PURE: id.length == 4,
                    NON_TERMINAL_TRANSITION: values.sym.type !== "production",
                    HAS_COMPLETED_PRODUCTION: values.items.some(i => i.atEND),
                    state_merge_tracking: new Set,
                    index: 0,
                    maps: new Map,
                    refs: 0,
                };
            })
            .map(state => {
                const { id, sid, sym } = state;


                if (!states.has(id)) {
                    state.index = states.size;
                    states.set(id, state);
                }

                if (!old_state.maps.has(sym)) {
                    old_state.maps.set(sym, []);
                }

                const active_state = states.get(id);
                const transition_map = old_state.maps.get(sym);

                if (transition_map.indexOf(active_state.index) < 0)
                    transition_map.push(active_state.index);

                old_state.maps;

                states.set(id, active_state);

                if (!active_state.state_merge_tracking.has(sid)) {
                    unprocessed_state_items.push({ old_state: state, items: state.items });
                    active_state.state_merge_tracking.add(sid);
                }

                active_state.items.push(...state.items);

                const filter_set = new Set();

                active_state.items = active_state.items.filter(i => (!filter_set.has(i.full_id) && (filter_set.add(i.full_id), true)));

                return active_state;
            });
    }


    /*
        The one thing that represents a true transition is a terminal.
        Non-Terminal transitions must occur after the completion of some 
        production, and therefore a dependent on the results of completing
        a production from discovered non-terminal symbols.

        The number of productions that transition together on the same terminal
        are a transition group. If all members of a transition group are of the 
        same body, with the only difference being the follow, then this is called
        a pure transition. These groups yield good results when used with a 
        recursive descent parser.
    */

    // Once states are created we turn the graph into a series of functions that 
    // will form the parser. We'll take every opportunity to reduce states into simple
    // expressions to encourage fast parsing and minimal instructions

    const functions = [], state_array = [...states.values()];

    //This will take a few passes to compile states

    //First pass counts all the references to that state from previous states.
    //States with single refs can be compiled into the referring state.
    for (const [key, state] of states.entries()) {
        //Each state has a set of transitions  
        for (const t_states of state.maps.values())
            for (const state of t_states.map(s => state_array[s]))
                state.refs++;
    }

    //Now the fun part, we'll create code for each state. 




    return states;
}