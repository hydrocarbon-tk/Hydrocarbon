import { Grammar, SymbolType, Symbol } from "../types/grammar.js";
import { Item } from "../util/common.js";
import { stmt, JSNode, JSNodeType } from "@candlefw/js";
import {
    createReduceFunction,
    getLexPeekComparisonString,
    getShiftStates,
    getStatesFromNumericArray,
    translateSymbolValue,
    getNonTerminalTransitionStates,
    integrateState,
    getCompletedItemsNew,
    translateSymbolLiteral,
    translateSymbolLiteralToLexerBool
} from "./utilities.js";
import { State } from "./State";
import { LLProductionFunction } from "./LLProductionFunction.js";
import { insertFunctions } from "./insertFunctions.js";
import { States } from "./lr_hybrid.js";
import { CompilerRunner } from "./CompilerRunner.js";
import { Lexer } from "@candlefw/wind";
import { traverse } from "@candlefw/conflagrate";

function gotoState(
    /**  The state to reduce */
    state: State,
    /** List of all states */
    states: State[],
    /** The grammar for the states */
    grammar: Grammar,
    /** Compiler utility object */
    runner: CompilerRunner,
    /** List of id nodes referencing the name of a state function */
    ids: JSNode[][],

    existing_refs: Set<number>,

    HYBRID: boolean = false
) {

    const statements = [], gt = getNonTerminalTransitionStates(state), gt_set = new Set;

    if (gt.length > 0) {
        const accepting_productions = state.items.map(i => i.getProduction(grammar).id).setFilter();

        //sort goto in order
        statements.push(stmt("let a = e.p;"));

        const
            while_sw = stmt(`o: while(1){ if(sp > e.sp) break; else e.sp += 1; switch(e.p) { } }`),
            while_block = while_sw.nodes[1].nodes[1].nodes,
            while_sw_block = while_block[1].nodes[1].nodes;

        if (runner.ANNOTATED)
            while_block.unshift(stmt(`log(\`Loop State ${state.name || state.index} start sp:\${sp} curr sp:\${e.sp}  curr p:\${e.p} \` );`));

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

                    node.nodes[1] = stmts[0];

                    clause.push(node);

                } else {

                    state.reachable.add(st.index);

                    const { stmts, productions } = integrateState(st, states, grammar, ids, existing_refs, "s", state);

                    clause.push(...stmts);
                }
            }

            clause.push(stmt(` break ;`));

            if (clause.length == 1) continue;

            while_sw_block.push(case_stmt);
        }

        while_block.push(stmt(`if(e.p >= 0) a = e.p;`));

        const
            case_stmt = stmt(`switch(true) { default:  } `).nodes[1].nodes[0],
            clause = case_stmt.nodes,
            tests = [...new Set(state.items.map(i => getLexPeekComparisonString(i.follow))).values()],
            def = stmt(`if(s.length-start > 1)progress = true; `);

        //  clause.push(def);
        clause.push(stmt("break o;"));
        while_sw_block.push(case_stmt);
        statements.push(stmt(`if(sp <= e.sp) e.p = a;`));

        if (HYBRID) {
            statements.push(stmt(`if(![${accepting_productions.join(",")}].includes(a))fail(l,e); else e.p = ${state.items[0].getProduction(grammar).id}`));
        } else
            statements.push(stmt(`if(![${accepting_productions.join(",")}].includes(a))fail(l,e);`));

        if (runner.ANNOTATED)
            statements.push(stmt(`log(\`Loop State ${state.name || state.index} pass:\${e.FAILED} ep:\${e.p} a:\${a} \` );`));

    }

    return statements;

    return runner.add_script(statements, stmt("function(l, e, s){ return s}"), "s =", state);
}

function getRealSymValue(sym: Symbol) {
    let val;
    switch (sym.type) {
        case SymbolType.GENERATED:
            if (sym.val == "keyword") { val = "keyword"; break; }
            if (sym.val == "any") { val = "true"; break; }
            if (sym.val == "$eof") { val = 0xFF; break; }
            { val = Lexer.types[sym.val]; break; }
        case SymbolType.LITERAL:
        case SymbolType.ESCAPED:
        case SymbolType.SYMBOL:
            if (sym.val == "\\") { val = `'\\'`; break; }
            if (sym.val == "\"") { val = `\\"`; break; }
            { val = sym.val; break; }
        case SymbolType.END_OF_FILE:
            { val = 0xFF; break; }
        case SymbolType.EMPTY:
            { val = "emptry"; break; }
    }

    if (!val)
        console.log({ sym });
    return val;
}

