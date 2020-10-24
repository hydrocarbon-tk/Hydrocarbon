import { Grammar, SymbolType, Symbol } from "../types/grammar.js";
import { Item } from "../util/common.js";
import { stmt, JSNode, JSNodeType } from "@candlefw/js";
import {
    getShiftStates,
    getStatesFromNumericArray,
    translateSymbolValue,
    getNonTerminalTransitionStates,
    integrateState,
    getCompletedItemsNew,
    getRootSym
} from "./utilities.js";
import { State } from "./State";
import { LLProductionFunction } from "./LLProductionFunction.js";
import { insertFunctions } from "./insertFunctions.js";
import { States } from "./lr_hybrid.js";
import { CompilerRunner } from "./CompilerRunner.js";
import { Lexer } from "@candlefw/wind";
import { buildIntermediateRD } from "./ll_hybrid.js";
import { id } from "@candlefw/wind/build/types/tables";

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

    HYBRID: boolean = false,

    gt = getNonTerminalTransitionStates(state)
): string[] {

    const statements: string[] = [];

    if (gt.length > 0) {

        const accepting_productions = state.items.map(i => i.getProduction(grammar).id).setFilter();

        //sort goto in order
        statements.push("var a:i32 = prod;");

        statements.push(`while(1){  `);

        if (runner.ANNOTATED)
            statements.push(`log(\`Loop State ${state.name || state.index} start sp:\${sp} curr sp:\${stack_ptr}  curr p:\${prod} \` );`);

        statements.push(

            `if(prod >= 0) a = prod;`,
            `if(sp > stack_ptr) break; else stack_ptr += 1;`,
            `prod = -1;`,
            `switch(a) {`
        );


        for (const [key, val] of gt.sort(([a], [b]) => a < b ? 1 : b < a ? -1 : 0)) {


            statements.push(`case ${key}:`);

            let i = 0;
            for (const st of val.map(i => states[i])) {

                if (i++ > 0) {

                    state.reachable.add(st.index);

                    statements.push("if(prod < 0)");

                    statements.push(integrateState(st, states, grammar, ids, existing_refs, "s", state));

                    statements.push("else continue;");

                } else {

                    state.reachable.add(st.index);

                    statements.push(integrateState(st, states, grammar, ids, existing_refs, "s", state));
                }
            }

            statements.push(` continue;`);
        }

        statements.push(
            "}",
            "break;",
            "}",
            `if(sp <= stack_ptr) prod = a;`,
        );

        if (HYBRID) {
            statements.push(`if(![${accepting_productions.join(",")}].includes(a))fail(l); else prod = ${state.items[0].getProduction(grammar).id}`);
        } else
            statements.push(`if(![${accepting_productions.join(",")}].includes(a))fail(l);`);

        if (runner.ANNOTATED)
            statements.push(`log(\`Loop State ${state.name || state.index} pass:\${FAILED} ep:\${prod} a:\${a} \` );`);

    }

    return statements;
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
    /** Optional List of LL recursive descent functions */
    ll_fns: LLProductionFunction[] = null,
    /** Indicates the state results from a transition from LL to LR*/
    active_gotos = []
): string[] {

    const statements: string[] = [], HAS_GOTO = getNonTerminalTransitionStates(state).length > 0;

    //Group all states transitions / reductions based on symbols. 

    //Sort groups based on the productions they have. State indices mapped to "-" delim strings
    const to_process = [
        ...getShiftStates(state).map(([sym, val]) => ({
            type: 1,
            id: "1S" + sym + val.join(":"),
            a_sym: getRootSym(states[val[0]].items[0].decrement().sym(grammar), grammar),
            sym: getRealSymValue(states[val[0]].items[0].decrement().sym(grammar)),
            states: val.sort(),
        })),
        ...(getCompletedItemsNew(state).map(i => ({
            type: 2,
            id: "2R" + i.follow.val,
            a_sym: getRootSym(i.follow, grammar),
            sym: getRealSymValue(i.follow),
            item: i,
            index: state.index,
        })))
    ];

    let sym_groups = to_process
        //Sort into shift and reduce groups
        .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
        .sort((a, b) => a.type - b.type)
        //Group based on transition symbol
        .group(s => s.sym);
    //.sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)

    sym_groups = sym_groups
        .group(s => {
            let id = "";

            //Merge reduce states that are the same and do not have shift within.
            if (s.every(e => e.type == 2)) {
                id = "R" + s.filter(s => s.type == 2).flatMap(s => s.item.body).setFilter().sort().join("-");
            } else {
                //Group based on states that are shifted to from the symbol
                id = "SR" + s.filter(s => s.type == 1).flatMap(s => s.states).setFilter().sort().join("-");
            }

            s.id = id;

            return id;
        });

    sym_groups = sym_groups
        .map(s => {

            const trs = s.flat();

            return ({
                a_syms: trs.map(s => {
                    return s.a_sym;
                }).setFilter(s => s.val),
                syms: trs.map(s => {
                    return s.sym;
                }).setFilter(), reduce: trs.filter(s => s.type == 2).setFilter(s => s.item.id), shift: trs.filter(s => s.type == 1)
            });

        });

    const SINGLE_TRANSITION_BLOCK = sym_groups.length == 1, outputs = [];

    for (const { a_syms, syms, shift, reduce } of sym_groups) {

        const output = {
            a_syms,
            syms,
            stmts: <string[]>[],
        };

        outputs.push(output);

        const block = output.stmts;

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

                active_gotos.push(production);

                if (GROUP_NOT_LAST) {
                    if (FIRST_GROUP) {
                        block.push(`var $mark = mark()`);
                        block.push(`var cp = l.copy()`);
                        lex_name = 'cp';
                    } else {
                        block.push("cp = l.copy()");
                        lex_name = 'cp';
                    };
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
                        block.push(runner.createAnnotationJSNode(`LR[${state.index}]-SHIFT:\${stack_ptr}`, grammar, ...shift_state.items.map(i => i.decrement())));


                if (ll_fns/* && ll_fns[production].IS_RD*/) {

                    block.push(buildIntermediateRD(shift_state.items.setFilter(i => i.id).map(i => i.decrement()), grammar, runner), ";");

                    //if (GROUP_NOT_LAST) {
                    //    block.push(`$${grammar[production].name}(${lex_name})`);
                    //} else
                    //    block.push(`$${grammar[production].name}(${lex_name})`);
                    //
                    //block.push(...insertFunctions(item, grammar, false));
                } else {

                    let shift_state_stmt = "";

                    const
                        skip_symbols = grammar.meta.ignore.flatMap(d => d.symbols),
                        insert_functions = insertFunctions(item, grammar, false),
                        shift_fn = `_(${lex_name}, /* e.eh, */ [${skip_symbols.map(translateSymbolValue).join(",")}]); stack_ptr++;`,
                        symbols_name = GROUP_NOT_LAST ? pdn : "s";

                    block.push(shift_fn);

                    if (insert_functions.length > 0)
                        block.push(...insert_functions);

                    if (!HAS_GOTO)
                        shift_state_stmt = `State${shift_state.index}(${lex_name});return;`;
                    else
                        shift_state_stmt = `State${shift_state.index}(${lex_name})`;

                    block.push(shift_state_stmt);

                    state.reachable.add(shift_state.index);
                }

                if (SINGLE_TRANSITION_BLOCK) {
                    if (TRY_GROUP && GROUP_NOT_LAST) {
                        block.push(`if(prod !== ${production}){
                            reset($mark)
                            FAILED = false;
                            stack_ptr = sp;
                        }else{
                            l.sync(cp);
                            return s;
                        }`);
                    }
                } else {

                    if (TRY_GROUP && GROUP_NOT_LAST) {
                        block.push(`if(prod !== ${production}){
                            FAILED = false;
                            stack_ptr = sp;
                        }else{
                            l.sync(cp);
                            break;
                        }`);
                    }
                }
            }
        }

        // if (shift.length < 1)
        for (const { item } of reduce) {

            const
                production = item.getProduction(grammar),
                body = item.body_(grammar);

            if (runner.ANNOTATED)
                block.push(runner.createAnnotationJSNode(`LR[${state.index}]-REDUCE_TO:${production.id} sp:\${stack_ptr}`, grammar, item));

            block.push(
                `stack_ptr -= ${item.len} `,
                `add_reduce(${item.len},${item.body});`,
                `prod = ${production.id}`,
                `return;`
            );

        }
    }

    if (outputs.length > 0) {
        const
            id = outputs.filter(e => e.syms.some(i => typeof i == "string")),
            ty = outputs.filter(e => e.syms.some(i => ((typeof i == "number") && (i !== 0xFF)))),
            END = outputs.filter(e => e.syms.some(i => (i == 0xFF)));

        if (outputs.length == 1) {

            let output;

            if (id.length > 0)
                output = id[0];
            else if (ty.length > 0)
                output = ty[0];
            else
                output = END[0];

            const if_stmt = [`if(${
                [
                    END.length > 0 ? "l.END" : undefined,
                    id.length > 0 ? `[${id[0].a_syms.filter(s => s.id != undefined).map(s => s.id).setFilter().sort().join(",")}].includes(l.id)` : undefined,
                    ty.length > 0 ? `[${ty[0].a_syms.filter(s => s.type == SymbolType.GENERATED).map(s => translateSymbolValue(s)).setFilter().sort().join(",")}].includes(l.ty)` : undefined
                ].filter(_ => _).join("||")
                }){`];

            if_stmt.push(...output.stmts);

            statements.push(...if_stmt, "}");
        } else {

            let id_switch: string[], ty_switch: string[], end_stmt: string[];

            if (END.length > 0) {
                end_stmt = ["if(l.END){"];

                for (const output of END)
                    end_stmt.push(...output.stmts);

                end_stmt.push("}");
            }

            if (id.length > 0) {

                id_switch = ["switch(l.id){"];

                for (const output of id) {

                    const tx_syms = output.a_syms.filter(s => s.id != undefined);

                    id_switch.push(...tx_syms.map(s => caseClauseNode(s.id) + `/* ${s.val} */`));

                    id_switch.push(...output.stmts);

                    if (!id_switch.slice(-1)[0].includes("return"))
                        id_switch.push("break;");
                }

                id_switch.push("}");
            }

            if (ty.length > 0) {

                ty_switch = ["switch(l.ty){"];

                for (const output of ty) {

                    const ty_syms = output.a_syms.filter(s => s.id == undefined);

                    ty_switch.push(...ty_syms.map(s => caseClauseNode(translateSymbolValue(s)) + `/* ${s.val} */`));

                    ty_switch.push(...output.stmts);

                    if (!ty_switch.slice(-1)[0].includes("return"))
                        ty_switch.push("break;");
                }

                ty_switch.push("}");
            }

            let switch_ = ty_switch;

            if (id_switch) {

                switch_ = id_switch;

                if (ty_switch)
                    switch_.splice(switch_.length - 2, 0, ...[` default : `, ...ty_switch]);
            }

            if (end_stmt) {

                statements.push(...end_stmt);

                if (switch_) {
                    statements.push("else", ...switch_, ";");
                }
            } else
                statements.push(...switch_);
        }
    }
    return statements;
}

