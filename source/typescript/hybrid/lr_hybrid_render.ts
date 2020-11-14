import { Grammar, SymbolType } from "../types/grammar.js";
import { FIRST, FOLLOW, Item, processClosure } from "../util/common.js";
import {
    getStatesFromNumericArray,
    translateSymbolValue,
    getNonTerminalTransitionStates,
    integrateState,
    getRootSym,
    getIncludeBooleans,
    getLexerBooleanExpression,
    createLRReduceCompletionWithoutFn,
    createNoCheckShift,
    getRDFNName,
    getUniqueSymbolName,
    createLRReduceCompletionWithFn,
    addRecoveryHandlerToFunctionBodyArray,
    addSkipCall
} from "./utilities/utilities.js";
import { State } from "./types/State";
import { RDProductionFunction } from "./types/RDProductionFunction.js";
import { CompilerRunner } from "./types/CompilerRunner.js";
import { Symbol } from "../types/Symbol.js";
import { stmt } from "@candlefw/js";


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

    active_gotos: number[]
): string[] {

    const
        statements: string[] = [],
        gotos = filterGotos(state, states, grammar, ...active_gotos);

    const gt = [...gotos.entries()];

    if (gt.length > 0) {

        const accepting_productions: number[] = state.items.map(i => i.getProduction(grammar).id).setFilter();

        statements.push(`while(sp <= stack_ptr){  `);
        statements.push(`switch(prod) {`);

        const inactive_accepting: Set<number> = new Set(accepting_productions);

        for (const [key, val] of gt.sort(([a], [b]) => a < b ? 1 : b < a ? -1 : 0)) {

            if (runner.ANNOTATED)
                statements.push(`case ${key}: //${grammar[key].name}`);
            else
                statements.push(`case ${key}:`);

            if (inactive_accepting.has(key))
                inactive_accepting.delete(key);

            let i = 0;

            for (const st of val.map(i => states[i])) {

                if (i++ > 0) {

                    state.reachable.add(st.index);

                    statements.push("if(prod < 0)");

                    statements.push(integrateState(st, existing_refs));

                    statements.push("else continue;");

                } else {

                    state.reachable.add(st.index);

                    if (state.name && accepting_productions.includes(key)) {
                        statements.push(`{ const cp = l.copy(), m = mark(), p = prod, s = stack_ptr;
                            ${integrateState(st, existing_refs, "cp")}
                            if (FAILED) {
                                prod = p;
                                FAILED = false;
                                stack_ptr = s;
                                reset(m);
                                return;
                            } else l.sync(cp);
                        }`);
                    } else
                        statements.push(integrateState(st, existing_refs));
                }
            }
            statements.push(` break;`);
        }

        if (inactive_accepting.size > 0)
            statements.push(`${[...inactive_accepting.values()]
                .map(i => `case ${i}${runner.ANNOTATED ? `/*${grammar[i].name}*/` : ""}:`).join("\n")} return;`);

        statements.push(
            "default:fail(l);return}",
            "if(prod>=0)stack_ptr++",
            "}"
        );
    }

    return statements;
}


interface StateData {
    type: number;
    id: string;
    a_sym: Symbol;
    sym: string;
    item?: Item,
    index?: number;
    states?: number[];
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

    const
        statements: string[] = [],
        state_symbol_names =
            [
                ...state.items.filter(i => i.atEND).map(i => getUniqueSymbolName(i.follow)),
                ...[...state.maps.keys()].filter(d => (typeof d == "string"))
            ],
        follow_symbols =
            state.items
                .map(i => i.getProduction(grammar).id)
                .setFilter()
                .map(id => [...FOLLOW(grammar, id, true).values()])
                .flat()
                .filter(sym => !state_symbol_names.includes(getUniqueSymbolName(sym))),

        new_outputs: Map<string, Output[]> = new Map;

    //Create skip call
    const skip = addSkipCall(grammar, runner, <any>new Set([...state_symbol_names, ...follow_symbols.map(getUniqueSymbolName)]));
    if (skip) statements.push(skip);

    //Group all states transitions / reductions based on symbols. 

    //Sort groups based on the productions they have. State indices mapped to "-" delim strings

