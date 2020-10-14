import { Grammar, Production, EOF_SYM, SymbolType } from "../types/grammar.js";
import { processClosure, Item, FOLLOW } from "../util/common.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { stmt, extendAll, JSNode, exp } from "@candlefw/js";
import {
    createReduceFunction,
    getNonTerminalTransitionStates,
    integrateState,
    getLexPeekComparisonString,
    getShiftStates,
    getStatesFromNumericArray,
    getLexComparisonString,
    getCompletedItems,
    translateSymbolValue
} from "./utilities.js";
import { State } from "./State";
import { Symbol } from "../../../build/types/types/grammar.js";
import { LLProductionFunction } from "./LLProductionFunction.js";
import { insertFunctions } from "./insertFunctions.js";
export interface States {
    states: State[];
    map: Map<string, State>;
}



//Integrates a LR state into existing set of states
export function IntegrateState(production: Production, states: States, grammar: Grammar, env: GrammarParserEnvironment, runner) {

    const start_state: State = {
        sym: "",
        sid: "",
        id: "",
        roots: [],
        maps: new Map,
        state_merge_tracking: new Set,
        index: 0,
        HAS_COMPLETED_PRODUCTION: false,
        PURE: true,
        TERMINAL_TRANSITION: false,
        CONTAINS_ONLY_COMPLETE: false,
        items: [],
        yields: new Set,
        origins: new Map,
        refs: 0,
        reachable: new Set,

    };

    CompileHybridLRStates(grammar, env, runner, production.id, states, start_state, [...FOLLOW(grammar, production.id).values()]);

    return start_state;
}

export function CompileHybridLRStates(
    grammar: Grammar,
    env: GrammarParserEnvironment,
    runner,
    production_index = 0,
    states: States = { map: new Map, states: [] },
    start_state: State = {
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
        roots: [],
        yields: new Set,
        origins: new Map,
        refs: 0,
        reachable: new Set,
    },
    follows: Symbol[] = [EOF_SYM]
): States {

    const unprocessed_state_items = [{
        old_state: start_state,
        items: createProductionItems(production_index, grammar, follows)
    }];

    unprocessed_state_items[0].old_state.items = unprocessed_state_items[0].items;

    /*
        Go through each item set ----
        Gather each item that transitions on a particular symbol; 
        This combinations represent whole groups that can transition 
        to a new state;
    */
    for (let i = 0; i < unprocessed_state_items.length; i++) {
        //console.log(states.map.size);

        const
            { items: to_process_items, old_state } = unprocessed_state_items[i],
            roots = new Set(to_process_items.map(i => i.getProduction(grammar).id));

        old_state.roots.push(...roots.values());

        to_process_items.filter(i => !i.atEND).forEach(i => {
            const sym = i.sym(grammar);

            if (sym.type == "production" && !roots.has(sym.val))
                old_state.yields.add(sym.val);
        });

        processClosure(to_process_items, grammar);

        [...to_process_items.reduce((groups, i) => {

            if (i.atEND) return groups;

            const
                sym = i.sym(grammar),
                val = sym.val + "";


            if (!groups.has(val)) groups.set(val, { sym: i.sym(grammar), items: [] });

            if (sym.type != "production") {
                old_state.origins.set(val, i.getProduction(grammar).id);
            }

            groups.get(val).items.push(i.increment());

            return groups;

        }, <Map<string, { sym: string, items: Item[]; }>>new Map()).values()]
            .map(values => processStateItems(values, grammar))
            .map(s => mergeState(s, states.map, old_state, unprocessed_state_items));
    }

    states.states = [...states.map.values()];

    return states;
}

function createProductionItems(production_index: number, grammar: Grammar, follows: Symbol[] = [EOF_SYM]) {
    return follows.flatMap(sym => grammar[production_index].bodies.map(
        b => new Item(
            b.id,
            b.length,
            0, sym
        )));
}

function processStateItems(item_set: { sym: string; items: Item[]; }, grammar): State {

    const id = item_set.items
        .map(i => i.id)
        .setFilter(i => i)
        .sort((a, b) => a < b ? -1 : 1).join(""),
        sid = item_set.items
            .map(i => i.full_id)
            .filter((e, i, a) => a.indexOf(e) == i)
            .sort((a, b) => a < b ? -1 : 1).join(":");

    //Out pops a new state. 
    return <State>{
        sym: item_set.sym.val,
        id,
        sid,
        bid: item_set.items.setFilter(i => i.id).map(i => i.renderUnformattedWithProduction(grammar)).join(" : "),
        roots: [],
        items: item_set.items,
        PURE: id.length == 4,
        TERMINAL_TRANSITION: item_set.sym.type !== "production",
        HAS_COMPLETED_PRODUCTION: item_set.items.some(i => i.atEND),
        CONTAINS_ONLY_COMPLETE: item_set.items.every(i => i.atEND),
        state_merge_tracking: new Set,
        index: 0,
        maps: new Map,
        yields: new Set,
        origins: new Map,
        refs: 0,
        reachable: new Set,
    };
}

