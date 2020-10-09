import { Grammar, SymbolType, Symbol } from "../types/grammar.js";
import { processClosure, Item, FIRST } from "../util/common.js";
import { Lexer } from "@candlefw/wind";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { CompilerErrorStore } from "../lr/state_generation/compiler_error_store.js";
import { stmt, renderWithFormatting, extendAll, JSNode, JSNodeType } from "@candlefw/js";
import { ItemIndex } from "../util/item.js";
import { k, u, e, P } from "@candlefw/wind/build/types/ascii_code_points";
import { renderCompressed } from "@candlefw/conflagrate";
import { Array } from "./array";



Array.prototype.groupMap = function <T>(this: Array<T>, fn: (T) => (string | number)[]): Map<(string | number), T[]> {

    const groups: Map<number | string, T[]> = new Map;

    this.forEach(e => {
        const id = fn(e);

        for (const ident of Array.isArray(id) && id || [id]) {
            if (!groups.has(ident))
                groups.set(ident, []);
            groups.get(ident).push(e);
        }
    });

    return groups;
};
/**
 * Filters all items based on whether a certain value is contained within a set or not
 */
Array.prototype.setFilter = function <T>(this: Array<T>, fn: (T) => (string | number)[]): Map<(string | number), T[]> {

    const set = new Set;

    return this.filter(i => {
        const id = fn(i);

        if (set.has(id)) return false;
        set.add(id);
        return true;
    });
};

//@ts-ignore
Array.prototype.group = function <T>(this: Array<T>, fn: (T) => (string | number)[]): T[][] {
    return [...this.groupMap(fn).values()];
};

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