    // Start with the root items this state processes.
    const items = state.items.filter(i => i.len == 0 || i.offset !== 0 || i.sym(grammar).val != i.getProduction(grammar).id).slice();

    //group into items that have RD and those that don't
    const presort: { call: boolean, item: Item; }[] = items.map(i => {
        if (!i.atEND) {
            const sym = i.sym(grammar);
            if (sym.type == SymbolType.PRODUCTION) {
                const prod_id = i.getProduction(grammar).id;
                const closure = [i];
                processClosure(closure, grammar, true);
                for (const item of closure) {
                    if (!item.atEND) {
                        const sym = item.sym(grammar);
                        if (sym.type == SymbolType.PRODUCTION && sym.id == prod_id) return { call: false, item: i };
                    }
                }
                return { call: true, item: i };
            }
        }
        return { call: false, item: i };
    });
    const rd_items = presort.filter(i => i.call).map(i => i.item).setFilter(i => i.id);
    const the_rest = presort.filter(i => !i.call).map(i => i.item);

    type Output = {
        sym: Symbol;
        type: string;
        length?: number;
        stmt: string;
        prod_id?: number;
    };



    function getMappedArray<Val>(string: string, map: Map<string, Val[]>): Val[] {
        if (!map.has(string))
            map.set(string, []);
        return map.get(string);
    }

    function addCatchAllCheck(sym: Symbol, string: string, syms: Symbol[]): { IS_GUARDED: boolean, stmt: string; } {
        let boolean = "";

        if (sym.type == SymbolType.GENERATED)
            if (sym.val == "tok" || sym.val == "sym") {
                const follow = follow_symbols.filter(s => [SymbolType.GENERATED, SymbolType.ESCAPED, SymbolType.SYMBOL].includes(s.type));
                boolean = getIncludeBooleans(follow, grammar, runner, "__lex_name__");
            } else if (sym.val == "key" || sym.val == "id")
                boolean = getIncludeBooleans(
                    follow_symbols.filter(s => [SymbolType.LITERAL].includes(s.type)),
                    grammar,
                    runner,
                    "__lex_name__"
                );
            else if (sym.val == "any")
                boolean = getIncludeBooleans(follow_symbols, grammar, runner, "__lex_name__");

        return { IS_GUARDED: !!boolean, stmt: boolean ? `if(${boolean}) prod = -1; else {${string}}` : string };
    }


    function addRDShiftOutput(prod_id: any, prod_sym: Symbol, item: any, sym: Symbol): any {
        const { stmt, IS_GUARDED } = addCatchAllCheck(sym, `${getRDFNName(grammar[prod_id])}(__lex_name__); stack_ptr++;`, follow_symbols);
        return {
            sym: sym,
            type: "shift",
            prod_id: -1,//IS_GUARDED ? -1 : prod_sym.val,
            length: item.len,
            stmt
        };
    }

    function addLRShiftOutput(
        state: State,
        symbol: Symbol,
        new_outputs: Map<string, Output[]>
    ) {
        for (const st of state.maps.get(getUniqueSymbolName(symbol))) {
            const { stmt, IS_GUARDED } = addCatchAllCheck(symbol, `${createNoCheckShift(grammar, runner)};stack_ptr++;\nState${st}(__lex_name__);\n`, follow_symbols);
            state.reachable.add(st);
            getMappedArray(<string>symbol.val, new_outputs).push({
                sym: symbol,
                type: "shift",
                length: -1,
                stmt
            });
        }
    }

    function combineActionStatements(stmts, index = 0) {
        if (index > 0 && stmts.length - 1 == index) {
            return `if(FAILED){
                reset($mark); FAILED = false; stack_ptr = sp;
                ${stmts[index].replace(/__lex_name__/g, "l")};
            }else l.sync(cp);
            `;
        } else if (index > 0 && stmts.length > index) {
            return `if(FAILED){
                reset($mark); FAILED = false; stack_ptr = sp; cp = l.copy();
                ${stmts[index].replace(/__lex_name__/g, "cp")};
                ${combineActionStatements(stmts, index + 1)}
            }else l.sync(cp);
            `;
        } else if (index == 0 && stmts.length > 0) {
            const SOLO = stmts.length == 1;

            return ` 
                ${SOLO ? " " : `let $mark = mark(), sp = stack_ptr, cp = l.copy();`}
                ${stmts[index].replace(/__lex_name__/g, SOLO ? "l" : "cp")}
                ${combineActionStatements(stmts, index + 1)} 
                `;
        }

        return "";
    }

