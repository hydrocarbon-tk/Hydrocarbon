import { Worker } from "worker_threads";

import { Grammar, SymbolType } from "../types/grammar.js";
import { ParserEnvironment } from "../types/parser_environment";
import { Item } from "../util/item.js";
import { HybridDispatchResponse, HybridJobType, HybridDispatch } from "./types/hybrid_mt_msg_types.js";
import { LRState } from "./types/State.js";
import { mergeState } from "./lr_hybrid.js";
import { renderStates } from "./lr_hybrid_render.js";
import { constructCompilerRunner, CompilerRunner } from "./types/CompilerRunner.js";
import { printLexer } from "./script_generating/hybrid_lexer_template.js";
import { RDProductionFunction } from "./types/RDProductionFunction.js";
import { Symbol } from "../types/Symbol.js";
import { createAssertionFunctionBody } from "../util/common.js";

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
    lr_states: Map<string, LRState>;

    completed_lr_states: LRState[];
    lr_item_set: { old_state: number; items: Item[]; }[];
    total_items: number;
    errors: any;
    to_process_rd_fn: number[];
    runner: CompilerRunner;
    IN_FLIGHT_JOBS: number;

    constructor(grammar: Grammar, env: ParserEnvironment, INCLUDE_ANNOTATIONS: boolean = false) {
        let id = 0;

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

    handleUnprocessedStateItems(potential_states: LRState[], named_state: LRState = null, id = -1) {

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

                        //Start Building LRStateFunctions

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
        this.completed_lr_states = [...this.lr_states.values()].map(s => {
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
                    const { reached_rds } = renderStates([rd.state], this.completed_lr_states, this.grammar, this.runner, this.rd_functions);
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