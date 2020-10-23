import { Worker } from "worker_threads";

import { Grammar, SymbolType } from "../types/grammar.js";
import { ParserEnvironment } from "../types/parser_environment";
import { Item } from "../util/item.js";
import { HybridDispatchResponse, HybridJobType, HybridDispatch } from "./hybrid_mt_msg_types.js";
import { State } from "./State.js";
import { mergeState } from "./lr_hybrid.js";
import { renderStates } from "./lr_hybrid_render.js";
import { constructCompilerRunner, CompilerRunner } from "./CompilerRunner.js";
import { JSNode, JSNodeType, exp } from "@candlefw/js";
import { translateSymbolValue } from "./utilities.js";

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
        let id = 0;


        this.RUN = true;

        var t = this;
        this.i = 0;

        this.lr_states = new Map;
        this.grammar = grammar;
        this.env = env;
        this.total_items = 0;
        this.number_of_workers = 8;
        this.lr_states = new Map;
        this.to_process_ll_fn = this.grammar.map((a, i) => i + 1);
        this.IN_FLIGHT_JOBS = 0;
        this.ll_functions = [];
        this.lr_item_set = [];
        this.runner = constructCompilerRunner(0);

        this.module_url = ((process.platform == "win32") ?
            import.meta.url.replace(/file\:\/\/\//g, "")
            : (new URL(import.meta.url)).pathname)
            .replace("hybrid_mt_runner", "hybrid_mt_worker");

        this.workers = (new Array(this.number_of_workers))
            .fill(0)
            .map(() => ({
                id,
                READY: true,
                target: new Worker(this.module_url, { workerData: { id: id++, grammar } })
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
        this.parser = `(b)=>{
            const pos = null;
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
                        return \`\${(start > 0 ?" ": "")+lex.str.slice(start, mid) + "•" + lex.str.slice(mid, end) + ((end == string_length) ? "$EOF" : " ")}\`;
                    }\n`: ""
            }
            function lm(lex, syms) { 
                for (const sym of syms) 
                    switch (typeof sym) {
                        case "number":
                            if (sym == 0xFF && lex.END) return true;  
                            if (lex.ty == sym) return true; 
                            break;
                        case "string":
                            if (lex.tx == sym) return true
                            break;
                    }
                return false;
            }
            
            function fail(lex, e) { 


                if(e.FAILED) console.log("_______________________________")
                e.FAILED = true;
                e.error.push(lex.copy());
            }
            
            function _s(s, lex, e, eh, skips, ...syms) {
                
                if(e.FAILED) return "";
                
                var val = lex.tx;
               
                if (syms.length == 0 || lm(lex, syms)) {
               
                    lex.next();
               
                    if (skips) while (lm(lex, skips)) lex.next();
               
                    e.sp++;
            
                    s.push(val);
                    
                } else {
               
                    //error recovery
                    const tx = eh(lex, e);
            
               
                    if(!tx){
                        if(e.FAILED) console.log("_______________________________a")
                        e.FAILED = true;
                        e.error.push(lex.copy());
                    }
                }
            
                return s;
            }
            
            
            function _(lex, e, eh, skips, ...syms) {

                if(e.FAILED) return "";
                
                var val = lex.tx;

                if(e.FAILED) console.log("_______________________________a")
               
                if (syms.length == 0 || lm(lex, syms)) {
               
                    lex.next();
               
                    if (skips) while (lm(lex, skips)) lex.next();
               
                    return val;
                } else {
               
                    //error recovery
                    const tx = eh(lex, e);
               
                    if(tx) return tx;
               
                    else {
                        if(e.FAILED) console.log("_______________________________b")
                        e.FAILED = true;
                        e.error.push(lex.copy());
                    }
                }
            }
            
    
            ${ fns.join("\n")}
            
            return Object.assign( function (lexer, env = {
                error: [],
                eh: (lex, e) => { },
                sp:0,
                asi: (lex, env, s) => { }
            }) {
                
                env.FAILED = false;
                const states = [];
                lexer.IWS = false;
                lexer.PARSE_STRING = true;
                ${this.grammar?.meta?.symbols?.size > 0 ? `lexer.addSymbols(${[...this.grammar.meta.symbols.values()].map(translateSymbolValue).join(",")});` : ""}
                lexer.tl = 0;
            
                env.fn =  {
                    parseString(lex, env, symbols, LR){
                        const copy = lex.copy();
                        while(lex.tx != '"' && !lex.END){
                            if(lex.tx == "\\\\") lex.next();
                            lex.next();
                        } 
                        symbols[LR ? symbols.length-1 : 0] = lex.slice(copy)
                    }
                }
                _(lexer, env, env.eh,[])
                const result = $${ this.grammar[0].name}(lexer, env);
                
                if (!lexer.END || (env.FAILED )) {
            
                        const error_lex = env.error.concat(lexer).sort((a,b)=>a.off-b.off).pop();
                        error_lex.throw(\`Unexpected token [\${error_lex.tx}]\`);
                    
                }
                return result;
            })
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
}