    //For each FIRST add rd to list of firsts
    for (const item of rd_items) {
        const prod_sym = item.sym(grammar);
        const prod_id = prod_sym.val;
        reached_rds.add(prod_id);
        active_gotos.push(prod_id);
        for (const sym of FIRST(grammar, prod_sym)) {
            getMappedArray(<string>sym.val, new_outputs).push(addRDShiftOutput(prod_id, prod_sym, item, sym));
        }
    }
    for (const item of the_rest) {
        if (item.atEND) {
            const sym = item.follow;
            const body = item.body_(grammar);
            let stmt = "";
            if (body.reduce_id >= -1)
                stmt = `${createLRReduceCompletionWithFn(item, grammar)}; stack_ptr-=${item.len};`;
            else if (item.len > 1)
                stmt = `${createLRReduceCompletionWithoutFn(item, grammar)}; stack_ptr-=${item.len};`;
            getMappedArray(<string>sym.val, new_outputs).push({
                sym: sym,
                type: "reduce",
                stmt
            });
        } else {
            const sym = item.sym(grammar);
            if (sym.type == SymbolType.PRODUCTION) {
                active_gotos.push(sym.val);
                for (const first of FIRST(grammar, sym)) {
                    addLRShiftOutput(state, first, new_outputs);
                }
            } else {
                addLRShiftOutput(state, sym, new_outputs);
            }
        }
    }

    const reduce_outputs = [], shift_outputs = [];

    for (const [, array] of new_outputs.entries()) {

        {
            const shift_array = array.filter(t => t.type == "shift")
                .setFilter(a => a.stmt).sort((a, b) => {
                    return b.length - a.length;
                });
            const IS_SOLO = shift_array.length == 1;
            const IS_PURE_RD = IS_SOLO && shift_array[0].prod_id > 0;
            if (shift_array.length > 0)
                shift_outputs.push({
                    a_syms: [getRootSym(array[0].sym, grammar)],
                    rd_name: IS_PURE_RD ? getRDFNName(grammar[shift_array[0].prod_id]) : "",
                    IS_PURE_RD,
                    stmts: [combineActionStatements(shift_array.map(a => a.stmt))]
                });
        } {
            const reduce_array = array.filter(t => t.type == "reduce").setFilter(a => a.stmt);
            const IS_SOLO = reduce_array.length == 1;
            const IS_PURE_RD = IS_SOLO && reduce_array[0].prod_id > 0;

            if (reduce_array.length > 0)
                reduce_outputs.push({
                    a_syms: [getRootSym(array[0].sym, grammar)],
                    rd_name: IS_PURE_RD ? getRDFNName(grammar[reduce_array[0].prod_id]) : "",
                    IS_PURE_RD,
                    stmts: [combineActionStatements(reduce_array.map(a => a.stmt))]
                });
        }
    }


    statements.push(
        [...createIfLRBlocks(shift_outputs, grammar, runner, state),
        ...createIfLRBlocks(reduce_outputs, grammar, runner, state, true)].join(" else "),
        "else prod = -1;"
    );

    statements.push();

    return { body: statements, pre: [] };
}