function filterGotos(state: State, states: State[], grammar: Grammar, ...pending_prods: number[]): Map<number, number[]> {

    const active_gotos = new Set(pending_prods);

    for (let i = 0; i < pending_prods.length; i++) {

        const production = pending_prods[i];

        //grab all of the productions from each goto
        for (const s of getStatesFromNumericArray(state.maps.get(production) || [], states)) {

            //get all the potential productions that can be yielded from the state
            const yielded_prods = s.items.setFilter(s => s.id).map(s => s.getProduction(grammar).id);

            for (const prod of yielded_prods) {
                if (!active_gotos.has(prod)) {
                    active_gotos.add(prod);
                    pending_prods.push(prod);
                }
            }
        }
    }

    return new Map([...active_gotos.values()].filter(s => state.maps.has(s)).map(v => [v, state.maps.get(v)]));
}

function caseClauseNode(case_condition: string): string[] {
    return [`case ${case_condition}: `];
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
    HYBRID = false): string[] {
    const
        existing_refs: Set<number> = new Set(),
        statements: string[] = [],
        active_gotos: number[] = [];

    const item = state.items[0], symbol = item.sym(grammar)?.val, production = item.getProduction(grammar).id;
    // if (state.index == 14) {
    //If the state has only one transition point
    if (
        state.items.setFilter(i => i.id).length == 1
        && !item.atEND
        && item.sym(grammar).type == SymbolType.PRODUCTION
        && item.increment().atEND
        && ll_fns
        && ll_fns?.[production]
    ) {
        try {
            statements.push(buildIntermediateRD(state.items.setFilter(i => i.id), grammar, runner));

            active_gotos.push(production);

            console.log({
                id: state.bid || state.items.map(i => i.renderUnformattedWithProduction(grammar)).join(";"),
                active_gotos,
                gt: filterGotos(state, states, grammar, ...active_gotos),
                state_map: state.maps
            });

            return statements;

        } catch (e) {

        }
        /*
        //Find out the production that is to be generated;
        const production = item.getProduction(grammar).id;
        const shift_sym = item.sym(grammar).val;

        statements.push(`$${grammar[shift_sym].name}(l)`);
        statements.push(`stack_ptr++`);

        const pending_prods = [production];
        const active_gotos = new Set([production]);

        for (let i = 0; i < pending_prods.length; i++) {

            //grab all of the productions from each goto
            for (const s of getStatesFromNumericArray(state.maps.get(production) || [], states)) {

                //get all the potential productions that can be yielded from the state
                const prods = s.items.setFilter(s => s.id).map(s => s.getProduction(grammar).id).setFilter();

                for (const prod of prods) {
                    if (!active_gotos.has(prod)) {
                        active_gotos.add(prod);
                        pending_prods.push(prod);
                    }
                }
            }
        }

        const goto_map = new Map([...active_gotos.values()].filter(s => state.maps.has(s)).map(v => [v, state.maps.get(v)]));

        if (item.increment().atEND) {
            if (goto_map.size > 1) {
                statements.push(...gotoState(state, states, grammar, runner, ids, existing_refs, HYBRID, goto_map));
            } else {
                if (state.maps.has(production))
                    statements.push(`State${state.maps.get(production)[0]}(l);`);
            }
        } else {
            console.log({ i: state.items.setFilter(s => s.id).map(s => s.renderUnformattedWithProductionAndFollow(grammar)).join(" "), production, goto_map, sm: state.maps });
        }*/

        //  }
    }

    const
        goto_statements = gotoState(state, states, grammar, runner, ids, existing_refs, HYBRID),
        shift_reduce_statements = shiftReduce(state, states, grammar, runner, ll_fns, active_gotos);

    if (goto_statements.length > 0) statements.push("const sp: u32 = stack_ptr;");

    //statements.push("prod = -1;");

    statements.push(...shift_reduce_statements);

    statements.push(...goto_statements);


    return statements;
}