export function CompileLL(grammar: Grammar, env: GrammarParserEnvironment) {

    console.log("A");

    const error = new CompilerErrorStore;

    const production = grammar.map(p => {

        const start_items = p.bodies.map(b => new Item(b.id, b.length, 0, { val: "$eof", precedence: 0, type: SymbolType.GENERATED, pos: new Lexer }));

        function buildTransition(groups: Item[][][], state_depth: number = 0) {

            const stmts = [], shifts = [], reduces = [];


            for (const transition_group of groups) {

                //Top Most item is the transition item
                const first_group = transition_group[0],
                    first_item = first_group[0];

                console.log(first_item);

                //This item is always a single terminal ????????????????????????????????????????????????????????????????
                const if_statement = stmt(`if(${getLexComparisonString(first_item.sym(grammar), grammar)}){  }`);
                const block = if_statement.nodes[1].nodes;
                //Push the token on to the stack
                block.push(stmt("sym.push(lex.tx);"));
                block.push(stmt("advanceToken(lex);"));

                for (const intermediate_items of transition_group.slice(1)) {
                    //This item will need to be advanced and integrated into the block.

                }

                //Do the completion for the item.
                const reduce_function = first_item.body_(grammar)?.reduce_function?.txt;
                if (reduce_function) { block.push(stmt(`symd = [${createReduceFunction(reduce_function)}];`)); }
                else {
                };

                stmts.push(if_statement);


                for (const item of first_group.slice(1)) {
                    const reduce_function = item.body_(grammar)?.reduce_function?.txt;
                    if (reduce_function) { block.push(stmt(`symd = [${createReduceFunction(reduce_function)}];`)); }
                }

            }



            /*
            
                        //It's action determines what happens with the rest of the groups.
                        const sym = item.atEND ? item.follow : item.sym(grammar);
            
                        for (const transition_groups of groups) {
                            //Go through the rest of the groups and create transitions.
            
                            //Top
            
                            //The first transition of each group is the same;
                            const item: Item = transition_groups[0][0],
                                new_groups = transition_groups.map(g => g.slice(1)).filter(g => g.length > 0).group(e => e[0].id).reverse().sort((a, b) => (b[0].atEND | 0) - (a[0].atEND | 0)),
                                sym = item.atEND ? item.follow : item.sym(grammar);
            
                            let statement;
            
            
                            if (sym.type == "production") {
                                stmts.push(stmt(`"PROD ${item.renderUnformattedWithProduction(grammar)}"`));
            
                                statement = {
                                    type: JSNodeType.Script,
                                    nodes: [],
                                };
                                const
                                    block = statement.nodes;
            
            
            
                                if (state_depth > 0) {
            
                                    if (item.atEND) {
                                        shifts.push(stmt(`${"sym_end.push($" + (grammar[sym.val].name || "D")}(lex, sym))`));
                                    }
            
                                    shifts.push(stmt(`${"sym.push($" + (grammar[sym.val].name || "D")}(lex, sym))`));
            
                                }
            
                                const new_items = transition_groups.flatMap(_ => _).map(i => i.increment());
            
                                block.push(buildRecursiveDescent(new_items, state_depth));
            
                                stmts.push(statement);
            
                            } else {
                                if (item.atEND) {
                                    stmts.push(stmt(`"END ${item.renderUnformattedWithProduction(grammar)}"`));
            
                                    statement = {
                                        type: JSNodeType.Script,
                                        nodes: [],
                                    };
                                    const
                                        block = statement.nodes;
            
                                    if (state_depth == 0) {
                                        shifts.push(stmt(`${"sym.push($" + (item.getProduction(grammar).name || "D")}(lex, sym))`));
                                    } else {
                                        const reduce_function = item.body_(grammar)?.reduce_function?.txt;
            
                                        if (reduce_function)
                                            shifts.push(stmt(`sym = [${createReduceFunction(reduce_function)}];`));
                                        else { };
                                    }
            
                                    if (new_groups.length > 0)
                                        reduces.push(...buildTransition(new_groups, state_depth, state, states));
            
                                    stmts.push(statement);
                                } else if (sym.val) {
                                    stmts.push(stmt(`"VAL ${item.renderUnformattedWithProduction(grammar)}"`));
            
                                    statement = stmt(`if(${getLexComparisonString(sym)}){  }`);
            
                                    const   block = statement.nodes[1].nodes;
            
                                    if (state_depth > 0) {
            
                                        const reduce_function = item.body_(grammar)?.reduce_function?.txt;
            
                                        console.log(reduce_function, item.renderUnformattedWithProduction(grammar));
            
                                        if (reduce_function) {
            
                                            //shifts.push(stmt(`symd = [${createReduceFunction(reduce_function)}];`));
                                        }
                                        else { };
            
                                        block.push(stmt(`symd.push(advance_lex(lex))`));
                                    }
            
                                    const new_items = transition_groups.flatMap(_ => _).map(i => i.increment());
            
                                    block.push(buildRecursiveDescent(new_items, state_depth));
            
                                    stmts.push(statement);
                                }
            
                                if (!item.atEND && item.increment().atEND) {
                                    reduces.push(stmt("return sym.pop()"));
                                }
                            }
            
            
                            // /console.log({ l: new_groups.map(i => i.map(i => i.map(i => i.renderUnformattedWithProductionAndFollow(grammar)))) });
                        }
            
                        if (groups.length == 1 && groups[0].length == 1 && groups[0][0].length == 1 && state_depth > 0) {
                            //   /  console.log({ l: groups.map(i => i.map(i => i.map(i => i.renderUnformattedWithProductionAndFollow(grammar)))) });
                            reduces.push(stmt("return sym.pop()"));
                        }
                        */

            return [...stmts, ...shifts, ...reduces];


        }

        function buildRecursiveDescent(items: Item[], state_depth: number = 0) {

            let statement, block;

            statement = {
                type: JSNodeType.Script,
                nodes: [],
            };
            block = statement.nodes;




            //sort items

            const groups = items
                .sort((a, b) => a.body - b.body)
                .sort((a, b) => a.len - b.len)
                .sort((a, b) => a.getProduction(grammar).id == b.sym(grammar)?.val ? 1 : b.getProduction(grammar).id == a.sym(grammar)?.val ? -1 : 0)
                .reverse()
                .setFilter(e => e.id)
                //Sort items into groups based on the FIRST terminal 
                .group(e => FIRST(grammar, (<Item>e).sym(grammar)).map(s => s.val))
                //Append to the end of the productions the 
                .map(e => e.map((e, i, a) => {
                    let p = (<Item>e).getProduction(grammar).id;
                    let arr = [e];

                    outer:
                    while (true) {

                        for (const i of (<Item[]>a)) {
                            if (i.len == 1) {
                                const sym = i.sym(grammar);
                                if (sym.type == "production" && sym.val == p) {
                                    arr.push(i.increment());
                                    p = i.getProduction(grammar).id;
                                    continue outer;
                                }
                            }
                        }
                        break;
                    }
                    return arr;
                })
                    //Get rid of trailing 1 len productions.
                    //.filter((a, i) => i == 0 || a[0].len > 1)
                );
            //.group(e => e[0].id);

            /** Result
             *  Transitions [
             *      Transitions on id [
             *      ]
             *      Transitions on num [
             *         First completion [] -> Second completed 1 len -> ...
             *      ]
             * 
             *  ]
             */

            console.log(groups.map(
                i => i.map(
                    //i => i.map(
                    i => i.map(i => i.renderUnformattedWithProductionAndFollow(grammar, state_depth))
                    //  )
                )
            ));

            console.log(groups.map((i => i.map(i => i.map(i => i.renderUnformattedWithProductionAndFollow(grammar, state_depth))))));

            block.push(...buildTransition(groups));

            return statement;
        }

        processClosure(start_items, grammar, error, []);

        console.log(`$${p.name}(){ \n const sym = []; \n${renderWithFormatting(buildRecursiveDescent(start_items))}}`);

        return null;
    });
}

