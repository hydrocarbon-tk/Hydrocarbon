import { Grammar, SymbolType, Symbol } from "../types/grammar.js";
import { processClosure, Item, FIRST, getDerivedItems } from "../util/common.js";
import { Lexer } from "@candlefw/wind";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { CompilerErrorStore } from "../lr/state_generation/compiler_error_store.js";
import { stmt, renderWithFormatting, extendAll, JSNode, JSNodeType } from "@candlefw/js";
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

export function CompileLLHybrid(grammar: Grammar, env: GrammarParserEnvironment) {

    const error = new CompilerErrorStore;

    const production_fns = grammar.map(p => {

        const fn = stmt(`function $${p.name}(lex){const sym = [];}`);

        const body = fn.nodes[2].nodes;

        const start_items = p.bodies.map((b, i) => ({ index: b.id, off: 0, len: b.length, item: new Item(b.id, b.length, 0, { val: "$eof", precedence: 0, type: SymbolType.GENERATED, pos: new Lexer }) }));

        const ItemGraph = { sym: null, groups: [] };


        function addToMappedArray<T>(map: Map<any, T[]>, id: string | number, obj: T) {
            if (!map.has(id))
                map.set(id, []);
            map.get(id).push(obj);
        }

        function renderGraph(items: { index: number, item: Item; }[], trs = new Map) {
            let obs = new Map();

            for (const obj of items) {
                const { index, item } = obj;

                if (!item.atEND) {
                    const sym = item.sym(grammar);
                    if (sym.type == "production") {
                        // The item needs to go 
                        addToMappedArray(obs, sym.val, obj);
                    } else {
                        // 
                        addToMappedArray(trs, sym.val, obj);
                    }
                } else
                    addToMappedArray(trs, item.follow.val, obj);
            }

            if (obs.size > 0) {
                const items = [];
                for (const [key, vals] of obs.entries()) {
                    for (const val of vals) {
                        for (const item of getDerivedItems([val.item], grammar, error)) {
                            //get the val's next order closure;
                            items.push({
                                index: val.index,
                                off: val.off,
                                len: val.len,
                                item
                            });
                        }
                    }
                }
                renderGraph(items, trs);
            } else {// No conflicts, add the production to the last entry
                for (const [key, vals] of obs.entries())
                    trs.set(key, vals);
            }

            return trs;
        }

        const trs = renderGraph(start_items);

        function renderItem(item: Item): JSNode[] {
            const stmts = [];

            while (true) {
                if (item.atEND) {
                    const body = item.body_(grammar);
                    const reduce_function = body?.reduce_function?.txt;

                    if (reduce_function) {
                        stmts.push(stmt(`return (${createReduceFunction(reduce_function)});`));
                    } else
                        stmts.push(stmt(`return (sym.pop())`));

                    break;
                } else {
                    const sym = item.sym(grammar);
                    if (sym.type == "production")
                        stmts.push(stmt(`sym.push($${grammar[sym.val].name}(lex))`));
                    else
                        stmts.push(stmt(`sym.push(assertAndAdvance(lex, ${getLexComparisonStringNoEnv(sym, grammar)}))`));
                }
                item = item.increment();
            }

            return stmts;
        }

        function renderVals(trs, depth = 0) {
            const stmts = [];

            let i = 0;

            for (const [key, vals] of trs.entries()) {

                const sym = vals[0].item.sym(grammar);

                let if_stmt = stmt(`if(${getLexComparisonStringNoEnv(sym, grammar)}){;}`),
                    if_body = if_stmt.nodes[1].nodes;

                stmts.push(if_stmt);

                //console.log({ key, val });
                // The first set of entries represent the general transition terms
                // That can be present. Any clashes with this items are resolved through
                // Peeking
                //If 

                if (vals.length > 0) {
                    //group the vals based on the follow. 
                    const groups = vals.group(i => i.item.follow.val);
                    let i = 0;

                    //the peeking groups
                    for (const group of groups) {
                        const follow = group[0].item.follow;
                        let if_stmt, peek_body;

                        if (i < groups.length - 1) {
                            let if_stmt = stmt(`if(${getLexComparisonStringPeekNoEnv(follow, grammar)}){;}`);
                            if_body.push(if_stmt);
                            peek_body = if_stmt.nodes[1].nodes;
                        } else {
                            peek_body = if_body;
                        }


                        if (group.length > 1) {

                        } else {
                            const v = group[0];
                            const item = new Item(v.index, v.len, v.off, { val: "$eof", precedence: 0, type: SymbolType.GENERATED, pos: new Lexer });
                            peek_body.push(...renderItem(item));
                        }
                        i++;
                    }

                    // console.log({ groups });
                    for (const val of vals) {

                    }
                }



                // 
                continue;
                if (typeof key == "number") {
                    //Default Path
                    const bodies = val.setFilter(i => i.index);
                    const items = bodies.map(b => new Item(b.index, b.len, b.off, b.item.follow));
                    const sym = items[0].atEND ? items[0].follow : items[0].sym(grammar);
                    stmts.push(stmt(`sym.push($${grammar[sym.val].name}(lex))`));

                    stmts.push(
                        ...renderVals(
                            renderGraph(items.filter(i => !i.atEND).map(i => {
                                const inc: Item = i.increment();
                                return { index: inc.body, off: inc.offset, len: inc.len, item: inc };
                            })
                            ), depth + 1
                        )
                    );
                } else {
                    const sym = val[0].item.atEND ? val[0].item.follow : val[0].item.sym(grammar);

                    const
                        if_stmt = stmt(`var c${depth} = lex.copy(); if(${getLexComparisonStringNoEnv(sym, grammar)}){}}catch(e){lex.sync(c${depth}); }`),
                        if_body = if_stmt.nodes[0].nodes[1].nodes[1].nodes,
                        bodies = val.setFilter(i => i.index),
                        items = bodies.map(b => new Item(b.index, b.len, b.off, b.item.follow)),
                        item: Item = items[0];

                    if (item.atEND) {
                        let end_body = if_body;

                        if (items.length > 1) {
                            let if_stmt = stmt(`if("${key}"){;}`);
                            end_body = if_stmt.nodes[1].nodes,
                                if_body.push(if_stmt);
                        }

                        const body = item.body_(grammar);
                        const production = item.getProduction(grammar);
                        const reduce_function = body?.reduce_function?.txt;


                        if (reduce_function) {
                            end_body.push(stmt(`return (${createReduceFunction(reduce_function)});`));
                        } else
                            end_body.push(stmt(`return (sym.pop())`));
                    } else {
                        const sym = item.sym(grammar);
                        if (sym.type == "production")
                            if_body.push(stmt(`sym.push($${grammar[sym.val].name}(lex))`));
                        else
                            if_body.push(stmt(`sym.push(assertAndAdvance(lex, ${getLexComparisonStringNoEnv(sym, grammar)}))`));
                    }

                    if_body.push(
                        ...renderVals(
                            renderGraph(items.filter(i => !i.atEND).map(i => {
                                const inc: Item = i.increment();
                                return { index: inc.body, off: inc.offset, len: inc.len, item: inc };
                            })
                            ), depth + 1
                        )
                    );

                    if (trs.size > 1 && i < trs.size - 1)
                        stmts.push(if_stmt);
                    else
                        stmts.push(...if_body);
                }

                i++;
            }

            return stmts;
        }

        body.push(...renderVals(trs));

        return renderWithFormatting(fn);
    });

    const parser = `

    function assertAndAdvance(lex, bool){
        const v = lex.tx;
        if(bool) lex.next();
        else lex.throw("Unexpected Token");
        return v;
    }
    ${production_fns.join("\n")};
    return function(lexer){
        const states = [];
        return $${grammar[0].name}(lexer);

    }`;

    //console.log(parser);

    return Function(parser)();;
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
function getLexComparisonStringNoEnv(sym: Symbol, grammar: Grammar): string {
    switch (sym.type) {
        case SymbolType.GENERATED:
            if (sym.val == "$eof")
                return `lex.END`;
            return `lex.ty == ${Lexer.types[sym.val]}`;
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `lex.tx == "${sym.val}"`;
        case SymbolType.END_OF_FILE:
            return `lex.END`;
        case SymbolType.EMPTY:
            return "true";
    }
}

function getLexComparisonStringPeekNoEnv(sym: Symbol, grammar: Grammar, pk_depth: number = 1): string {
    const pk = "pk.".repeat(pk_depth);
    switch (sym.type) {
        case SymbolType.GENERATED:
            if (sym.val == "$eof")
                return `lex.${pk}END`;
            return `lex.${pk}ty == ${Lexer.types[sym.val]}`;
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            return `lex.${pk}tx == "${sym.val}"`;
        case SymbolType.END_OF_FILE:
            return `lex.${pk}END`;
        case SymbolType.EMPTY:
            return "true";
    }
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