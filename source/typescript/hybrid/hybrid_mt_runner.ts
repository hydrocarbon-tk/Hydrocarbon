import { Worker } from "worker_threads";

import { Grammar, SymbolType } from "../types/grammar.js";
import { ParserEnvironment } from "../types/parser_environment";
import { Item } from "../util/item.js";
import { HybridDispatchResponse, HybridJobType, HybridDispatch } from "./types/hybrid_mt_msg_types.js";
import { State } from "./types/State.js";
import { mergeState } from "./lr_hybrid.js";
import { renderStates } from "./lr_hybrid_render.js";
import { constructCompilerRunner, CompilerRunner } from "./types/CompilerRunner.js";
import { JSNode } from "@candlefw/js";
import { printLexer } from "./assemblyscript/hybrid_lexer.js";
import { RDProductionFunction } from "./types/RDProductionFunction.js";
import { Symbol } from "../types/Symbol.js";
import { createAssertionFunctionBody } from "../util/common.js";

type WorkerContainer = {
    target: Worker;
    id: number;
    READY: boolean;
};


function buildIfs(syms: Symbol[], off = 0, USE_MAX = false) {
    const stmts: string[] = [];

    for (const sym of syms) {
        if (sym.val.length <= off) {
            if (USE_MAX)
                stmts.unshift(`if(length <= ${off}){type = TokenSymbol; this.id =${sym.id}; length = ${off};}`);
            else
                stmts.unshift(`type = TokenSymbol; this.id =${sym.id} /* ${sym.val} */; length = ${off};`);
        }
    }
    let first = true;

    for (const group of syms.filter(s => s.val.length > off).group(s => s.val[off])) {
        if (first)
            stmts.push(`const val: u32 = str.charCodeAt(base+${off})`);
        const v = group[0].val[off];
        stmts.push(
            `${first ? "" : "else "}if(val == ${v.charCodeAt(0)} ){`,
            ...buildIfs(group, off + 1, USE_MAX),
            "}"
        );
        first = false;
    };

    return stmts;
}

export class HybridMultiThreadRunner {
    grammar: Grammar;
    RUN: boolean;
    env: ParserEnvironment;
    module_url: string;
    number_of_workers: number;
    workers: Array<WorkerContainer>;
    rd_functions: Array<RDProductionFunction>;
    lr_states: Map<string, State>;
    lr_item_set: { old_state: number; items: Item[]; }[];
    total_items: number;
    errors: any;
    to_process_rd_fn: number[];
    runner: CompilerRunner;
    IN_FLIGHT_JOBS: number;