export function CompileHybrid(grammar: Grammar, env: GrammarParserEnvironment) {

    CompileLL(grammar, env);

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
            const fn = stmt(`function State${state.index}(env,s = [], p = -1){env.states.push(${state.index}); ;}`);
            const fn_id = fn.nodes[0];
            const fn_body_nodes = fn.nodes[2].nodes;
            fn_body_nodes.pop(); //get rid of empty statement

            id_nodes[state.index].push(fn_id);
            functions[state.index] = fn;


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

        //        const id_name = state?.items?.[0]?.renderWithProductionAndFollow(grammar) ?? "$0"; 
        const id_name = "$" + (i || "start"); // + `[${i}]`;

        for (const id of ids)
            id.value = `${id_name}`;
    }


    const parser = stmt(`return function(lexer){
        const states = [];
        const val = $start({lex:lexer, states}).v;
        return val;
    }`);


    parser.nodes[0].nodes[2].nodes.unshift(...functions);

    const string = renderWithFormatting(parser);
    //console.log(string);

    //return () => string;;;
    return Function(string)();
}

function gotoState(
    state: State,
    previous: State,
    states: State[],
    grammar: Grammar,
    ids: JSNode[][]) {

    const statements = [], gt = getNonTerminalTransitionStates(state), gt_set = new Set;

    if (gt.length > 0) {



        const married_gotos = gt.filter(([k, v]) => v.length == 1)
            .map(([k, v]) => <[number, State]>[k, states[v[0]]])
            .filter(([, v]) => (v).PURE && v.CONTAINS_ONLY_COMPLETE)
            .sort(([, a], [, b]) => {
                const pA = getAllProductionIds(a, grammar)[0];
                const pB = getAllProductionIds(b, grammar)[0];

                return pA < pB ? 1 : pB < pA ? -1 : 0;
            }).map(a => {
                gt_set.add(a[1].index);
                return a;
            }).reduce((r, a) => {
                const last = r.length - 1;

                if (r[last]) {
                    const l_last = r[last].length - 1;

                    const p_state = r[last][l_last];

                    if (getAllProductionIds(p_state, grammar)[0] == a[0]) {
                        r[last].push(a[1]);
                        return r;
                    }
                }

                r.push([a[1]]);

                return r;
            }, [])
            .filter(e => e.length > 1)
            .map(e => (e.map(a => (gt_set.add(a), a)), e));

        // /console.log(married_gotos);

        //sort goto in order
        const while_block = stmt(`while(true){ }`);
        const while_block_fn = while_block.nodes[1].nodes;

        //const while_block = stmt(`{ }`);
        //const while_block_fn = while_block.nodes;

        statements.push(while_block);;

        let chain = null;
        /*
        for (const married_goto of married_gotos) {
            const statement = stmt(`if(p == ${getAllProductionIds(married_goto[0], grammar)[0]}){ }`);
            const block = statement.nodes[1].nodes;
 
            if (chain) {
                chain.nodes[2] = statement;
                chain = statement;
            } else {
                chain = statement;
                while_block_fn.push(statement);
            }
 
            for (const state of married_goto) {
 
                const { stmts, productions, bodies } = integrateState(state, grammar, ids);
 
                block.push({
                    type: JSNodeType.BlockStatement,
                    nodes: stmts
                });
            }
        }*/

        for (const [key, val] of gt.sort(([a], [b]) => a < b ? 1 : b < a ? -1 : 0)) {

            const statement = stmt(`if(p == ${key}){ }`);
            const block = statement.nodes[1].nodes;

            for (const state of val.map(i => states[i])) {
                //   if (gt_set.has(state)) continue;

                const { stmts, productions, bodies } = integrateState(state, grammar, ids);

                block.push(...stmts);
            }

            if (block.length == 0) continue;

            //if (chain) {
            //    chain.nodes[2] = statement;
            //    chain = statement;
            //} else {
            chain = statement;
            while_block_fn.push(statement);
            // }
        }

        const tests = [...new Set(state.items.map(i => getLexPeekComparisonString(i.follow, grammar))).values()];
        // console.log(tests, state.items);
        let def;
        if (tests.length == 0)
            def = stmt(`if(env.lex.END) return {p, v:s}`);
        else
            def = stmt(`if(${(tests.join("||"))}) return {p, v:s}`);

        while_block_fn.push(def);

    }

    return statements;
}

