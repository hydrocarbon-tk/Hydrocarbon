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
import { makeRDHybridFunction } from "./rd_hybrid.js";

type WorkerContainer = {
    target: Worker;
    id: number;
    READY: boolean;
};

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

    to_process_ll_fn: number[];

    runner: CompilerRunner;

    IN_FLIGHT_JOBS: number;
    constructor(grammar: Grammar, env: ParserEnvironment, INCLUDE_ANNOTATIONS: boolean = false) {
        let id = 0, i = 10;

        const syms = [], keywords = [];

        for (const sym of grammar.meta.all_symbols.values()) {
            if (
                sym.type == SymbolType.SYMBOL
                || sym.type == SymbolType.ESCAPED
                || sym.type == SymbolType.LITERAL
            ) {
                if (sym.type == SymbolType.LITERAL) {
                    keywords.push([sym.val, i]);
                } else
                    syms.push([sym.val, i]);
                sym.id = i++;
            }
        }

        function buildIfs(syms: [string, number][], off = 0, USE_MAX = false) {
            const stmts: string[] = [];

            for (const sym of syms) {
                if (sym[0].length == 0) {
                    if (USE_MAX)
                        stmts.unshift(`if(length <= ${off}){this.id =${sym[1]}; length = ${off};}`);
                    else
                        stmts.unshift(`this.id =${sym[1]}; length = ${off};`);
                }
            }
            let first = true;

            for (const group of syms.filter(s => s[0].length > 0).group(s => s[0][0])) {
                if (first)
                    stmts.push(`const val: u32 = str.charCodeAt(base+${off})`);
                const v = group[0][0][0];
                stmts.push(
                    `${first ? "" : "else "}if(val == ${v.charCodeAt(0)} ){`,


                    ...buildIfs(group.map(s => [s[0].slice(1), s[1]]), off + 1, USE_MAX),
                    "}"
                );
                first = false;
            };

            return stmts;
        }

        this.sym_ifs = buildIfs(syms.sort((a, b) => a[0] - b[0])).join("\n");
        this.keywords = buildIfs(keywords.sort((a, b) => a[0] - b[0]), 0, true).join("\n");

        this.RUN = true;

        this.lr_states = new Map;
        this.grammar = grammar;
        this.env = env;
        this.total_items = 0;
        this.number_of_workers = 10;
        this.lr_states = new Map;
        this.to_process_ll_fn = this.grammar.map((a, i) => i + 1);
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
                    process.exit();
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
            const old_state = named_state || [...this.lr_states.values()][state.os];

            state.items = state.items.map(Item.fromArray);

            let merged_state = mergeState(state, this.lr_states, old_state, this.lr_item_set);
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
                    this.to_process_ll_fn[response.production_id] = -(response.production_id + 1);
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
                        for (let i = 0; i < this.to_process_ll_fn.length; i++) {

                            const production_id = this.to_process_ll_fn[i];

                            if (production_id > 0) {
                                JOB.job_type = HybridJobType.CONSTRUCT_RD_FUNCTION;
                                JOB.production_id = production_id - 1;
                                this.to_process_ll_fn[i] = 0;
                                this.IN_FLIGHT_JOBS++;
                                break o;
                            } else if (production_id < 0) {
                                // Convert all LL to fn fns if need be
                                JOB.job_type = HybridJobType.CONSTRUCT_RD_TO_LR_FUNCTION;
                                JOB.production_id = (-production_id) - 1;
                                this.to_process_ll_fn[i] = 0;
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
                    v: this.to_process_ll_fn,
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
                v: this.to_process_ll_fn,
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

        const root_states = [];
        let lr_nodes = [];

        //trace ll states from root and set productions
        const pending = [this.rd_functions[0], ...this.rd_functions.filter(f => f.RENDER)], reached = new Set([0]);
        try {
            for (let i = 0; i < pending.length; i++) {
                const ll = pending[i];
                ll.RENDER = true;
                if (ll.IS_RD) {
                    // console.log({ ll: ll.productions });
                    for (const production of ll.productions.values()) {
                        if (!reached.has(production)) {
                            pending.push(this.rd_functions[production]);
                            reached.add(production);
                        }
                    }
                } else {
                    //Build the state
                    const { reached_rds } = renderStates([ll.state], states, this.grammar, this.runner, this.rd_functions);
                    //console.log({ reached_rds });
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


        //Compile Function  
        this.parser = `
var str: string = "", FAILED:boolean = false, prod:i32 = -1, stack_ptr:u32 = 0;

${printLexer(this.sym_ifs, this.keywords)}

var 

    action_array: Uint32Array = new Uint32Array(1048576), 
    error_array:Uint32Array= new Uint32Array(512),
    mark_: u32 = 0, 
    pointer: u32  = 0,
    error_ptr: u32  = 0;

function error_mark(val:u32):void{
    error_array[error_ptr++] = val;
}

@inline
function mark (): u32{
    mark_ = pointer;
    return mark_;
}

@inline
function reset(mark:u32): void{
    pointer = mark;
}

@inline
function add_skip(char_len:u32): void{
    const ACTION: u32 = 3;
    const val: u32 = ACTION | (char_len << 2);
    unchecked(action_array[pointer++] = val);
}

function add_shift(char_len:u32): void{
    if(char_len < 1) return;
    const ACTION: u32 = 2;
    const val: u32 = ACTION | (char_len << 2);
    unchecked(action_array[pointer++] = val);
}

function add_reduce(sym_len:u32, body:u32): void{
    const ACTION: u32 = 1;
    const val: u32 = ACTION | ((sym_len & 0x3FFF )<< 2) | (body << 16);
    unchecked(action_array[pointer++] = val);
}

@inline
function lm(lex:Lexer, syms: u32[]): boolean { 

    const l = syms.length;

    for(let i = 0; i < l; i++){
        const sym = syms[i];
        if(lex.id == sym || lex.ty == sym) return true;
    }

    return false;
}

function fail(lex:Lexer):void { 
    prod = -1;
    FAILED = true;
    error_array[error_ptr++] = lex.off;
}

function setProduction(production: u32):void{
    prod = (-FAILED) +  (-FAILED+1) * production;
}   

function _pk(lex: Lexer, /* eh, */ skips: u32[]): Lexer {

    lex.next();

    if (skips) while (lm(lex, skips)) lex.next();

    return lex;
}            

function _no_check(lex: Lexer, /* eh, */ skips: u32[]):void {
    add_shift(lex.tl);

    lex.next();

    const off: u32 = lex.off;

    if (skips) while (lm(lex, skips)) lex.next();

    const diff: i32 = lex.off-off;

    if(diff > 0) add_skip(diff);
}
        
function _(lex: Lexer, /* eh, */ skips: u32[], sym: u32 = 0):void {

    if(FAILED) return;
    
    if (sym == 0 || lex.id == sym || lex.ty == sym) {
        _no_check(lex, skips);
    } else {
        //TODO error recovery
        FAILED = true;
        error_array[error_ptr++] = lex.off;
    }
}
        
${this.runner.render_constants()}
${this.runner.render_statements()}
${fns.join("\n    ")}

export class Export {

    FAILED: boolean;

    er: Uint32Array;
    
    aa: Uint32Array;

    constructor(f:boolean, er:Uint32Array, aa: Uint32Array){
        this.FAILED = f;
        this.er = er;
        this.aa = aa;
    }

    getFailed(): boolean { return this.FAILED; }
    
    getActionList(): Uint32Array { return this.aa; }
    
    getErrorOffsets(): Uint32Array { return this.er; }
}
        
export default function main (input_string:string): Export {

    str = input_string;

    const lex = new Lexer();

    lex.next();

    prod = -1; 

    stack_ptr = 0;

    error_ptr = 0;

    pointer = 0;

    FAILED = false;

    $${ this.grammar[0].name}(lex);

    action_array[pointer++] = 0;

    return new Export(
            FAILED || !lex.END,
        error_array.subarray(0, error_ptr),
        action_array.subarray(0, pointer)
    );    
}`;

        this.js_resolver = `  
import { jump_table } from "./jump_table.js";

import fs from "fs";

import loader from "@assemblyscript/loader";

import URL from "@candlefw/url";
import Lexer from "@candlefw/wind";

await URL.server();

const wasmModule = loader.instantiateSync(fs.readFileSync(URL.resolveRelative("./build/untouched.wasm") + "")),
    { main, __allocString, __getUint32ArrayView, __getUint16ArrayView, __retain, __release, Export } = wasmModule.exports,
    wasm_jump_table = __getUint16ArrayView(wasmModule.exports.jump_table.value);

for (let i = 0; i < jump_table.length; i++)
    wasm_jump_table[i] = jump_table[i];

        

const fns = [${
            this.grammar.bodies.map(b => {
                if (b.reduce_function)
                    return `\n      //${b.id} :: ${new Item(b.id, b.length, 0, null).renderUnformattedWithProduction(this.grammar)}\n` + b.reduce_function.txt.replace("return", "sym=>(").slice(0, -1) + ")";
                else
                    return "";
            }).join("\n,")
            }];

export default function jsmain(str) {

    let strPtr = __retain(__allocString(str));
    let exportPtr = main(strPtr); // call with pointers

    const exports = Export.wrap(exportPtr);

    const FAILED = exports.getFailed();
    const aaPtr = exports.getActionList();
    const erPtr = exports.getErrorOffsets();

    const aa = __getUint32ArrayView(aaPtr);
    const er = __getUint32ArrayView(erPtr);

    const stack = [];
    let action_length = 0;

    if (FAILED) {

        const error_off = er.sort((a, b) => b - a)[0];

        const lexer = new Lexer(str);

        console.log(lexer, error_off, str.length, er);

        while (lexer.off < error_off) lexer.next();

        console.log(lexer.throw(\`Unexpected token[\${ lexer.tx }]\`));

    } else if (true) {
        //Build out the productions

        let offset = 0;

        o: for (const action of aa) {
            action_length++;
            if (action == 0) break;

            switch (action & 3) {
                case 0: //ACCEPT
                    return stack[0];

                case 1: //REDUCE;
                    var body = action >> 16;

                    
                    var len = ((action & 0xFFFF) >> 2);
                    
                    const fn = fns[body];
                    
                    
                    if (fn)
                        stack[stack.length - len] = fn(stack.slice(-len));
                    else if (len > 1)
                        stack[stack.length - len] = stack[stack.length - 1];

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

    __release(erPtr);
    __release(aaPtr);
    __release(exportPtr);
    __release(strPtr);

    return { result: stack, FAILED: !!FAILED, action_length };
}  `;

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

function updateStateIDLU(rl_states: State[], ids: any[] = []): JSNode[][] {
    return rl_states.reduce((r, a, i) => (r[i] ? null : (r[i] = []), r), ids);
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