function shiftReduce(
    /**  The state to reduce */
    state: State,
    /** List of all states */
    states: State[],
    /** The grammar for the states */
    grammar: Grammar,
    /** Compiler utility object */
    runner: CompilerRunner,
    /** List of id nodes referencing the name of a state function */
    ids: JSNode[][],
    /** Optional List of LL recursive descent functions */
    ll_fns: LLProductionFunction[] = null,
    /** Indicates the state results from a transition from LL to LR*/
    HYBRID = false) {

    const statements = [], HAS_GOTO = getNonTerminalTransitionStates(state).length > 0;

    //Group all states transitions / reductions based on symbols. 

    //Sort groups based on the productions they have. State indices mapped to "-" delim strings
    const to_process = [
        ...getShiftStates(state).map(([sym, val]) => ({
            type: 1, sym: getRealSymValue(states[val[0]].items[0].decrement().sym(grammar)), states: val.sort(), id: "1S" + sym + val.join(":")
        })),
        ...(getCompletedItemsNew(state).map(i => ({ id: "2R" + i.follow.val, sym: getRealSymValue(i.follow), item: i, index: state.index, type: 2 })))
    ];

    const sym_groups = to_process
        //Sort into shift and reduce groups
        .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
        .sort((a, b) => a.type - b.type)
        //Group based on transition symbol
        .group(s => s.sym)
        //.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
        .group(s => {
            //Merge reduce states that are the same and do not have shift within.
            if (s.every(e => e.type == 2)) {
                return s.filter(s => s.type == 2).flatMap(s => s.item.body).setFilter().sort().join("-");
            } else {
                //Group based on states that are shifted to from the symbol
                return s.filter(s => s.type == 1).flatMap(s => s.states).setFilter().sort().join("-");
            }
        })
        .map(s => {
            s = s.flatMap(_ => _);
            return ({
                syms: s.map(s => {
                    if (!s.sym)
                        console.log(0, 4, { s, i: s?.item?.renderUnformattedWithProduction(grammar) });
                    return s.sym;
                }).setFilter(), reduce: s.filter(s => s.type == 2).setFilter(s => s.item.id), shift: s.filter(s => s.type == 1)
            });
        });

    const SINGLE_TRANSITION_BLOCK = sym_groups.length == 1, outputs = [];

    for (const { syms, shift, reduce } of sym_groups) {

        const output = {
            syms,
            stmts: stmt(`{}`),
        };

        outputs.push(output);

        const block = output.stmts.nodes;

        for (const shift_groups of shift) {

            const TRY_GROUP = shift_groups.states.length > 1;

            let i = 0;

            for (const shift_state of getStatesFromNumericArray(shift_groups.states, states)) {

                let lex_name = "l", pending_data_name = "_sym", pdn = pending_data_name;

                const item: Item = shift_state.items[0],
                    GROUP_NOT_LAST = i < shift_groups.states.length - 1,
                    FIRST_GROUP = i == 0,
                    production = item.getProduction(grammar).id;

                i++;

                if (GROUP_NOT_LAST) {
                    if (FIRST_GROUP) { block.push(stmt(`var cp = l.copy(), ${pdn} = null;`)); lex_name = 'cp'; }
                    else { block.push(stmt("cp = l.copy()")); lex_name = 'cp'; };
                }

                if (runner.ANNOTATED)
                    if (TRY_GROUP) {
                        if (FIRST_GROUP)
                            block.push(runner.createAnnotationJSNode(
                                `LR[${state.index}]-SHIFT-ATTEMPT:\${sp}:${i}`, grammar, ...shift_state.items));
                        else
                            block.push(runner.createAnnotationJSNode(
                                `LR[${state.index}]-SHIFT-NEXT-ATTEMPT:\${sp}:${i}`, grammar, ...shift_state.items));
                    } else
                        block.push(runner.createAnnotationJSNode(`LR[${state.index}]-SHIFT:\${e.sp}`, grammar, ...shift_state.items.map(i => i.decrement())));


                if (ll_fns && ll_fns[production] && !ll_fns[production].L_RECURSION && item.offset <= 1 && !item.atEND) {

                    if (GROUP_NOT_LAST) {
                        block.push(stmt(`${pdn} = s.slice()`));
                        block.push(stmt(`${pdn}.push($${grammar[production].name}(${lex_name}, e))`));
                    } else
                        block.push(stmt(`s.push($${grammar[production].name}(${lex_name}, e))`));

                    block.push(...insertFunctions(item, grammar, false));

                    block.push(stmt(`e.p = (e.FAILED) ? -1 : ${production};`));

                } else {

                    let shift_state_stmt;

                    const
                        skip_symbols = grammar.meta.ignore.flatMap(d => d.symbols),
                        insert_functions = insertFunctions(item, grammar, false),
                        shift_fn = `_s(${GROUP_NOT_LAST ? "s.slice()" : "s"}, ${lex_name}, e, e.eh, [${skip_symbols.map(translateSymbolValue).join(",")}])`,
                        symbols_name = GROUP_NOT_LAST ? pdn : "s";

                    if (insert_functions.length > 0) {
                        const shift_stmt = stmt(shift_fn);

                        for (const { node: array } of traverse(shift_stmt, "nodes").filter("type", JSNodeType.ArrayLiteral))
                            runner.add_constant(array);

                        block.push(shift_stmt);
                        block.push(...insert_functions);
                        if (!HAS_GOTO) {
                            shift_state_stmt = stmt(`return State${shift_state.index}(${lex_name}, e, ${symbols_name})`);
                            ids[shift_state.index].push(shift_state_stmt.nodes[0].nodes[0]);
                        } else {
                            shift_state_stmt = stmt(`${symbols_name} = State${shift_state.index}(${lex_name}, e, ${symbols_name})`);
                            ids[shift_state.index].push(shift_state_stmt.nodes[0].nodes[1].nodes[0]);
                        }
                    } else {
                        if (!HAS_GOTO) {
                            shift_state_stmt = stmt(`return State${shift_state.index}(${lex_name}, e, ${shift_fn})`);
                            ids[shift_state.index].push(shift_state_stmt.nodes[0].nodes[0]);
                        } else {
                            shift_state_stmt = stmt(`${GROUP_NOT_LAST ? pdn : "s"} = State${shift_state.index}(${lex_name}, e, ${shift_fn})`);
                            ids[shift_state.index].push(shift_state_stmt.nodes[0].nodes[1].nodes[0]);
                        }
                    }

                    for (const { node: array } of traverse(shift_state_stmt, "nodes").filter("type", JSNodeType.ArrayLiteral))
                        runner.add_constant(array);

                    block.push(shift_state_stmt);

                    state.reachable.add(shift_state.index);
                }

                if (SINGLE_TRANSITION_BLOCK) {
                    if (TRY_GROUP && GROUP_NOT_LAST) {
                        block.push(stmt(`if(e.p !== ${production}){
                            e.FAILED = false;
                            e.sp = sp;
                        }else{
                            s = ${pdn};
                            l.sync(cp);
                            return s;
                        }`));
                    }
                } else {

                    if (TRY_GROUP && GROUP_NOT_LAST) {
                        block.push(stmt(`if(e.p !== ${production}){
                            e.FAILED = false;
                            e.sp = sp;
                        }else{
                            s = ${pdn};
                            l.sync(cp);
                            break;
                        }`));
                    }
                }
            }
        }

        if (shift.length < 1)
            for (const { item } of reduce) {

                const
                    production = item.getProduction(grammar),
                    body = item.body_(grammar);

                if (runner.ANNOTATED)
                    block.push(runner.createAnnotationJSNode(`LR[${state.index}]-REDUCE_TO:${production.id} sp:\${e.sp}`, grammar, item));

                const reduce_function = body?.reduce_function?.txt;

                block.push(stmt(`e.sp -= ${item.len} `));

                if (reduce_function) {

                    block.push(stmt(`var sym = s.slice(-${item.len});`));

                    block.push(stmt(`s.splice(-${item.len}, ${item.len}, ${createReduceFunction(reduce_function)})`));

                    block.push(stmt(`return (e.p = ${production.id}, s);`));
                }
                else {
                    block.push(stmt(`return (e.p=${production.id}, (s.splice(-${item.len}, ${item.len}, s[s.length-1]), s));`));
                }
            }
    }

    if (outputs.length > 0) {

        const
            tx = outputs.filter(e => e.syms.some(i => typeof i == "string")),
            ty = outputs.filter(e => e.syms.some(i => ((typeof i == "number") && (i !== 0xFF)))),
            END = outputs.filter(e => e.syms.some(i => (i == 0xFF)));

        if (outputs.length == 1) {

            let output;

            if (tx.length > 0)
                output = tx[0];
            else if (ty.length > 0)
                output = ty[0];
            else
                output = END[0];

            if (!output)
                console.log(0, 3, { outputs });

            const { if_body, if_stmt } = ifBlockStatement(`${
                [
                    END.length > 0 ? "l.END" : undefined,
                    tx.length > 0 ? `[${tx[0].syms.filter(s => typeof s == "string").map(s => translateSymbolLiteral(s)).setFilter().sort().join(",")}].includes(l.tx)` : undefined,
                    ty.length > 0 ? `[${ty[0].syms.filter(s => typeof s == "number").map(s => translateSymbolLiteral(s)).setFilter().sort().join(",")}].includes(l.ty)` : undefined
                ].filter(_ => _).join("||")
                } `);

            for (const { node: array } of traverse(if_stmt.nodes[0], "nodes").filter("type", JSNodeType.ArrayLiteral))
                runner.add_constant(array);

            if_body.nodes.push(...output.stmts.nodes);

            statements.push(if_stmt);
        } else {

            let tx_switch, ty_switch, end_stmt;

            if (END.length > 0) {

                const { if_body, if_stmt } = ifBlockStatement(`l.END`);

                end_stmt = if_stmt;

                for (const output of END)
                    if_body.nodes.push(...output.stmts.nodes);
            }

            if (tx.length > 0) {
                tx_switch = stmt("switch(l.tx){}");

                const switch_block = tx_switch.nodes[1].nodes;

                for (const output of tx) {

                    const tx_syms = output.syms.filter(i => typeof i == "string");

                    switch_block.push(...tx_syms.map(s => caseClauseNode(translateSymbolLiteral(s))));

                    const last = switch_block[switch_block.length - 1];

                    last.nodes.push(...output.stmts.nodes);

                    if (last.nodes[last.nodes.length - 1].type != JSNodeType.ReturnStatement)
                        last.nodes.push(stmt("break;"));
                }
            }

            if (ty.length > 0) {

                ty_switch = stmt("switch(l.ty){}");

                const switch_block = ty_switch.nodes[1].nodes;

                for (const output of ty) {

                    const ty_syms = output.syms.filter(i => typeof i == "number");

                    switch_block.push(...ty_syms.map(s => caseClauseNode(s)));

                    const last = switch_block[switch_block.length - 1];

                    last.nodes.push(...output.stmts.nodes);

                    if (last.nodes[last.nodes.length - 1].type != JSNodeType.ReturnStatement)
                        last.nodes.push(stmt("break;"));
                }
            }

            let switch_ = ty_switch;

            if (tx_switch) {
                switch_ = tx_switch;
                if (ty_switch) {
                    const default_ = stmt(`switch(1){ default : }`).nodes[1].nodes[0];
                    default_.nodes.push(ty_switch);
                    switch_.nodes[1].nodes.push(default_);
                }
            }

            if (end_stmt) {
                statements.push(end_stmt);
                if (switch_) end_stmt.nodes[2] = switch_;
            } else
                statements.push(switch_);
        }
    }

    return runner.add_script(statements, stmt("function(l, e, s){ return s}"), "s =", state);
}

function ifBlockStatement(if_condition: string) {
    const
        if_stmt = stmt(`if(${if_condition}){}`),

        if_body = if_stmt.nodes[1];

    return { if_stmt, if_body };
}

function caseClauseNode(case_condition: string) {
    return stmt(`switch(1){ case ${case_condition}: }`).nodes[1].nodes[0];
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
        goto_statements = gotoState(state, states, grammar, runner, ids, existing_refs, HYBRID),
        shift_reduce_statements = shiftReduce(state, states, grammar, runner, ids, ll_fns, HYBRID);

    if (goto_statements.length > 0)
        statements.push(stmt("const sp = e.sp;"));

    statements.push(stmt("e.p = -1;"));

    statements.push(...shift_reduce_statements);

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

        fn = runner.ANNOTATED
            ? stmt(`function ${state.name ? state.name : "State" + state.index}(l, e, s = [], st){\`${state.bid}\`;;}`)
            : stmt(`function ${state.name ? state.name : "State" + state.index}(l, e, s = []){;}`),
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
