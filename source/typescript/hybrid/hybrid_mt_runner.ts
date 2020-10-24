import { Worker } from "worker_threads";

import { Grammar, SymbolType } from "../types/grammar.js";
import { ParserEnvironment } from "../types/parser_environment";
import { Item } from "../util/item.js";
import { HybridDispatchResponse, HybridJobType, HybridDispatch } from "./hybrid_mt_msg_types.js";
import { State } from "./State.js";
import { mergeState } from "./lr_hybrid.js";
import { renderStates } from "./lr_hybrid_render.js";
import { constructCompilerRunner, CompilerRunner } from "./CompilerRunner.js";
import { JSNode } from "@candlefw/js";
import { printLexer } from "./ll_lexer.js";

type WorkerContainer = {
    target: Worker;
    id: number;
    READY: boolean;
};

export class HybridMultiThreadRunner {
    llFnBuilder: llFnBuilder,
    lrStateBuilder: LRStateBuilder,
    lrFNBuilder: lrFNBuilder,
    grammar: Grammar;
    RUN: boolean;
    env: ParserEnvironment;
    module_url: string;
    number_of_workers: number;
    workers: Array<WorkerContainer>;

    lr_functions: Array<LRFunction>;
    ll_functions: Array<LLFunction>;
    lr_states: Map<string, State>;

    lr_item_set: { old_state: number; items: Item[]; }[];

    active: number;
    total_items: number;

    errors: any;

    processed_states: Map<string, Set<string>>;

    to_process_ll_fn: number[];

    runner: CompilerRunner;