function shiftState(
    state: State,
    previous: State,
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
            const all_productions = getAllProductionIds(state, grammar);
            const statement = extendAll(stmt(`if(${getLexComparisonString(sym, grammar)}){ }`));
            statements.push(statement);
            const block = statement.nodes[1].nodes;

            block.push(stmt("s.push(env.lex.tx), env.lex.next();"));

            const { stmts, productions, bodies } = integrateState(shift_to_state, grammar, ids);
            block.push(...stmts);
            block.push(...gotoState(state, state, states, grammar, ids));
            block.push(stmt("return {p, v:s}"));
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

        const reduce_function = body?.reduce_function?.txt;

        statements.push(statement);

        if (previous) {
            //REturn node if there is ?
            if (reduce_function) {
                block.push(stmt(`const HAVE_FUNCT = true;`));

                block.push(stmt(`return {p:${production.id}, v:(s.splice(-${item.len}, ${item.len}, s[s.length-1]), s), type:"reduce"};`));
            } else {
                block.push(stmt(`return {p:${production.id}, v:(s.splice(-${item.len}, ${item.len}, s[s.length-1]), s), type:"reduce"};`));
            }

        } else {

            if (reduce_function) {
                block.push(stmt(`const sym = s.slice(-${item.len});`));
                // block.push(stmt(`console.log("B",{sym}, ${createReduceFunction(reduce_function)},  ${state.index})`));
                block.push(stmt(`s.splice(-${item.len}, ${item.len}, ${createReduceFunction(reduce_function)})`));
                // block.push(stmt(`console.log("B",{sym}, ${state.index})`));
                block.push(stmt(`return {p:${production.id}, v:s, type:"reduce"};`));
            } else {
                block.push(stmt(`return {p:${production.id}, v:(s.splice(-${item.len}, ${item.len}, s[s.length-1]), s), type:"reduce"};`));
            }
        }
    }


    statements.push(...shiftState(state, null, states, grammar, ids));

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

    const goto_stmt = stmt(`const { p:pval, v:val } = State${state.index}(env,s)`);

    const goto_id = goto_stmt.nodes[0].nodes[1].nodes[0];

    id_nodes[state.index].push(goto_id);

    return {
        stmts: [goto_stmt, stmt(`s = val, p = pval;`)],
        //The productions that the transition should reduce to eventually
        productions: state.items.map(i => i.getProduction(grammar).id).filter((g, i, a) => a.indexOf(g) == i),

        bodies: state.items.map(i => i.body)
    };
    //}
}
/** UTILS */

function isStatePurelyCompressible(state: State) {
    return state.PURE && state.HAS_COMPLETED_PRODUCTION && state.CONTAINS_ONLY_COMPLETE;
}

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
function createReduceFunction(node_str: string): string {
    const statement = extendAll(stmt(node_str));

    if (statement.type == JSNodeType.ReturnStatement) {
        return `${renderWithFormatting(statement.nodes[0])}`;
    }

    return `null`;
}

function getAllProductionIds(state: State, grammar: Grammar): number[] {
    return [...new Set(state.items.map(m => m.getProduction(grammar).id)).values()];
}