export function renderState(
    state: State,
    states: State[],
    grammar: Grammar,
    runner: CompilerRunner,
    id_nodes: JSNode[][] = states.reduce(r => (r.push([]), r), []),
    ll_fns: LLProductionFunction[] = null,
    HYBRID = false
): string {


    let str: string[] = [];

    for (const item of state.items)
        str.push(item.renderUnformattedWithProductionAndFollow(grammar).replace(/\"/, "\\\""));

    const
        fn: string[] = runner.ANNOTATED
            ? [`function ${state.name ? state.name : "State" + state.index}(l:Lexer, st){\`${state.bid || state.items.map(i => i.renderUnformattedWithProduction(grammar)).join(";")}\`;`]
            : [`function ${state.name ? state.name : "State" + state.index}(l:Lexer):void{`];


    fn.push(...compileState(state, states, grammar, runner, id_nodes, ll_fns, HYBRID));

    //if (HYBRID)
    //    fn.push(`return s[s.length - 1];`);
    //else
    //    fn.push(`return s;`);

    fn.push("}");

    return fn.join("\n");
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
    states: State[],
    grammar: Grammar,
    runner,
    id_nodes: JSNode[][] = states.reduce(r => (r.push([]), r), []),
    ll_fns: LLProductionFunction[] = null,
    HYBRID = false
): JSNode[] {

    const
        out_functions = [],
        general_fn = states.map(s => renderState(s, states, grammar, runner, id_nodes, ll_fns, false)),
        pending = [...root_states], reached = new Set(root_states.map(s => s.index));


    if (!ll_fns[0].L_RECURSION) pending.pop();

    for (let i = 0; i < pending.length; i++) {

        const state = pending[i];

        reached.add(state.index);

        state.REACHABLE = true;

        for (const sc of getStatesFromNumericArray([...state.reachable.values()], states)) {
            if (!reached.has(sc.index)) {
                pending.push(sc);
            }
        }
    }

    for (let i = 0; i < states.length; i++) {

        const
            ids = id_nodes[i],
            state = states[i],
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
