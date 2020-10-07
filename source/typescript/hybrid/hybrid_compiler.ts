import { Grammar, SymbolType, Symbol } from "../types/grammar.js";
import { processClosure, Item } from "../util/common.js";
import { Lexer } from "@candlefw/wind";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { CompilerErrorStore } from "../lr/state_generation/compiler_error_store.js";
import { stmt, renderWithFormatting, extendAll, JSNode } from "@candlefw/js";
import { ItemIndex } from "../util/item.js";
import { k } from "@candlefw/wind/build/types/ascii_code_points";

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
    TERMINAL_TRANSITION: boolean;

    /**
     * The state contains at least one item
     * that at the REDUCE point.
     */
    HAS_COMPLETED_PRODUCTION: boolean;

    /**
     * Contains only completed bodies.
     */
    CONTAINS_ONLY_COMPLETE: boolean;

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
        TERMINAL_TRANSITION: false,
        CONTAINS_ONLY_COMPLETE: false,
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
        }, <Map<string, { sym: string, items: Item[]; }>>new Map()).entries()]
            .map(([key, values]) => {
                // Now the items need to have an identifier created to 
                // identify transition groups that have already been 
                // encountered. This identifier is created from the 
                // current names of items in the group
                const id = values.items
                    .map(i => { i.end = i.atEND; return i.id; })
                    .filter((e, i, a) => a.indexOf(e) == i)
                    .sort((a, b) => a < b ? -1 : 1).join(""),
                    sid = values.items
                        .map(i => i.full_id)
                        .filter((e, i, a) => a.indexOf(e) == i)
                        .sort((a, b) => a < b ? -1 : 1).join(":");

                //Out pops a new state. 
                return <State>{
                    sym: values.sym.val,
                    id,
                    sid,
                    items: values.items,
                    PURE: id.length == 4,
                    TERMINAL_TRANSITION: values.sym.type !== "production",
                    HAS_COMPLETED_PRODUCTION: values.items.some(i => i.atEND),
                    CONTAINS_ONLY_COMPLETE: values.items.every(i => i.atEND),
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
        a production from discovered terminal symbols.

        The number of productions that transition together on the same terminal
        are a transition group. If all members of a transition group are of the 
        same body, with the only difference being the follow, then this is called
        a pure transition. Pure transition groups work will with recursive descent 
        parsers.
    */

    // Once states are created we turn the graph into a series of functions that 
    // will form the parser. We'll take every opportunity to reduce states into simple
    // expressions to encourage fast parsing and minimal instructions

    const functions = [], state_array = [...states.values()], id_nodes: JSNode[][] = state_array.reduce(r => (r.push([]), r), []);


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

    for (const state of states.values()) {

        const { maps } = state;

        if (state.refs > 0 || state.index == 0) {
            const fn = stmt(`function State${state.index}(env,a,b,c){const sym = []; }`);
            const fn_id = fn.nodes[0];
            const fn_body_nodes = fn.nodes[2].nodes;

            id_nodes[state.index].push(fn_id);
            functions[state.index] = fn;


            /**A state is comprised of two main things
             * 
             * - A set terminal symbols that transition to a new state. 
             *   These transitions can be thought of as natural recursive
             *   Transitions.
             * 
             * - A set of pointers to states that represent the GOTO from 
             *   a completed production. These transitions may be combined
             *   to form a complex reduction if the states only have a single 
             *   ref, i.e. a degree 2 directed acyclic graph aka a basic single link list. 
            */

            /**
             * const num = num(lex); // Number is the expected symbol for this production. It is a
             * // PURE, TERMINAL_TRANSITION, that HAS_COMPLETED_PRODUCTION and CONTAINS_ONLY_COMPLETE 
             * items.
             */

            /**  
             * Each terminal represents a non-terminal production possibility
             * We can either enter into a new function that represents that possibility,
             * or incorporate the code into the originating state function itself. 
             * If the latter occurs, remove one ref count from the transition state.
             */

            fn_body_nodes.push(...reduceState(state, null, state_array, grammar, id_nodes));


            //fn_body_nodes.push(...shiftState(state, state_array, grammar, id_nodes));

            fn_body_nodes.push(
                stmt(`env.lex.throw("could not continue parse at state ${state.index}");`)
            );
        }
    }

    //rename all refs
    for (let i = 0; i < state_array.length; i++) {

        const state = state_array[i];

        const ids = id_nodes[i];

        const unique = new Map(state.items.map(i => [i.id, i]));

        const d = [...unique.values()].map(v => v.renderWithProduction(grammar)).join("|") ?? "";

        const id_name = "$" + (i || "start"); // + `[${i}]`;

        for (const id of ids)
            id.value = id_name;
    }

    // console.log({ states });

    const parser = stmt(`return function(lexer){
        return $start({lex:lexer});
    }`);

    parser.nodes[0].nodes[2].nodes.unshift(...functions);

    const string = renderWithFormatting(parser);

    //console.log(string);

    return Function(string)();
}

function shiftState(
    state: State,
    states: State[],
    grammar: Grammar,
    ids: JSNode[][]

) {
    const statements = [];

    for (const [key, value] of getShiftStates(state)) {
        for (const shift_to_state of getStatesFromNumericArray(value, states)) {


            //Otherwise, see if it is PURE, and it's chain is also PURE without Shift-Reduce
            //conflicts.
            //state.refs--;

            //Otherwise create function to transition to new state. 
            const item = shift_to_state.items[0].decrement();
            const sym = item.sym(grammar);
            const production = item.getProduction(grammar);
            const statement = extendAll(stmt(`if(${getLexComparisonString(sym, grammar)}){ }`));
            statements.push(statement);
            const block = statement.nodes[1].nodes;

            block.push(
                //    stmt("const v = env.lex.tx;"),
                stmt("env.lex.next();"),
            );

            const { stmts, productions } = integrateState(shift_to_state, grammar, ids);

            for (const gotos_indices of (productions.map(i => state.maps.get(i)))) {
                // console.log(gotos_indices);
                if (gotos_indices)
                    for (const goto_state of getStatesFromNumericArray(gotos_indices, states))
                        stmts.push(...reduceState(goto_state, state, states, grammar, ids));
                else
                    stmts.push(stmt(`return {p:null, v:null, type:"shift"};`));



            }

            block.push(...stmts);
        }
    }


    return statements;
}

/**
 * Creates a reduce/goto chain
 */
function reduceState(
    /**  The state to reduce */
    state: State,
    /** The previous state to draw the goto from */
    previous: State,
    /** List of all states */
    states: State[],
    /** The grammar for the states */
    grammar: Grammar,
    /** List of id nodes referencing the name of a state function */
    ids: JSNode[][]
): JSNode[] {
    const statements = [];

    //State should already be assumed to have reducible constructs

    for (const completed_item of getCompletedItems(state)) {

        // We reduce on the state, gather the production signatures
        // And proceed processing the next goto state. 
        // If the goto state is the goal state, then we just return. 

        const follow_sym = completed_item.follow;
        const item = completed_item;
        const sym = follow_sym;
        //if (forced_sym && sym.val != follow_sym) continue;
        const production = item.getProduction(grammar);
        const body = item.body_(grammar);
        const symbol_decode = getLexPeekComparisonString(sym, grammar);
        const statement = extendAll(stmt(`if(${symbol_decode}){;}`));
        const block = statement.nodes[1].nodes;
        block.length = 0;

        const reduce_function = body?.reduce_function?.txt ?? "noop";

        statements.push(statement);

        if (previous) {
            //REturn node if there is ?
            block.push(
                stmt(`const node = (_=>_)()`),
                //stmt(`const node = (()=>{${reduce_function}})()`),
                stmt("const v = env.lex.tx;"),

                stmt(`return {p:null, v:null, type:"reduce"};`)
            );
            //open up the goto for the next state

            //  if (!previous_state) console.log({ non_prev: state });
            //
            //  console.log(previous_state, item);

            //   console.log({ goto_state });

        } else {
            block.push(
                stmt(`const node = (_=>_)()`),
                // stmt(`const production = ${completed_item.getProduction(grammar).name}`),
                stmt("const v = env.lex.tx;"),
                //stmt("env.lex.next();"),
                stmt(`return {p:null, v:null, type:"reduce"};`),
            );
        }
    }


    statements.push(...shiftState(state, states, grammar, ids));

    return statements;
}


function getLexComparisonString(sym: Symbol, grammar: Grammar): string {
    switch (sym.type) {
        case SymbolType.GENERATED:
            return `env.lex.ty == ${Lexer.types[sym.val]}`;
            return `env.lex.ty == ${"$" + sym.val ?? Lexer.types[sym.val]}`;
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `env.lex.tx == "${sym.val}"`;
        case SymbolType.END_OF_FILE:
            return `env.lex.END`;
        case SymbolType.EMPTY:
            return "true";
    }
}

function getLexPeekComparisonString(sym: Symbol, grammar: Grammar): string {

    switch (sym.type) {
        case SymbolType.GENERATED:
            if (sym.val == "$eof")
                return `env.lex.END`;
            return `env.lex.ty == ${"$" + sym.val ?? Lexer.types[sym.val]}`;
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `env.lex.tx == "${sym.val}"`;
        case SymbolType.END_OF_FILE:
            return `env.lex.END`;
        case SymbolType.EMPTY:
            return "true";
    }
}
//
function integrateState(state: State, grammar: Grammar, id_nodes: any[]) {

    const goto_stmt = stmt(`const { p, v:val } = State${state.index}(env);`);

    const goto_id = goto_stmt.nodes[0].nodes[1].nodes[0];

    id_nodes[state.index].push(goto_id);

    return {
        stmts: [goto_stmt],
        //The productions that the transition should reduce to eventually
        productions: state.items.map(i => i.getProduction(grammar).id).filter((g, i, a) => a.indexOf(g) == i)
    };
    //}
}

function isStatePurelyCompressible(state: State) {
    return state.PURE && state.HAS_COMPLETED_PRODUCTION && state.CONTAINS_ONLY_COMPLETE;
}

function createInlineReductions(state, states, grammar, previous_state) {

}

/**
 * TODO: Determine what meets the criteria of an inline parse
 * @param state 
 * @param states 
 * @param grammar 
 */
function createInlineParse(state: State, states: State[], grammar: Grammar, previous_state: State, depth: number = 0, forced_sym = null): JSNode[] {

    const statements: JSNode[] = [];

    if (depth < 5) {

        if (state.HAS_COMPLETED_PRODUCTION) {

            for (const completed_item of getCompletedItems(state)) {

                const follow_sym = completed_item.follow;
                const item = completed_item;
                const sym = follow_sym;
                if (forced_sym && sym.val != follow_sym) continue;
                const production = item.getProduction(grammar);
                const body = item.body_(grammar);
                const symbol_decode = getLexPeekComparisonString(sym, grammar);
                const statement = extendAll(stmt(`if(${symbol_decode}, ${state.index}){;}`));
                const block = statement.nodes[1].nodes;
                block.length = 0;

                const reduce_function = body?.reduce_function?.txt ?? "noop";


                block.push(
                    stmt(`const node = (()=>{${reduce_function}})()`),
                    stmt("const v = env.lex.tx;")
                );

                statements.push(statement);

                if (previous_state) {
                    //open up the goto for the next state

                    //  if (!previous_state) console.log({ non_prev: state });
                    //
                    //  console.log(previous_state, item);

                    const goto_state = previous_state.maps.get(production.id) ?? [];

                    for (const goto of goto_state) {

                        if (goto == 1) {
                            block.push(
                                stmt(`return node`),
                            );
                        } else {
                            block.push(...createInlineParse(states[goto], states, grammar, previous_state, depth + 1, sym.val));

                        }
                    }

                    //   console.log({ goto_state });
                }
            }
        }




        for (const [key, value] of getShiftStates(state)) {

            if (forced_sym && key !== forced_sym) continue;
            // State starts transition, this continues until at end state. 
            // collapse on end state and return

            //Turns transition into a 
            //get proceeding symbol

            // /console.log({ key, value }, state);

            const
                new_state = states[value],
                item = new_state.items[0].decrement(),
                sym = item.sym(grammar),
                production = item.getProduction(grammar),
                statement = extendAll(stmt(`if(${getLexComparisonString(sym, grammar)}, ${state.index}){ state=${value};}`)),
                block = statement.nodes[1].nodes;

            statements.push(statement);
            // if stmt => [1] block => [0]


            //if the statement contains any reduce watch for that first.


            //Always consume token;
            block.push(
                stmt("const v = env.lex.tx;"),
                stmt("env.lex.next();"),
            );




            block.push(...createInlineParse(new_state, states, grammar, state, depth + 1));
        }
    }

    return statements;
}

/** UTILS */
function getCompletedItems(state: State) {
    return state.items.filter(e => e.atEND);
}

function getShiftStates(state: State): [string | number, number[]][] {
    return [...state.maps.entries()].filter(([k, v]) => typeof k == "string");//.map(([k, v]) => v);
}

function getNonTerminalTransitionStates(state: State): [string | number, number[]][] {
    return [...state.maps.entries()].filter(([k, v]) => typeof k == "number");//.map(([k, v]) => v);;
}


function getStatesFromNumericArray(value: number[], states: State[]) {
    return value.map(i => states[i]);
}
/**
 * NEED function to handle the reduction of a string of transitions
 * into one set of statements. ?
 */