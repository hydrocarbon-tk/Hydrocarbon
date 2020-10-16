import { Grammar, SymbolType } from "../types/grammar.js";
import { processClosure, Item } from "../util/common.js";
import { stmt, JSNode } from "@candlefw/js";
import {
    createReduceFunction,
    getLexPeekComparisonString,
    getShiftStates,
    getStatesFromNumericArray,
    getCompletedItems,
    translateSymbolValue,
    getNonTerminalTransitionStates,
    integrateState
} from "./utilities.js";
import { State } from "./State";
import { LLProductionFunction } from "./LLProductionFunction.js";
import { insertFunctions } from "./insertFunctions.js";
import { createProductionItems, States } from "./lr_hybrid.js";
import { CompilerRunner } from "./CompilerRunner.js";

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
        const accepting_productions = state.items.map(i => i.getProduction(grammar).id).setFilter();

        //sort goto in order
        statements.push(stmt("let accept =-1;"));
        const
            while_sw = stmt(`o: while(1){ if(sp > e.sp) break; else e.sp++; switch(e.p) { } }`),
            while_block = while_sw.nodes[1].nodes[1].nodes,
            while_sw_block = while_block[1].nodes[1].nodes;
        statements.push(while_sw);

        for (const [key, val] of gt.sort(([a], [b]) => a < b ? 1 : b < a ? -1 : 0)) {

            const
                case_stmt = stmt(`switch(true) { case ${key}:  } `).nodes[1].nodes[0],
                clause = case_stmt.nodes;

            let i = 0;
            for (const st of val.map(i => states[i])) {

                if (i++ > 0) {
                    state.reachable.add(st.index);

                    const node = stmt("if(e.p < 0)");

                    const { stmts, productions } = integrateState(st, states, grammar, ids, existing_refs, "s", state);

                    productions.map(i => active_productions.add(i));

                    node.nodes[1] = stmts[0];

                    clause.push(node);
                } else {

                    state.reachable.add(st.index);

                    const { stmts, productions } = integrateState(st, states, grammar, ids, existing_refs, "s", state);

                    productions.map(i => active_productions.add(i));

                    clause.push(...stmts);
                }
            }

            clause.push(stmt(` break ;`));

            if (clause.length == 1) continue;

            while_sw_block.push(case_stmt);
        }

        while_block.push(stmt(`if(e.p >= 0) accept = e.p;`));

        const
            case_stmt = stmt(`switch(true) { default:  } `).nodes[1].nodes[0],
            clause = case_stmt.nodes,
            tests = [...new Set(state.items.map(i => getLexPeekComparisonString(i.follow))).values()],
            def = stmt(`if(s.length-start > 1)progress = true; `);

        //  clause.push(def);
        clause.push(stmt("break o;"));
        while_sw_block.push(case_stmt);
        statements.push(stmt(`if(sp <= e.sp) e.p = accept;`));
        statements.push(stmt(`if(![${accepting_productions.join(",")}].includes(accept))fail(lex,e);`));
        //  statements.push(stmt(`console.log( {st:"State ${state.name || state.index}",s_sp:sp, c_sp:e.sp, accept, tx:lex.slice(), end:lex.END, s, ep: e.p,ac:[${accepting_productions}]})`));
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
    HYBRID = false) {
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

        const shift_groups = getStatesFromNumericArray(value, states).sort((a, b) => {
            const len_a = a.items[0].len, len_b = b.items[0].len;
            return (len_b - len_a);
        });
        //for (const shift_to_state of getStatesFromNumericArray(value, states)) {


        const
            item = shift_groups[0].items[0].decrement(),
            sym = item.sym(grammar),
            case_stmt = stmt(`switch(true) { case ${translateSymbolValue(sym)}:  } `).nodes[1].nodes[0],
            clause = case_stmt.nodes;
        //groups = shift_to_state.items.group(i => i.getProduction(grammar).id).sort((a, b) => {
        //    const len_a = a[0].len, len_b = b[0].len;
        //    return len_b - len_a;
        //});

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

        const TRY_GROUP = shift_groups.length > 1;

        let i = 0;

        for (const shift_state of shift_groups) {

            let lex_name = "lex", pending_data_name = "_s", pdn = pending_data_name;



            const item: Item = shift_state.items[0],
                GROUP_NOT_LAST = i < shift_groups.length - 1,
                FIRST_GROUP = i == 0,
                production = item.getProduction(grammar).id;

            i++;

            if (GROUP_NOT_LAST) {
                if (FIRST_GROUP) { clause.push(stmt(`var cp = lex.copy(), ${pdn} = null;`)); lex_name = 'cp'; }
                else { clause.push(stmt("cp = lex.copy()")); lex_name = 'cp'; };
            }

            if (runner.ANNOTATED)
                if (TRY_GROUP) {
                    if (FIRST_GROUP)
                        clause.push(runner.createAnnotationJSNode(
                            `LR-SHIFT-ATTEMPT:\${sp}:${i}`, grammar, ...shift_state.items))
                    else
                        clause.push(runner.createAnnotationJSNode(
                            `LR-SHIFT-NEXT-ATTEMPT:\${sp}:${i}`, grammar, ...shift_state.items))
                } else
                    clause.push(runner.createAnnotationJSNode("LR-SHIFT", grammar, ...shift_state.items.map(i => i.decrement())))


            clause.push(...insertFunctions(item, grammar));

            if (ll_fns && ll_fns[production] && !ll_fns[production].L_RECURSION) {


                if (GROUP_NOT_LAST) {
                    clause.push(stmt(`${pdn} = s.slice()`));
                    clause.push(stmt(`${pdn}.push($${grammar[production].name}(${lex_name}, e))`));
                } else
                    clause.push(stmt(`s.push($${grammar[production].name}(${lex_name}, e))`));

                clause.push(stmt(`e.p = (e.FAILED) ? -1 : ${production};`));

                // active_productions.add(production);

            }
            else {

                const skip_symbols = grammar.meta.ignore.flatMap(d => d.symbols);

                let shift_state_stmt;

                clause.push(stmt(`e.sp++`));

                if (GROUP_NOT_LAST) {
                    clause.push(stmt(`${pdn} = s.slice()`));
                    clause.push(stmt(`${pdn}.push(_(${lex_name}, e, e.eh, [${skip_symbols.map(translateSymbolValue).join(",")}]));`));
                    shift_state_stmt = stmt(`${pdn} = State${shift_state.index}(${lex_name}, e, ${pdn})`);
                }
                else {
                    clause.push(stmt(`s.push(_(${lex_name}, e, e.eh, [${skip_symbols.map(translateSymbolValue).join(",")}]));`));
                    shift_state_stmt = stmt(`s = State${shift_state.index}(lex, e, s)`);
                }

                clause.push(shift_state_stmt);

                ids[shift_state.index].push(shift_state_stmt.nodes[0].nodes[1].nodes[0]);

                state.reachable.add(shift_state.index);

                //[...state.origins.values()].flatMap(_ => _).forEach(i => active_productions.add(i));
            }

            if (TRY_GROUP && GROUP_NOT_LAST) {
                clause.push(stmt(`if(e.p !== ${production}){
                        e.FAILED = false;
                        e.sp = sp;
                        
                    }else{
                        s = ${pdn};
                        lex.sync(cp);
                        break;
                    }`));
            }
            else {
                clause.push(stmt(`break;`));
            }
        }
        //  }
    }

    let swtch = null;

    if (tx.length > 0) {

        swtch = stmt("switch(lex.tx){}");

        swtch.nodes[1].nodes = tx;

        if (ty.length > 0) {
            const sw_ty = stmt("switch(0){default: switch(lex.ty){  } }").nodes[1].nodes[0];
            // const sw_ty = stmt("switch(0){default: switch(lex.ty){ default: e.FAILED = true; } }").nodes[1].nodes[0];
            sw_ty.nodes[0].nodes[1].nodes.unshift(...ty);
            swtch.nodes[1].nodes.push(sw_ty);
        }
        else {
            const default_error = stmt(`switch(true) { default:  e.FAILED = true;  } `).nodes[1].nodes[0];
            // swtch.nodes[1].nodes.push(default_error);
        }
    }
    else if (ty.length > 0) {
        swtch = stmt("switch(lex.ty){}");
        swtch.nodes[1].nodes = ty;
    }

    if (end.length > 0) {
        const node = stmt("if(lex.END){}");
        node.nodes[1].nodes = end.map(n => n.nodes[1]);
        if (swtch)
            node.nodes[2] = swtch;
    }
    else if (swtch) {
        runner_statements.push(swtch);
    }

    return {
        statements: runner.add_script(runner_statements, stmt("function(lex, e, s, sp){ return s}"), "s =", state),
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
    runner: CompilerRunner
): JSNode[] {

    const statements = [];

    let ADDED_VAR = false;

    for (const completed_items of getCompletedItems(state)) {
        if (!ADDED_VAR) {
            ADDED_VAR = true;
            statements.push(stmt(`var $;`));
        }
        //TODO turn into a switch statement
        // We reduce on the state, gather the production signatures
        // And proceed processing the next goto state. 
        // If the goto state is the goal state, then we just return. 
        const
            follow_syms = completed_items.map(i => i.follow),
            item = completed_items[0],
            production = item.getProduction(grammar),
            body = item.body_(grammar),
            sym_lookahead = follow_syms.map(sym => getLexPeekComparisonString(sym)).join("||"),
            statement = stmt(`if($){;}`),
            block = statement.nodes[1].nodes;

        block.length = 0;

        if (runner.ANNOTATED)
            block.push(runner.createAnnotationJSNode("LR-REDUCE", grammar, ...completed_items))


        const bool_statement = stmt(`$ = (${sym_lookahead})`);

        statements.push(...runner.add_script([bool_statement], stmt("function(lex){ return $ }"), "$ =", state));

        const reduce_function = body?.reduce_function?.txt;

        statements.push(statement);

        block.push(stmt(`e.sp -= ${item.len} `));

        if (reduce_function) {

            block.push(stmt(`const sym = s.slice(-${item.len});`));

            block.push(stmt(`s.splice(-${item.len}, ${item.len}, ${createReduceFunction(reduce_function)})`));

            block.push(stmt(`return (e.p = ${production.id}, s);`));
        }
        else {
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
    HYBRID = false): JSNode[] {
    const
        existing_refs: Set<number> = new Set(),
        statements = [],
        //State should already be assumed to have reducible constructs
        { statements: shift_stmts, active_productions } = shiftState(state, states, grammar, runner, ids, existing_refs, ll_fns, HYBRID),
        goto_statements = gotoState(state, states, grammar, runner, ids, active_productions, existing_refs, HYBRID),
        reduce_statments = reduceState(state, states, grammar, runner);

    //if the previous state is a production
    // if (typeof state.sym == "number")
    //     statements.push(stmt(`e.p = ${state.sym};`));
    // else

    if (goto_statements.length > 0)
        statements.push(stmt("const sp = e.sp;"));

    // if (reduce_statments.length > 0)
    statements.push(stmt("e.p = -1;"));

    // statements.push(stmt(`console.log({state_start:"${state.name || state.index}", tx:lex.slice(), s})`))
    //  statements.push(stmt(`console.log({st:"${state.name || state.index}", s:s.length});`));
    statements.push(...shift_stmts);
    statements.push(...reduce_statments);
    statements.push(...goto_statements);

    return statements;
}

export function renderState(
    state: State,
    states: States,
    grammar: Grammar,
    runner: CompilerRunner,
    id_nodes: JSNode[][] = states.states.reduce(r => (r.push([]), r), []),
    ll_fns: LLProductionFunction[] = null,
    HYBRID = false
): JSNode {


    let str = [];

    for (const item of state.items)
        str.push(item.renderUnformattedWithProductionAndFollow(grammar).replace(/\"/, "\\\""));

    const
        //fn = stmt(`function ${state.name ? state.name : "State" + state.index}(lex, e, s = [], st){\`${state.bid}\`;}`),
        fn = stmt(`function ${state.name ? state.name : "State" + state.index}(lex, e, s = []){;}`),
        fn_id = fn.nodes[0],
        fn_body_nodes = fn.nodes[2].nodes;

    fn_body_nodes.pop();

    if (!state.name)

        id_nodes[state.index].push(fn_id);

    fn_body_nodes.push(...compileState(state, states.states, grammar, runner, id_nodes, ll_fns, HYBRID));


    if (HYBRID)
        fn_body_nodes.push(stmt(`return s[s.length - 1];`));
    else
        fn_body_nodes.push(stmt(`return s;`));

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
        out_functions = root_states.map(s => renderState(s, states, grammar, runner, id_nodes, ll_fns, HYBRID)),
        general_fn = states.states.map(s => renderState(s, states, grammar, runner, id_nodes, ll_fns, false)),
        pending = [...root_states, states.states[0]], reached = new Set;

    if (!ll_fns[0].L_RECURSION) pending.pop();

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
            state = states.states[i],
            fn = general_fn[i],
            id_name = "$" + (i);

        if (state.REACHABLE) {
            for (const id of ids)
                id.value = `${id_name}`;
            out_functions.push(fn);
        }
    }

    return out_functions;
}