function createIfLRBlocks(outputs: any[], grammar: Grammar, runner: CompilerRunner, state: State, REDUCE_FUNCTIONS: boolean = false) {
    const statements: string[] = [];
    if (outputs.length > 0) {

        if (outputs.length == 1) {
            statements.push([`if(${getIncludeBooleans(outputs[0].a_syms, grammar, runner)}){`, ...outputs[0].stmts, REDUCE_FUNCTIONS ? "\nreturn;" : "", "}"].join("\n"));
        } else {

            const
                id = outputs.filter(e => e.a_syms.some(isSymADefinedToken)),
                ty = outputs.filter(e => e.a_syms.some(isSymAGenericType)),
                af = outputs.filter(e => e.a_syms.some(isSymAnAssertFunction));

            let ty_name = `tym${state.index}${REDUCE_FUNCTIONS ? "r" : ""}`, id_name = `idm${state.index}${REDUCE_FUNCTIONS ? "r" : ""}`, pa_stmts = [];

            if (af.length > 0) {
                for (const output of af) {
                    const pa_syms = output.a_syms.filter(isSymAnAssertFunction);
                    for (const s of pa_syms)
                        pa_stmts.push(`if(${getLexerBooleanExpression(s, grammar)}){${output.stmts.join("\n")}${REDUCE_FUNCTIONS ? "\nreturn;" : ""}}`);
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
                            const hash = `${s.id + (runner.ANNOTATED ? `/* ${s.val} */` : "")},${output.rd_name}`;
                            id_stmt.push(`${id_name}.set(${hash})`);
                            map_hash.push(hash);
                        }
                    } else {
                        const
                            fn_body = `(l:Lexer):void => {${output.stmts.join("\n")}}`,
                            name = runner.add_constant(fn_body, fn_name);

                        for (const s of id_syms) {
                            const hash = `${s.id + (runner.ANNOTATED ? `/* ${s.val} */` : "")},${name}`;
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
                            const hash = `${translateSymbolValue(s, grammar, runner.ANNOTATED)},${name}`;
                            ty_stmt.push(`${ty_name}.set(${hash})`);
                            map_hash.push(hash);
                        }
                    }
                }

                const hash_string = map_hash.sort().join("");
                ty_name = runner.add_statement(hash_string, ty_name, ty_stmt.join("\n"));
            }

            statements.push(...[
                id.length > 0 ? `if(${id_name}.has(l.id)){${id_name}.get(l.id)(l); ${REDUCE_FUNCTIONS ? "return;" : ""}}` : "",
                ty.length > 0 ? `if(${ty_name}.has(l.ty)){${ty_name}.get(l.ty)(l); ${REDUCE_FUNCTIONS ? "return;" : ""}}` : "",
                af.length > 0 ? pa_stmts.join(" else ") : ""
            ].filter(s => s));
        }
    }

    return statements;
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
    ll_fns: RDProductionFunction[] = null

    reached_rds: Set<number> = new Set
): { body_stmts: string[], pre_stmts: string[]; } {
    const
        existing_refs: Set<number> = new Set(),
        statements: string[] = [],
        pre_statements: string[] = [],
        active_gotos: number[] = [];

    const item = state.items[0], symbol = item.sym(grammar)?.val;

    const { body: sr_body, pre: sr_pre } = shiftReduce(state, states, grammar, runner, ll_fns, active_gotos, reached_rds),
        goto_statements = gotoState(state, states, grammar, runner, existing_refs, active_gotos);


    pre_statements.push(...sr_pre);

    statements.push(...sr_body);

    if (goto_statements.length > 0) statements.push("const sp: u32 = stack_ptr;");
    statements.push(...goto_statements);

    return { body_stmts: statements, pre_stmts: pre_statements };
}

export function renderState(
    state: State,
    states: State[],
    grammar: Grammar,
    runner: CompilerRunner,
    ll_fns: RDProductionFunction[] = null,
    reached_rds: Set<number> = new Set
): string {

    const stmts = [],

        fn_header: string = runner.ANNOTATED
            ?
            `function ${state.name ? state.name : "State" + state.index
            } (l: Lexer): void{
                /*\n${state.items
                .setFilter(i => i.id)
                .map(
                    i => i.renderUnformattedWithProductionAndFollow(grammar) + ((i.sym(grammar)?.type == SymbolType.PRODUCTION)
                        ? (": " + i.getProduction(grammar).id)
                        : (""))
                ).join(";\n")}\n*/`

            : `function ${state.name ? state.name : "State" + state.index}(l:Lexer):void{`;


    const { body_stmts, pre_stmts } = compileState(state, states, grammar, runner, ll_fns, reached_rds);

    stmts.push(...body_stmts);

    if (state.name) {
        const production = grammar[state.prod_id];

        if (production.recovery_handler)
            addRecoveryHandlerToFunctionBodyArray(stmts, production, grammar, runner);
    }
    return [...pre_stmts, fn_header, ...stmts, "}"].join("\n");
};

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

            state.function_string = renderState(state, states, grammar, runner, ll_fns, reached_rds);

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