function mergeState(
    state: State,
    states: Map<string, State>,
    old_state: State,
    unprocessed_state_items: { old_state: State; items: Item[]; }[]) {

    const { id, sid, sym } = state;

    if (!states.has(id)) {
        state.index = states.size;
        states.set(id, state);
    }

    if (!old_state.maps.has(sym))
        old_state.maps.set(sym, []);

    const
        active_state = states.get(id),
        transition_map = old_state.maps.get(sym);

    if (transition_map.indexOf(active_state.index) < 0)
        transition_map.push(active_state.index);

    states.set(id, active_state);

    if (!active_state.state_merge_tracking.has(sid)) {
        unprocessed_state_items.push({ old_state: state, items: state.items });
        active_state.state_merge_tracking.add(sid);
    }

    active_state.items.push(...state.items);

    const filter_set = new Set();

    active_state.items = active_state.items.filter(i => (!filter_set.has(i.full_id) && (filter_set.add(i.full_id), true)));

    return active_state;
}

function gotoState(
    /**  The state to reduce */
    state: State,
    /** List of all states */
    states: State[],
    /** The grammar for the states */
    grammar: Grammar,
    runner: any,
    /** List of id nodes referencing the name of a state function */
    ids: JSNode[][],
    /** Set of productions that can be generated by the shift segment */
    active_productions: Set<number | string>,

    existing_refs: Set<number>,

    HYBRID: boolean = false
) {

    const statements = [], gt = getNonTerminalTransitionStates(state), gt_set = new Set;

    if (gt.length > 0) {

        //sort goto in order
        const
            while_sw = stmt(`o: while(1) switch(e.p) { }`),
            while_sw_block = while_sw.nodes[1].nodes[1].nodes[1].nodes;

        statements.push(while_sw);

        for (const [key, val] of gt.sort(([a], [b]) => a < b ? 1 : b < a ? -1 : 0)) {

            if (!active_productions.has(key)) continue;

            const
                case_stmt = stmt(`switch(true) { case ${key}:  } `).nodes[1].nodes[0],
                clause = case_stmt.nodes;

            for (const st of val.map(i => states[i])) {

                state.reachable.add(st.index);

                const { stmts, productions } = integrateState(st, states, grammar, ids, existing_refs);

                productions.map(i => active_productions.add(i));

                clause.push(...stmts);

                clause.push(stmt("break;"));
            }

            if (clause.length == 1) continue;


            while_sw_block.push(case_stmt);
        }

        const tests = [...new Set(state.items.map(i => getLexPeekComparisonString(i.follow, grammar))).values()];


        const
            case_stmt = stmt(`switch(true) { default:  } `).nodes[1].nodes[0],
            clause = case_stmt.nodes;
        let def;

        //   if (tests.length == 0)
        //       def = stmt(`if(lex.END) break o;`);
        //   else
        //       def = stmt(`if(true||${(tests.join("||"))}) break o;`);

        clause.push(def);

        clause.push(stmt("break o;"));

        while_sw_block.push(case_stmt);
    }

    return runner.add_script(statements, stmt("function(lex, e, s){ return s}"), "s =", state);
}

