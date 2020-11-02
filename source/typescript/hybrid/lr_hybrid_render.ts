import { Grammar, SymbolType } from "../types/grammar.js";
import { Item, processClosure } from "../util/common.js";
import {
    getShiftStates,
    getStatesFromNumericArray,
    translateSymbolValue,
    getNonTerminalTransitionStates,
    integrateState,
    getCompletedItemsNew,
    getRootSym,
    getRealSymValue,
    getIncludeBooleans,
    getLexerBooleanExpression,
    createLRReduceCompletionWithoutFn,
    createNoCheckShift,
    createEmptyShift,
    getRDFNName,
    createLRReduceCompletionWithFn
} from "./utilities/utilities.js";
import { State } from "./types/State";
import { RDProductionFunction } from "./types/RDProductionFunction.js";
import { insertFunctions } from "./utilities/insert_body_functions.js";
import { States } from "./lr_hybrid.js";
import { CompilerRunner } from "./types/CompilerRunner.js";
import { Symbol } from "../types/Symbol.js";


function filterGotos(state: State, states: State[], grammar: Grammar, ...pending_prods: number[]): Map<number, number[]> {

    const active_gotos = new Set(pending_prods);

    pending_prods = [...active_gotos.values()];

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

function gotoState(
    /**  The state to reduce */
    state: State,
    /** List of all states */
    states: State[],
    /** The grammar for the states */
    grammar: Grammar,
    /** Compiler utility object */
    runner: CompilerRunner,

    existing_refs: Set<number>,

    HYBRID: boolean = false,

    active_gotos: number[],

    gt = getNonTerminalTransitionStates(state)
): string[] {

    const statements: string[] = [];

    const gotos = filterGotos(state, states, grammar, ...active_gotos);

    gt = [...gotos.entries()];


    if (gt.length > 0) {

        const accepting_productions = state.items.map(i => i.getProduction(grammar).id).setFilter();

        //sort goto in order
        statements.push("var a:i32 = prod;");

        statements.push(`while(1){  `);

        statements.push(

            `if(prod >= 0) a = prod; else break;`,
            `if(sp > stack_ptr) break; else stack_ptr += 1;`,
            `prod = -1;`,
            `switch(a) {`
        );


        for (const [key, val] of gt.sort(([a], [b]) => a < b ? 1 : b < a ? -1 : 0)) {

            if (runner.ANNOTATED)
                statements.push(`case ${key}: //${grammar[key].name}`);
            else
                statements.push(`case ${key}:`);

            let i = 0;
            for (const st of val.map(i => states[i])) {

                if (i++ > 0) {

                    state.reachable.add(st.index);

                    statements.push("if(prod < 0)");

                    statements.push(integrateState(st, existing_refs));

                    statements.push("else continue;");

                } else {

                    state.reachable.add(st.index);

                    statements.push(integrateState(st, existing_refs));
                }
            }

            statements.push(` continue;`);
        }

        statements.push(
            "}",
            "break;",
            "}"
        );

        if (accepting_productions.length < 5)
            statements.push(`completeGOTO${accepting_productions.length}(l, sp, a, ${accepting_productions.join(",")});`);
        else
            statements.push(`if(sp <= stack_ptr) prod = a;`, `if(${accepting_productions.map(s => `${s} != a`).join("&&")}) soft_fail(l); else FAILED = false;`);
        // statements.push(`if(![${accepting_productions.join(",")}].includes(a))fail(l);`);
    }

    return statements;
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
    ll_fns: RDProductionFunction[] = null,
    /** Indicates the state results from a transition from LL to LR*/
    active_gotos: number[] = [],

    reached_rds: Set<number> = new Set
): { body: string[], pre: string[]; } {

    const statements: string[] = [], pre_statements = [], HAS_GOTO = getNonTerminalTransitionStates(state).length > 0;

    //Group all states transitions / reductions based on symbols. 

    //Sort groups based on the productions they have. State indices mapped to "-" delim strings

    const closure: Item[] = state.items.setFilter(s => s.id);

    processClosure(closure, grammar, true);

    const cc = closure.sort((a, b) => b.body - a.body).slice(0, -1);

    let HAS_SHIFT = false;

    const to_process = [
        ...getShiftStates(state).map(([sym, val]) => {

            return ({
                type: 1,
                id: "1S" + sym + val.join(":"),
                a_sym: getRootSym(states[val[0]].items[0].decrement().sym(grammar), grammar),
                sym: getRealSymValue(states[val[0]].items[0].decrement().sym(grammar)),
                states: val.sort(),
            });
        }),
        ...(getCompletedItemsNew(state).map(i => ({
            type: 2,
            id: "2R" + i.follow.val,
            a_sym: getRootSym(i.follow, grammar),
            sym: getRealSymValue(i.follow),
            item: i,
            index: state.index,
        })))
    ];


    if (runner.ANNOTATED) {
        const syms = to_process.map(s => s.a_sym).map(s => s.val).setFilter();

        statements.push(`//anticipated token${syms.length > 1 ? "s" : ""}:[ ` + syms.sort().join(" ][ ") + " ]");
    }

    let sym_groups = to_process
        //Sort into shift and reduce groups
        .sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
        .sort((a, b) => a.type - b.type)
        //Group based on transition symbol
        .group(s => s.sym);

    sym_groups = sym_groups
        .group(s => {
            let id = "";

            //Merge reduce states that are the same and do not have shift within.
            if (s.every(e => e.type == 2))
                id = "R" + s.filter(s => s.type == 2).flatMap(s => s.item.body).setFilter().sort().join("-");
            else if (s[0].a_sym.type == SymbolType.PRODUCTION_ASSERTION_FUNCTION)
                id = "AS" + s.filter(s => s.type == 1).flatMap(s => s.states).setFilter().sort().join("-");
            else
                //Group based on states that are shifted to from the symbol
                id = "SR" + s.filter(s => s.type == 1).flatMap(s => s.states).setFilter().sort().join("-");

            s.id = id;

            return id;
        });

    sym_groups = sym_groups
        .map(s => {

            const trs = s.flat();

            const ASSERTION = trs[0].id.slice(0, 2) == "AS";

            return ({
                ASSERTION,
                a_syms: trs.map(s => {
                    return s.a_sym;
                }).setFilter(s => s.val),
                syms: trs.map(s => {
                    return s.sym;
                }).setFilter(),
                reduce: trs.filter(s => s.type == 2).setFilter(s => s.item.id),
                shift: trs.filter(s => s.type == 1)
            });

        });

    const SINGLE_TRANSITION_BLOCK = sym_groups.length == 1, outputs = [];

    for (const { a_syms, syms, shift, reduce, ASSERTION } of sym_groups) {

        const output = {
            a_syms,
            syms,
            IS_PURE_RD: shift.length == 1 && reduce.length == 0,
            rd_name: "",
            stmts: <string[]>[],
        };

        outputs.push(output);

        const block = output.stmts;

        for (const shift_groups of shift) {

            if (!HAS_SHIFT) {
                HAS_SHIFT = true;
                statements.unshift("prod = -1;");
            }

            const TRY_GROUP = shift_groups.states.length > 1;

            let i = 0;

            for (const shift_state of getStatesFromNumericArray(shift_groups.states, states)) {

                let lex_name = "l", pending_data_name = "_sym", pdn = pending_data_name;

                if (runner.ANNOTATED)
                    block.push(`//${shift_state.items.setFilter(i => i.id).map(i => (<Item>i).renderUnformattedWithProduction(grammar)).join("  :  ")}\n`);

                const item: Item = shift_state.items[0],
                    GROUP_NOT_LAST = i < shift_groups.states.length - 1,
                    FIRST_GROUP = i == 0,
                    production = item.getProduction(grammar).id;

                i++;

                if (GROUP_NOT_LAST) {
                    if (FIRST_GROUP) {
                        block.push(`var $mark = mark(), sp = stack_ptr`);
                        block.push(`var cp = l.copy()`);
                        lex_name = 'cp';
                    } else {
                        block.push("cp = l.copy()");
                        lex_name = 'cp';
                    };
                }

                let RUN = true;

                if (ll_fns) {

                    const productions: Map<number, Set<string>> = new Map([[production, new Set()]]);
                    let cap = shift_state.items.slice(), added = new Set();
                    let ADDED = true;

                    while (ADDED) {
                        ADDED = false;
                        //Get chain of productions that lead from the current one
                        for (let item of cc) {

                            const sym = item.sym(grammar);

                            if (sym && sym.type == SymbolType.PRODUCTION) {

                                if (productions.has(<number>sym.val)) {

                                    if (added.has(item.body)) continue;

                                    added.add(item.body);

                                    ADDED = true;

                                    const prod_id = item.getProduction(grammar).id;

                                    const c = [item];

                                    processClosure(c, grammar, true);

                                    if (!productions.has(prod_id))
                                        productions.set(prod_id, new Set());

                                    const map = productions.get(prod_id);

                                    if (prod_id !== sym.val) {
                                        map.add(sym.val);
                                    }
                                    cap.push(item);
                                }
                            }
                        }
                    }

                    const map = [...productions.entries()].reverse();

                    for (const [prod, set] of map.slice(0)) {
                        if (ll_fns[prod] && ll_fns[prod].IS_RD) {
                            const rd = ll_fns[prod], name = getRDFNName(grammar[prod]);
                            reached_rds.add(prod);
                            RUN = false;
                            block.push(`${name}(l);`);
                            active_gotos.push(prod);
                            output.rd_name = name;

                            if (ll_fns[prod].IS_RD) {
                                break;
                            } else {
                                state.reachable.add(rd.state.index);
                                break;
                            }
                        }
                        if (set.size > 1) break;
                    }
                }

                if (RUN) {

                    output.IS_PURE_RD = false;

                    active_gotos.push(...shift_state.items.map(i => i.getProduction(grammar).id));

                    let shift_state_stmt = "";

                    const
                        insert_functions = insertFunctions(item, grammar, false);

                    if (ASSERTION) {
                        if (!a_syms[0].HAS_SHIFT)
                            block.push(createEmptyShift());
                    } else
                        block.push(createNoCheckShift(grammar, runner));

                    block.push("stack_ptr++;");

                    if (insert_functions.length > 0)
                        block.push(...insert_functions);

                    if (!HAS_GOTO)
                        shift_state_stmt = `State${shift_state.index}(${lex_name});`;
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
                            return;
                        }`);
                    }
                } else {

                    if (TRY_GROUP && GROUP_NOT_LAST) {
                        block.push(`if(prod !== ${production}){
                            reset($mark)
                            FAILED = false;
                            stack_ptr = sp;
                        }else{
                            l.sync(cp);
                            return;
                        }`);
                    }
                }
            }
        }

        if (shift.length > 0 && reduce.length > 0)
            block.push(`if(prod >= 0) return; else FAILED = false;`);

        if (runner.ANNOTATED)
            block.push(`//${reduce.map(i => (<Item>i.item).renderUnformattedWithProduction(grammar)).join("  :  ")}\n`);

        for (const { item } of reduce.slice(0, 1)) {

            const
                production = item.getProduction(grammar),
                body = item.body_(grammar);

            active_gotos.push(production.id);

            if (!(item.len == 1 && !body.reduce_function))
                block.push(createLRReduceCompletionWithFn(item, grammar));
            else
                block.push(createLRReduceCompletionWithoutFn(item, grammar));
        }
    }

    if (outputs.length > 0) {

        if (outputs.length == 1) {
            statements.push(`if(${getIncludeBooleans(outputs[0].a_syms, grammar, runner)}){`, ...outputs[0].stmts, "}");
        } else {

            const
                id = outputs.filter(e => e.a_syms.some(isSymADefinedToken)),
                ty = outputs.filter(e => e.a_syms.some(isSymAGenericType)),
                af = outputs.filter(e => e.a_syms.some(isSymAnAssertFunction));

            let ty_name = `tym${state.index}`, id_name = `idm${state.index}`, pa_stmts = [];

            if (af.length > 0) {
                for (const output of af) {
                    const pa_syms = output.a_syms.filter(isSymAnAssertFunction);
                    for (const s of pa_syms)
                        pa_stmts.push(`if(${getLexerBooleanExpression(s, grammar)}){${output.stmts.join("\n")}}`);
                }
            }

            if (id.length > 0) {
                let i = 0;
                const
                    id_stmt = [`const ${id_name}: Map<number, (L:Lexer)=>void> = new Map()`],
                    map_hash = [];
                for (const output of id) {
                    const
                        id_syms = output.a_syms.filter(isSymADefinedToken),
                        fn_name = `_${state.index}id` + i++;
                    if (output.IS_PURE_RD) {
                        for (const s of id_syms) {
                            const hash = `${s.id + (runner.ANNOTATED ? `/* ${s.val} */` : "")}, ${output.rd_name}`;
                            id_stmt.push(`${id_name}.set(${hash})`);
                            map_hash.push(hash);
                        }
                    } else {
                        const
                            fn_body = `(l:Lexer):void => {${output.stmts.join("\n")}}`,
                            name = runner.add_constant(fn_body, fn_name);

                        for (const s of id_syms) {
                            const hash = `${s.id + (runner.ANNOTATED ? `/* ${s.val} */` : "")}, ${name}`;
                            id_stmt.push(`${id_name}.set(${hash})`);
                            map_hash.push(hash);
                        }
                    }
                }


                const hash_string = map_hash.sort().join("");
                id_name = runner.add_statement(hash_string, id_name, id_stmt.join("\n"));
            }

            if (ty.length > 0) {
                let i = 0;

                const
                    ty_stmt = [`const ${ty_name}: Map<number, (L:Lexer)=>void> = new Map()`],
                    map_hash = [];

                for (const output of ty) {
                    const
                        ty_syms = output.a_syms.filter(isSymAGenericType),
                        fn_name = `_${state.index}ty` + i++;

                    if (output.IS_PURE_RD) {
                        for (const s of ty_syms) {
                            const hash = `${translateSymbolValue(s, grammar, runner.ANNOTATED)}, ${output.rd_name}`;
                            ty_stmt.push(`${ty_name}.set(${hash})`);
                            map_hash.push(hash);
                        }
                    } else {
                        const
                            fn_body = `(l:Lexer):void => {${output.stmts.join("\n")}}`,
                            name = runner.add_constant(fn_body, fn_name);

                        for (const s of ty_syms) {
                            const hash = `${translateSymbolValue(s, grammar, runner.ANNOTATED)}, ${name}`;
                            ty_stmt.push(`${ty_name}.set(${hash})`);
                            map_hash.push(hash);
                        }
                    }
                }

                const hash_string = map_hash.sort().join("");
                ty_name = runner.add_statement(hash_string, ty_name, ty_stmt.join("\n"));
            }

            statements.push([
                id.length > 0 ? `if(${id_name}.has(l.id))${id_name}.get(l.id)(l);` : "",
                ty.length > 0 ? `if(${ty_name}.has(l.ty))${ty_name}.get(l.ty)(l);` : "",
                af.length > 0 ? pa_stmts.join(" else ") : ""
            ].filter(s => s).join((" else ")));
        }
    }
    return { body: statements, pre: pre_statements };
}

function isSymAnAssertFunction(s: Symbol): boolean {
    return s.type == SymbolType.PRODUCTION_ASSERTION_FUNCTION;
}

function isSymAGenericType(s: Symbol): boolean {
    return s.type == SymbolType.GENERATED;
}

function isSymADefinedToken(s: Symbol): boolean {
    return s.type != SymbolType.PRODUCTION && s.type != SymbolType.GENERATED && s.type != SymbolType.PRODUCTION_ASSERTION_FUNCTION;
}

function compileState(
    /**  The state to reduce */
    state: State,
    /** List of all states */
    states: State[],
    /** The grammar for the states */
    grammar: Grammar,
    runner,
    /** Optional List of LL recursive descent functions */
    ll_fns: RDProductionFunction[] = null,
    /** Indicates the state results from a transition from LL to LR*/
    HYBRID = false,

    reached_rds: Set<number> = new Set
): { body_stmts: string[], pre_stmts: string[]; } {
    const
        existing_refs: Set<number> = new Set(),
        statements: string[] = [],
        pre_statements: string[] = [],
        active_gotos: number[] = [];

    const item = state.items[0], symbol = item.sym(grammar)?.val;

    const { body: sr_body, pre: sr_pre } = shiftReduce(state, states, grammar, runner, ll_fns, active_gotos, reached_rds),
        goto_statements = gotoState(state, states, grammar, runner, existing_refs, HYBRID, active_gotos);

    if (goto_statements.length > 0) statements.push("const sp: u32 = stack_ptr;");

    pre_statements.push(...sr_pre);

    statements.push(...sr_body);

    statements.push(...goto_statements);

    return { body_stmts: statements, pre_stmts: pre_statements };
}

export function renderState(
    state: State,
    states: State[],
    grammar: Grammar,
    runner: CompilerRunner,
    ll_fns: RDProductionFunction[] = null,
    HYBRID = false,
    reached_rds: Set<number> = new Set
): string {
    if (state.name == "$P_HC_listbody4_102") {
        const c = state.items.slice();
        processClosure(c, grammar, false);
    }

    let str: string[] = [];

    for (const item of state.items)
        str.push(item.renderUnformattedWithProductionAndFollow(grammar).replace(/\"/, "\\\""));

    const
        fn: string[] = runner.ANNOTATED
            ? [
                `function ${state.name ? state.name : "State" + state.index
                } (l: Lexer): void{
    `,
                `/*\n${state.items.setFilter(i => i.id).map(
                    i => i.renderUnformattedWithProduction(grammar) + ((i.sym(grammar)?.type == SymbolType.PRODUCTION)
                        ? (": " + i.getProduction(grammar).id)
                        : (""))
                ).join(";\n")}\n*/`
            ]
            : [`function ${state.name ? state.name : "State" + state.index}(l:Lexer):void{`];


    const { body_stmts, pre_stmts } = compileState(state, states, grammar, runner, ll_fns, HYBRID, reached_rds);

    fn.push(...body_stmts);

    fn.push("}");

    return [...pre_stmts, ...fn].join("\n");
};

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
    ll_fns: RDProductionFunction[] = null
): { reached_rds: Set<number>; } {
    runner.compression_lookups = new Map();

    const
        reached_rds: Set<number> = new Set(),
        pending = root_states, reached = new Set(root_states.map(s => s.index));

    for (let i = 0; i < pending.length; i++) {

        const state = pending[i];
        state.REACHABLE = true;

        if (!state.function_string) {

            state.function_string = renderState(state, states, grammar, runner, ll_fns, false, reached_rds);

            reached.add(state.index);


            for (const sc of getStatesFromNumericArray([...state.reachable.values()], states)) {
                sc.REACHABLE = true;
                if (!reached.has(sc.index)) {
                    pending.push(sc);
                }
            }
        }
    }

    return { reached_rds };
}