    constructor(grammar: Grammar, env: ParserEnvironment, INCLUDE_ANNOTATIONS: boolean = false) {
        let id = 0;

        const syms: Symbol = [], keywords: Symbol = [];

        for (const sym of grammar.meta.all_symbols.values()) {
            if (
                sym.type == SymbolType.SYMBOL
                || sym.type == SymbolType.ESCAPED
                || sym.type == SymbolType.LITERAL
            ) {
                if (sym.type == SymbolType.LITERAL) {
                    keywords.push(sym);
                } else
                    syms.push(sym);
            }
        }

        this.sym_ifs = buildIfs(syms.sort((a, b) => a.id - b.id)).join("\n");
        this.keywords = buildIfs(keywords.sort((a, b) => a.id - b.id), 0, true).join("\n");

        this.RUN = true;

        this.lr_states = new Map;
        this.grammar = grammar;
        this.env = env;
        this.total_items = 0;
        this.number_of_workers = 10;
        this.lr_states = new Map;
        this.to_process_rd_fn = this.grammar.map((a, i) => i + 1);
        this.IN_FLIGHT_JOBS = 0;
        this.rd_functions = [];
        this.lr_item_set = [];
        this.runner = constructCompilerRunner(INCLUDE_ANNOTATIONS);

        this.module_url = ((process.platform == "win32") ?
            import.meta.url.replace(/file\:\/\/\//g, "")
            : (new URL(import.meta.url)).pathname)
            .replace("hybrid_mt_runner", "hybrid_mt_worker");

        this.workers = (new Array(this.number_of_workers))
            .fill(0)
            .map(() => ({
                id,
                READY: true,
                target: new Worker(this.module_url, { workerData: { id: id++, grammar, ANNOTATED: INCLUDE_ANNOTATIONS } })
            }));

        this.workers.forEach(
            wkr => {

                wkr.target.on("error", e => {
                    console.log({ e });
                    this.RUN = false;
                });

                wkr.target.on("message", data => this.mergeWorkerData(wkr, data));
            }
        );
    }

    handleUnprocessedStateItems(potential_states: State[], named_state: State = null, id = -1) {

        if (named_state) {
            named_state.items = named_state.items.map(Item.fromArray);
            named_state = mergeState(named_state, this.lr_states, null, this.lr_item_set);
            named_state.production = id;
            this.rd_functions[id] = {
                id: 0,
                state: named_state,
                IS_RD: false,
                str: "" ?? `"LR USE FOR ${named_state.items.setFilter(i => i.id).map(i => i.getProduction(this.grammar).name)}"`
            };
        }

        for (const state of potential_states) {
            state.items = state.items.map(Item.fromArray);
            const old_state = named_state || [...this.lr_states.values()][state.old_state_index];
            mergeState(state, this.lr_states, old_state, this.lr_item_set);
        }
    }

    mergeWorkerData(worker: WorkerContainer, response: HybridDispatchResponse) {

        this.IN_FLIGHT_JOBS--;

        switch (response.job_type) {

            case HybridJobType.CONSTRUCT_LR_STATE:
                this.handleUnprocessedStateItems(response.potential_states);
                break;

            case HybridJobType.CONSTRUCT_RD_FUNCTION:
                if (response.CONVERT_RD_TO_LR) {
                    this.to_process_rd_fn[response.production_id] = -(response.production_id + 1);
                } else {

                    const { const_map, fn, productions, production_id } = response;

                    this.rd_functions[production_id] = {
                        id: 0,
                        fn: "",
                        productions: productions,
                        IS_RD: true,
                        str: this.runner.join_constant_map(const_map, fn)
                    };
                }
                break;

            case HybridJobType.CONSTRUCT_RD_TO_LR_FUNCTION:


                this.handleUnprocessedStateItems(response.potential_states, response.state, response.production_id);

                break;

            case HybridJobType.CONSTRUCT_LR_STATE_FUNCTION:
                break;
        }

        worker.READY = true;
    }

    *run() {

        let last = 0;

        //@ts-ignore
        while (this.RUN) {
            //Load all available workers with jobs

            for (let i = 0; i < this.number_of_workers; i++) {

                const worker = this.workers[i];

                if (worker.READY) {

                    let JOB: HybridDispatch = { job_type: HybridJobType.UNDEFINED };

                    o: while (true) {

                        // Dispatch all LL functions first
                        for (let i = 0; i < this.to_process_rd_fn.length; i++) {

                            const production_id = this.to_process_rd_fn[i];

                            if (production_id > 0) {
                                JOB.job_type = HybridJobType.CONSTRUCT_RD_FUNCTION;
                                JOB.production_id = production_id - 1;
                                this.to_process_rd_fn[i] = 0;
                                this.IN_FLIGHT_JOBS++;
                                break o;
                            } else if (production_id < 0) {
                                // Convert all LL to fn fns if need be
                                JOB.job_type = HybridJobType.CONSTRUCT_RD_TO_LR_FUNCTION;
                                JOB.production_id = (-production_id) - 1;
                                this.to_process_rd_fn[i] = 0;
                                this.IN_FLIGHT_JOBS++;
                                break o;
                            }
                        }

                        // Dispatch the remaining LR items
                        if (this.lr_item_set.length > 0) {
                            const item_set = this.lr_item_set.shift();
                            JOB.job_type = HybridJobType.CONSTRUCT_LR_STATE;
                            JOB.item_set = item_set;
                            this.IN_FLIGHT_JOBS++;
                            break o;
                        }

                        break o;
                    }

                    if (JOB.job_type != HybridJobType.UNDEFINED) {

                        last = i;

                        worker.READY = false;

                        worker.target.postMessage(JOB);
                    } else {
                        break;
                    }
                }
            }

            if (this.IN_FLIGHT_JOBS < 1) {

                yield {
                    wk: this.workers.some(w => w.READY),
                    v: this.to_process_rd_fn,
                    jobs: this.IN_FLIGHT_JOBS,
                    errors: this.errors,
                    num_of_states: this.lr_states.size,
                    total_items: this.total_items,
                    items_left: this.lr_item_set.length,
                    COMPLETE: false
                };
                //No more jobs means we are done!
                this.RUN = false;
                break;
            }

            yield {
                wk: this.workers.some(w => w.READY),
                v: this.to_process_rd_fn,
                jobs: this.IN_FLIGHT_JOBS,
                errors: this.errors,
                num_of_states: this.lr_states.size,
                total_items: this.total_items,
                items_left: this.lr_item_set.length,
                COMPLETE: false
            };
        }

        //Compile LR Functions
        const states = [...this.lr_states.values()].map(s => {
            s.items = s.items.map(Item.fromArray);
            return s;
        });

        //trace ll states from root and set productions
        const pending = [this.rd_functions[0], ...this.rd_functions.filter(f => f.RENDER)], reached = new Set([0]);

        try {
            for (let i = 0; i < pending.length; i++) {
                const rd = pending[i];
                rd.RENDER = true;
                if (rd.IS_RD) {
                    for (const production of rd.productions.values()) {
                        if (!reached.has(production)) {
                            pending.push(this.rd_functions[production]);
                            reached.add(production);
                        }
                    }
                } else {
                    //Build the state
                    const { reached_rds } = renderStates([rd.state], states, this.grammar, this.runner, this.rd_functions);
                    for (const production of reached_rds.values()) {
                        if (!reached.has(production)) {
                            pending.push(this.rd_functions[production]);
                            reached.add(production);
                        }
                    }
                }
            }
        } catch (e) {
            console.dir(e);
            process.exit();
        }

        const fns = [...this.rd_functions.filter(l => l.RENDER).map(fn => fn.str), ...states.filter(s => s.REACHABLE).map(s => s.function_string)];

        const assert_functions = new Map;
        //Identify required assert functions. 
        for (const sym of [...this.grammar.meta.all_symbols.values()]
            .filter(s => s.type == SymbolType.PRODUCTION_ASSERTION_FUNCTION)
        ) {
            const fn_name = <string>sym.val;
            if (this.grammar.functions.has(fn_name)) {
                const val = this.grammar.functions.get(fn_name),
                    txt = createAssertionFunctionBody(val.txt, this.grammar);

                assert_functions.set(fn_name, `function __${fn_name}__(l:Lexer):boolean{${txt}}`);
            }
        }
        //Compile Function  
        this.parser = `
const 
    action_array_offset = (191488 << 1),
    error_array_offset = action_array_offset + (1048576 << 2),
    TokenSpace: i32 = 1,
    TokenNumber: i32 = 2,
    TokenIdentifier: i32 = 3,
    TokenNewLine: i32 = 4,
    TokenSymbol: i32 = 5,
    TypeSymbol: i32 = 6,
    id: u16 = 2, 
    num: u16 = 4;

var
    mark_: u32 = 0,
    action_ptr: u32 = 0,
    error_ptr: u32 = 0,
    stack_ptr: u32 = 0,
    str: string = "", 
    FAILED: boolean = false, 
    prod: i32 = -1;

${printLexer(this.sym_ifs, this.keywords)}

function set_error(val: u32): void {
    store<u32>(((error_ptr++ & 0xFF) << 2) + error_array_offset, val);
}

function set_action(val: u32):void{
    store<u32>(((action_ptr++) << 2) + (action_array_offset), val);
}

function completeProductionPlain(len: u32, production: u32): void {
    stack_ptr -= len;
    prod = production;
}

function completeProduction(body: u32, len: u32, production: u32): void {
    add_reduce(len, body);
    prod = production;
}

function completeGOTO1(l:Lexer, sp:u32, a:u32, A:u32):void{
    if (sp <= stack_ptr) prod = a;
    if (A != a) soft_fail(l); else FAILED = false;
}

function completeGOTO2(l:Lexer, sp:u32, a:u32, A:u32, B:u32):void{
    if (sp <= stack_ptr) prod = a;
    if (A != a && B != a) soft_fail(l); else FAILED = false;
}

function completeGOTO3(l:Lexer, sp:u32, a:u32, A:u32, B:u32, C:u32):void{
    if (sp <= stack_ptr) prod = a;
    if (A != a && B != a && C != a) soft_fail(l); else FAILED = false;
}

function completeGOTO4(l:Lexer, sp:u32, a:u32, A:u32, B:u32, C:u32, D:u32):void{
    if (sp <= stack_ptr) prod = a;
    if (A != a && B != a&& C != a&& D != a) soft_fail(l); else FAILED = false;
}

@inline
function mark (): u32{
    mark_ = action_ptr;
    return mark_;
}

@inline
function reset(mark:u32): void{
    action_ptr = mark;
}

@inline
function add_skip(char_len: u32): void {
    const ACTION: u32 = 3;
    const val: u32 = ACTION | (char_len << 2);
    set_action(val);
}

function add_shift(char_len: u32): void {
    stack_ptr++;
    const ACTION: u32 = 2;
    const val: u32 = ACTION | (char_len << 2);
    set_action(val);
}

@inline
function add_reduce(sym_len: u32, body: u32): void {
    stack_ptr -= sym_len;
    const ACTION: u32 = 1;
    const val: u32 = ACTION | ((sym_len & 0x3FFF) << 2) | (body << 16);
    set_action(val);
}

@inline
function lm(lex:Lexer, syms: StaticArray<u32>): boolean { 

    const l = syms.length;

    for(let i = 0; i < l; i++){
        const sym = syms[i];
        if(lex.id == sym || lex.ty == sym) return true;
    }

    return false;
}

function fail(lex:Lexer):void { 
    prod = -1;
    soft_fail(lex)
}

function soft_fail(lex:Lexer):void { 
    FAILED = true;
    set_error(lex.off);
}

function setProduction(production: u32):void{
    prod = (-FAILED) +  (-FAILED+1) * production;
}   

function _pk(lex: Lexer, /* eh, */ skips: StaticArray<u32>): Lexer {

    lex.next();

    if (skips) while (lm(lex, skips)) lex.next();

    return lex;
}            

function _skip(lex: Lexer, skips: StaticArray<u32>):void{
    const off: u32 = lex.off;
    while (lm(lex, skips)) lex.next();
    const diff: i32 = lex.off-off;
    if(diff > 0) add_skip(diff);
}

function _no_check_with_skip(lex: Lexer, skips: StaticArray<u32>):void {
    add_shift(lex.tl);
    lex.next();
    _skip(lex, skips);
}

function _no_check(lex: Lexer):void {
    add_shift(lex.tl);
    lex.next();
}

function _with_skip(lex: Lexer, skips: StaticArray<u32>, sym: u32 = 0):void {

    if(FAILED) return;
    
    if (sym == 0 || lex.id == sym || lex.ty == sym) {
        _no_check_with_skip(lex, skips);
    } else {
        //TODO error recovery
        soft_fail(lex);
    }
}
        
function _(lex: Lexer, sym: u32 = 0):void {

    if(FAILED) return;
    
    if (sym == 0 || lex.id == sym || lex.ty == sym) {
        _no_check(lex);
    } else {
        //TODO error recovery
        soft_fail(lex);
    }
}

var prob_index = 0;
//For Debugging
function probe(l: Lexer, id: u32 = 1): void {
    set_error(prob_index + 1001 + id * 10000);
    set_error(l.ty);
    set_error(l.id);
    set_error(l.tl);
    set_error(prod);
    set_error(FAILED);
    set_error(prob_index++ + 2001 + id * 10000);
}

${[...assert_functions.values()].join("\n")}
${this.runner.render_constants()}
${this.runner.render_statements()}
${fns.join("\n    ")}

function reset_pointers(): void{
    prod = -1; 

    stack_ptr = 0;

    error_ptr = 0;

    action_ptr = 0;
}

export default function main (input_string:string): boolean {

    str = input_string;

    const lex = new Lexer();

    lex.next();

    reset_pointers();

    FAILED = false;

    $${this.grammar[0].name}(lex);

    set_action(0);

    set_error(0);

    return FAILED || !lex.END;    
}`;

        this.js_resolver = `import { shared_memory, action_array, error_array } from "./hc_parser_buffers.js";
        
        import loader from "@assemblyscript/loader";
        import URL from "@candlefw/url";
        import Lexer from "@candlefw/wind";
        
        const fns = [(e,sym)=>sym[sym.length-1], ${this.grammar.meta.reduce_functions.map((b, i) => {
            if (b.includes("return")) {

                return b.replace("return", "(env, sym, pos)=>(").slice(0, -1) + ")";
            } else {
                return `(env, sym)=>new (class{constructor(env, sym, pos){${b}}})(env, sym)`;
            }
        }).join("\n,")
            }];

        export default async function loadParser(){

            await URL.server();

            const wasmModule = await loader.instantiate(await URL.resolveRelative("./recognizer.wasm").fetchBuffer(), { env: { memory: shared_memory } }),
            
            { main, __allocString } = wasmModule.exports;

            return function (str, env = {}) {

                const 
                    FAILED = main(__allocString(str)), // call with pointers
                    aa = action_array,
                    er = error_array,
                    stack = [];
                
                let action_length = 0;
            
                if (FAILED) {
                    
                    let error_off = 0;
                    
                    for(let i = 0; i < er.length && er[i]; i++)
                        error_off  = Math.max(error_off, er[i]);
                    
                    const lexer = new Lexer(str);
                        
                    while (lexer.off < error_off && !lexer.END) lexer.next();
                        
                    console.log(lexer, error_off, str.length, er);
            
                    lexer.throw(\`Unexpected token[\${ lexer.tx }]\`);
            
                } else {
                    
                    let offset = 0;
            
                    o: for (const action of aa) {
                        action_length++;
                        switch (action & 3) {
                            case 0: //ACCEPT
                                break o;
                            case 1: //REDUCE;
                                var 
                                    body = action >> 16,
                                    len = ((action & 0xFFFF) >> 2);
                                stack[stack.length - len] = fns[body](env, stack.slice(-len), {});
                                stack.length = stack.length - len + 1;
                                break;
                            case 2: //SHIFT;
                                var len = action >> 2;
                                stack.push(str.slice(offset, offset + len));
                                offset += len;
                                break;
                            case 3: //SKIP;
                                var len = action >> 2;
                                offset += len;
                                break;
                        }
                    }
                }
            
                return { result: stack, FAILED: !!FAILED, action_length };
            }
        }`;

        //Clean up workers.
        this.workers.forEach(wk => wk.target.terminate());

        return yield {
            jobs: this.IN_FLIGHT_JOBS,
            errors: this.errors,
            num_of_states: this.lr_states.size,
            total_items: this.total_items,
            items_left: this.lr_item_set.length,
            COMPLETE: true
        };
    }
}

export default function* (grammar: Grammar, env: ParserEnvironment, INCLUDE_ANNOTATIONS: boolean = false) {

    try {
        const runner = new HybridMultiThreadRunner(grammar, env, INCLUDE_ANNOTATIONS);
        return yield* runner.run();
    } catch (e) {
        return yield {
            errors: { strings: [e] },
            states: { COMPILED: false },
            num_of_states: 0,
            total_items: 0,
            items_left: 0,
            COMPLETE: true
        };
    }
};