function shiftState(
    /**  The state to reduce */
    state: State,
    /** List of all states */
    states: State[],
    /** The grammar for the states */
    grammar: Grammar,
    /** Compiler utility object */
    runner,
    /** List of id nodes referencing the name of a state function */
    ids: JSNode[][],
    /** Set of state indices that have been referenced */
    existing_refs: Set<number>,
    /** Optional List of LL recursive descent functions */
    ll_fns: LLProductionFunction[] = null,
    /** Indicates the state results from a transition from LL to LR*/
    HYBRID = false,
) {
    const runner_statements = [];

    //get yield states
    const yields = state.yields, yield_map = new Map, active_productions: Set<number | string> = new Set(state.roots);

    //get the closure for each yields then map the closure to a yield map 
    for (const y of yields.values()) {
        const items = createProductionItems(y, grammar);
        processClosure(items, grammar);
        for (const sym of items.map(i => i.sym(grammar)).filter(sym => sym.type != "production")) {
            yield_map.set(sym.val, y);
        }
    }

    const tx = [];
    const ty = [];
    const end = [];

    for (const [key, value] of getShiftStates(state)) {

        for (const shift_to_state of getStatesFromNumericArray(value, states)) {

            //Otherwise, see if it is PURE, and it's chain is also PURE without Shift-Reduce
            //conflicts.

            //Otherwise create function to transition to new state. 
            const
                item = shift_to_state.items[0].decrement(),
                sym = item.sym(grammar),
                case_stmt = stmt(`switch(true) { case ${translateSymbolValue(sym)}:  } `).nodes[1].nodes[0],
                clause = case_stmt.nodes,
                production = yield_map.get(sym.val);

            switch (sym.type) {
                case SymbolType.END_OF_FILE:
                case SymbolType.GENERATED:
                    if (sym.val == "$eof")
                        end.push(case_stmt);
                    ty.push(case_stmt); break;
                case SymbolType.LITERAL:
                case SymbolType.ESCAPED:
                case SymbolType.SYMBOL:
                    tx.push(case_stmt); break;
            }


            clause.push(...insertFunctions(item, grammar));

            //statements.push(case_stmt);

            if (ll_fns && ll_fns[production] && !ll_fns[production].L_RECURSION) {
                // If all items at the beginning and they all reduce to the same production then replace with a call
                // to that ll production IF the ll production is not recursive. 

                clause.push(stmt(`s.push($${grammar[production].name}(lex, e))`));

                clause.push(stmt(`e.p = ${production};`));

                clause.push(stmt(`break;`));

                active_productions.add(production);

                continue;
            }

            //Get skips from grammar - TODO get symbols from bodies / productions
            const skip_symbols = grammar.meta.ignore.flatMap(d => d.symbols);

            clause.push(stmt(`s.push(aaa(lex, e, e.eh, [${skip_symbols.map(translateSymbolValue).join(",")}]));`));

            state.reachable.add(shift_to_state.index);

            const { stmts, productions } = integrateState(shift_to_state, states, grammar, ids, existing_refs);

            productions.map(i => active_productions.add(i));

            clause.push(...stmts);

            clause.push(stmt(`break;`));
        }
    }

    let swtch = null;

    if (tx.length > 0) {

        swtch = stmt("switch(lex.tx){}");

        swtch.nodes[1].nodes = tx;

        if (ty.length > 0) {
            const sw_ty = stmt("switch(0){default: switch(lex.ty){ } }").nodes[1].nodes[0];
            sw_ty.nodes[0].nodes[1].nodes = ty;
            swtch.nodes[1].nodes.push(sw_ty);
        }
    } else if (ty.length > 0) {
        swtch = stmt("switch(lex.ty){}");
        swtch.nodes[1].nodes = ty;
    }

    if (end.length > 0) {
        const node = stmt("if(lex.END){}");
        node.nodes[1].nodes = end.map(n => n.nodes[1]);
        if (swtch)
            node.nodes[2] = swtch;
    } else if (swtch) {
        runner_statements.push(swtch);
    }

    return {
        statements: runner.add_script(runner_statements, stmt("function(lex, e, s){ return s}"), "s =", state),
        active_productions
    };
}

/**
 * Creates a reduce/goto chain
 */
function reduceState(
    /**  The state to reduce */
    state: State,
    /** List of all states */
    states: State[],
    /** The grammar for the states */
    grammar: Grammar,
): JSNode[] {

    const statements = [];

    for (const completed_items of getCompletedItems(state)) {

        //TODO turn into a switch statement

        // We reduce on the state, gather the production signatures
        // And proceed processing the next goto state. 
        // If the goto state is the goal state, then we just return. 

        const
            follow_syms = completed_items.map(i => i.follow),
            item = completed_items[0],
            production = item.getProduction(grammar),
            body = item.body_(grammar),
            sym_lookahead = follow_syms.map(sym => getLexPeekComparisonString(sym, grammar)).join("||"),
            statement = extendAll(stmt(`if(${sym_lookahead}){;}`)),
            block = statement.nodes[1].nodes;

        block.length = 0;

        const reduce_function = body?.reduce_function?.txt;

        statements.push(statement);

        if (reduce_function) {

            block.push(stmt(`const sym = s.slice(-${item.len});`));

            block.push(stmt(`s.splice(-${item.len}, ${item.len}, ${createReduceFunction(reduce_function)})`));

            block.push(stmt(`return (e.p = ${production.id}, s);`));
        } else {
            block.push(stmt(`return (e.p=${production.id}, (s.splice(-${item.len}, ${item.len}, s[s.length-1]), s));`));
        }
    }

    return statements;
}