    IN_FLIGHT_JOBS: number;
    constructor(grammar: Grammar, env: ParserEnvironment) {
        let id = 0, i = 10;

        const ANNOTATED = false;

        const syms = [], keywords = [];

        for (const sym of grammar.meta.all_symbols.values()) {
            if (
                sym.type == SymbolType.SYMBOL
                || sym.type == SymbolType.ESCAPED
                || sym.type == SymbolType.LITERAL
            ) {
                syms.push([sym.val, i]);
                sym.id = i++;
            }
        }

        function buildIfs(syms: [string, number][], off = 0) {
            const stmts: string[] = [];

            for (const sym of syms) {
                if (sym[0].length == 0) stmts.unshift(`this.id =${sym[1]}; length = ${off};`);
            }
            let first = true;

            for (const group of syms.filter(s => s[0].length > 0).group(s => s[0][0])) {
                if (first)
                    stmts.push(`const val: u32 = str.charCodeAt(base+${off})`);
                const v = group[0][0][0];
                stmts.push(
                    `${first ? "" : "else "}if(val == ${v.charCodeAt(0)}){`,

                    ...buildIfs(group.map(s => [s[0].slice(1), s[1]]), off + 1),
                    "}"
                );
                first = false;
            };

            return stmts;
        }

        this.ifs = buildIfs(syms).join("\n");

        this.RUN = true;

        var t = this;
        this.i = 0;

        this.lr_states = new Map;
        this.grammar = grammar;
        this.env = env;
        this.total_items = 0;
        this.number_of_workers = 1;
        this.lr_states = new Map;
        this.to_process_ll_fn = this.grammar.map((a, i) => i + 1);
        this.IN_FLIGHT_JOBS = 0;
        this.ll_functions = [];
        this.lr_item_set = [];
        this.runner = constructCompilerRunner(ANNOTATED);

        this.module_url = ((process.platform == "win32") ?
            import.meta.url.replace(/file\:\/\/\//g, "")
            : (new URL(import.meta.url)).pathname)
            .replace("hybrid_mt_runner", "hybrid_mt_worker");

        this.workers = (new Array(this.number_of_workers))
            .fill(0)
            .map(() => ({
                id,
                READY: true,
                target: new Worker(this.module_url, { workerData: { id: id++, grammar, ANNOTATED } })
            }));

        this.workers.forEach(
            wkr => {

                wkr.target.on("error", e => {
                    console.log(e);

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
            this.ll_functions[id] = {
                IS_RD: false,
                str: `"LR USE FOR ${named_state.items.setFilter(i => i.id).map(i => i.getProduction(this.grammar).name)}"`
            };
        }

        for (const state of potential_states) {
            state.items = state.items.map(Item.fromArray);
            mergeState(state, this.lr_states, named_state || [...this.lr_states.values()][state.os], this.lr_item_set);
        }
    }

    mergeWorkerData(worker: WorkerContainer, response: HybridDispatchResponse) {

        this.IN_FLIGHT_JOBS--;

        switch (response.job_type) {

            case HybridJobType.CONSTRUCT_LR_STATE:
                this.handleUnprocessedStateItems(response.potential_states);
                break;

            case HybridJobType.CONSTRUCT_RC_FUNCTION:
                if (response.CONVERT_RC_TO_LR) {
                    this.to_process_ll_fn[response.production_id] = -response.production_id;
                } else {
                    this.ll_functions[response.production_id] = {
                        IS_RD: true,
                        str: response.fn
                    };
                }
                break;

            case HybridJobType.CONSTRUCT_RCLR_FUNCTION:
                this.handleUnprocessedStateItems(response.potential_states, response.state, response.production_id);
                break;

            case HybridJobType.CONSTRUCT_LR_STATE_FUNCTION:
                break;
        }

        worker.READY = true;
    }

    *run() {

        let JOB: HybridDispatch;

        //@ts-ignore
        e: while (this.RUN) {

            if (!JOB) {

                JOB = { job_type: HybridJobType.UNDEFINED };

                o: while (true) {

                    // Dispatch all LL functions first
                    for (let i = 0; i < this.to_process_ll_fn.length; i++) {

                        const production_id = this.to_process_ll_fn[i];

                        if (production_id > 0) {
                            JOB.job_type = HybridJobType.CONSTRUCT_RC_FUNCTION;
                            JOB.production_id = production_id - 1;
                            this.to_process_ll_fn[i] = 0;
                            this.IN_FLIGHT_JOBS++;
                            break o;
                        } else if (production_id < 0) {
                            // Convert all LL to fn fns if need be
                            JOB.job_type = HybridJobType.CONSTRUCT_RCLR_FUNCTION;
                            JOB.production_id = (-production_id);
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
            }

            if (JOB.job_type !== HybridJobType.UNDEFINED) {

                for (const worker of this.workers) {

                    if (worker.READY) {

                        worker.READY = false;

                        worker.target.postMessage(JOB);

                        JOB = null;

                        break;
                    }
                }
            } else {
                JOB = null;
            }

            if (this.IN_FLIGHT_JOBS < 1) {
                //No more jobs means we are done!
                this.RUN = false;
                break;
            }

            yield {
                wk: this.workers.some(w => w.READY),
                JOB,
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

        const root_states = states.filter(s => !!s.name);

        let lr_nodes = [];

        if (root_states.length > 0) {

            const ids = updateStateIDLU(states);

            lr_nodes = renderStates(root_states, states, this.grammar, this.runner, ids, this.ll_functions, true);
        }

        const fns = [...this.ll_functions.map(fn => fn.str), ...lr_nodes];



        //Compile Function  
        this.parser = `

            var str: string = "", FAILED:boolean = false, prod:i32 = -1, stack_ptr:u32 = 0;

            ${printLexer(this.ifs)}

            var 

                action_array: Uint32Array = new Uint32Array(60000), 
                error_array:Uint32Array= new Uint32Array(512),
                mark_: u32 = 0, 
                pointer: u32  = 0,
                error_ptr: u32  = 0;

            //Inline
            function mark (): u32{
               mark_ = pointer;
               return mark_;
            }

            //Inline
            function reset(mark:u32): void{
                pointer = mark;
            }
            
            //Inline
            function add_skip(char_len:u32): void{
                const ACTION: u32 = 2;
                const val: u32 = ACTION | (char_len << 2);
                action_array[pointer++] = val;
            }

            //Inline
            function add_shift(char_len:u32): void{
                if(char_len < 1) return;
                const ACTION: u32 = 1;
                const val: u32 = ACTION | (char_len << 2);
                action_array[pointer++] = val;
            }

            //Inline
            function add_reduce(sym_len:u32, body:u32): void{
                const ACTION: u32 = 0;
                const val: u32 = ACTION | ((sym_len & 0x3FFF )<< 2) | (body << 16);
                action_array[pointer++] = val;
            }
            
            ${
            this.runner.ANNOTATED ? `function log(...str) {
                        console.log(...str);
                    }\nfunction glp(lex, padding = 4){
                        const token_length = lex.tl;
                        const offset = lex.off;
                        const string_length = lex.sl;
                        const start = Math.max(0, offset - padding);
                        const mid = offset;
                        const end = Math.min(string_length, offset + token_length  + padding);
                        return \`\${(start > 0 ?" ": "")+str.slice(start, mid) + "•" + str.slice(mid, end) + ((end == string_length) ? "$EOF" : " ")}\`;
                    }\n`: ""
            }
            
            function lm(lex:Lexer, syms: u32[]): boolean { 

                const l = syms.length;

                for(let i = 0; i < l; i++){
                    const sym = syms[i];
                    if(lex.id == sym || lex.ty == sym) return true;
                }

                return false;
            }
            
            function fail(lex:Lexer):void { 
                FAILED = true;
                error_array[error_ptr++] = lex.off;
            }
            
            
            function _(lex: Lexer, /* eh, */ skips: u32[], sym: u32 = 0):void {

                if(FAILED) return;
               
                if (sym == 0 || lex.id == sym || lex.ty == sym) {
                    
                    add_shift(lex.tl);

                    lex.next();
               
                    const off: u32 = lex.off;
               
                    if (skips) while (lm(lex, skips)) lex.next();

                    const diff: i32 = lex.off-off;

                    if(diff > 0) add_skip(diff);
                } else {
               
                    //TODO error recovery

                    FAILED = true;
                    error_array[error_ptr++] = lex.off;
                }
            }
            
    
            ${ fns.join("\n")}

            class Export {
                FAILED: boolean;
                er: Uint32Array;
                aa: Uint32Array;
                constructor(f:boolean, er:Uint32Array, aa: Uint32Array){
                    this.FAILED = f;
                    this.er = er;
                    this.aa = aa;
                }
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

                
            const d: Export =  new Export(
                 FAILED || lex.END,
                error_array.slice(0, pointer),
                action_array.slice(0, pointer)
            );  
            
            return d;
        
    
}`;

        this.js_resolver = ` 

        const fns = [${
            this.grammar.bodies.map(b => {
                if (b.reduce_function)
                    return b.reduce_function.txt.replace("return", "sym=>(").slice(0, -1) + ")";
                else
                    return "";
            }).join("\n,")
            }]; ${
            this.runner.ANNOTATED ? `
            console.log(new Array(...action_array.slice(0,pointer)).map(i => {
                const action = ["REDUCE", "SHIFT", "SKIP"][i & 3];
                const body = (action == "REDUCE") ? ":" + (i >> 16) : "";
                const len = (action == "SHIFT" || action == "SKIP") ? i >> 2 : ((i & 0xFFFF) >> 2);
                return \`\${ action }:\${len}\${body}\`
                }))` : ""
            }
                
                if (!lex.END || (env.FAILED )) {
                    
                        const error_off = env.error.concat(lexer.off).sort((a,b)=>a-b).pop();

                        console.log({error_off, e:env.error, lex, sl:str.length, end:lex.END})

                        while(lexer.off < error_off) lexer.next();

                        console.log(lexer.throw(\`Unexpected token [\${lexer.tx}]\`))

                    
                }else{
                    //Build out the productions
                    
            const stack = [], str = lexer.str;
            let offset = 0;

            for(const action of action_array.slice(0, pointer)){
                switch(action&3){
                    case 0: //REDUCE;
                        var body = action>>16;

                        var len = ((action&0xFFFF) >> 2);

                        const fn = fns[body];

                        if(fn)
                            stack[stack.length-len] = fn(stack.slice(-len));
                        else if(len > 1)
                            stack[stack.length-len] = stack[stack.length-1];
                        
                        stack.length = stack.length-len+1;

                        break;
                    case 1: //SHIFT;
                        var len = action >> 2;
                        stack.push(str.slice(offset, offset+len));
                        offset+=len;
                        break;
                    case 2: //SKIP;
                        var len = action >> 2;
                        offset+=len;
                        break;
                }
            }
        `;

        //Clean up workers.
        this.workers.forEach(wk => wk.target.terminate());

        return yield {
            jobs: this.IN_FLIGHT_JOBS,
            errors: this.errors,
            num_of_states: this.lr_states.size,
            total_items: this.total_items,
            items_left: this.lr_item_set.length,
            COMPLETE: true;
        };

    }
}

function updateStateIDLU(rl_states: State[], ids: any[] = []): JSNode[][] {
    return rl_states.reduce((r, a, i) => (r[i] ? null : (r[i] = []), r), ids);
}

export default function* (grammar: Grammar, env: ParserEnvironment) {

    try {
        const runner = new HybridMultiThreadRunner(grammar, env);
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