function compileState(
    /**  The state to reduce */
    state: State,
    /** List of all states */
    states: State[],
    /** The grammar for the states */
    grammar: Grammar,
    runner,
    /** List of id nodes referencing the name of a state function */
    ids: JSNode[][],
    /** Optional List of LL recursive descent functions */
    ll_fns: LLProductionFunction[] = null,
    /** Indicates the state results from a transition from LL to LR*/
    HYBRID = false,
): JSNode[] {
    const
        existing_refs: Set<number> = new Set(),
        statements = [],
        //State should already be assumed to have reducible constructs
        { statements: shift_stmts, active_productions }
            = shiftState(state, states, grammar, runner, ids, existing_refs, ll_fns, HYBRID);

    statements.push(...shift_stmts);

    statements.push(...reduceState(state, states, grammar));

    statements.push(...gotoState(state, states, grammar, runner, ids, active_productions, existing_refs, HYBRID));

    return statements;
}

export function renderState(
    state: State,
    states: States,
    grammar: Grammar,
    runner,
    id_nodes: JSNode[][] = states.states.reduce(r => (r.push([]), r), []),
    ll_fns: LLProductionFunction[] = null,
    HYBRID = false
): JSNode {
    let str = [];

    for (const item of state.items)
        str.push(item.renderUnformattedWithProductionAndFollow(grammar).replace(/\"/, "\\\""));

    const
        //fn = stmt(`function ${state.name ? state.name : "State" + state.index}(lex, e, s = []){\`${state.bid}\`;e.p=-1;}`),
        fn = stmt(`function ${state.name ? state.name : "State" + state.index}(lex, e, s = []){e.p=-1;}`),
        fn_id = fn.nodes[0],
        fn_body_nodes = fn.nodes[2].nodes;

    //fn_body_nodes.pop(); //get rid of empty statement
    id_nodes[state.index].push(fn_id);
    //compileState(state, states.states, grammar, id_nodes, ll_fns, HYBRID);
    fn_body_nodes.push(...compileState(state, states.states, grammar, runner, id_nodes, ll_fns, HYBRID));


    if (HYBRID)
        fn_body_nodes.push(stmt(`return s.pop();`));
    else
        fn_body_nodes.push(stmt(`return s;`));
    //fn_body_nodes.push(
    //    stmt(`lex.throw("could not continue parse at state ${state.index}");`)
    //);

    return fn;
}

export function markReachable(states: States, ...root_states: State[]) {

    const pending = root_states, reached = new Set;

    for (let i = 0; i < pending.length; i++) {

        const state = pending[i];

        reached.add(state.index);

        state.REACHABLE = true;

        for (const refs of state.maps.values()) {
            for (const sc of getStatesFromNumericArray(refs, states.states)) {
                if (!reached.has(sc.index)) {
                    pending.push(sc);
                }
            }
        }
    }
}


export function renderStates(
    root_states: State[],
    states: States,
    grammar: Grammar,
    runner,
    id_nodes: JSNode[][] = states.states.reduce(r => (r.push([]), r), []),
    ll_fns: LLProductionFunction[] = null,
    HYBRID = false
): JSNode[] {

    const
        state_array = states.states.concat(root_states),
        out_functions = root_states.map(s => renderState(s, states, grammar, runner, id_nodes, ll_fns, HYBRID)),
        general_fn = states.states.map(s => renderState(s, states, grammar, runner, id_nodes, ll_fns, false)),
        pending = root_states, reached = new Set;

    for (let i = 0; i < pending.length; i++) {

        const state = pending[i];

        reached.add(state.index);

        state.REACHABLE = true;

        for (const sc of getStatesFromNumericArray([...state.reachable.values()], states.states)) {
            if (!reached.has(sc.index)) {
                pending.push(sc);
            }
        }
    }

    for (let i = 0; i < states.states.length; i++) {

        const
            ids = id_nodes[i],
            state = state_array[i],
            fn = general_fn[i],
            id_name = "$" + (i || "start");

        if (state.REACHABLE) {
            for (const id of ids) id.value = `${id_name}`;
            out_functions.push(fn);
        }
    }

    return out_functions;
}