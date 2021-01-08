import { Worker } from "worker_threads";

import { Grammar } from "../types/grammar.js";
import { ParserEnvironment } from "../types/parser_environment";
import { HybridDispatchResponse, HybridJobType, HybridDispatch } from "./types/hybrid_mt_msg_types.js";
import { CompilerRunner } from "./types/CompilerRunner.js";
import { RDProductionFunction } from "./types/RDProductionFunction.js";
import { SC } from "./utilities/skribble.js";

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
    functions: Array<RDProductionFunction>;
    errors: any;
    to_process_rd_fn: number[];
    runner: CompilerRunner;
    IN_FLIGHT_JOBS: number;

    constructor(
        grammar: Grammar,
        env: ParserEnvironment,
        runner: CompilerRunner,
        number_of_workers = 2
    ) {
        let id = 0;

        this.grammar = grammar;
        this.runner = runner;
        this.env = env;
        this.to_process_rd_fn = this.grammar.map((a, i) => i + 1);
        this.IN_FLIGHT_JOBS = 0;
        this.functions = [];
        this.RUN = true;

        this.module_url = ((process.platform == "win32") ?
            import.meta.url.replace(/file\:\/\/\//g, "")
            : (new URL(import.meta.url)).pathname)
            .replace("hybrid_mt_runner", "hybrid_mt_worker");

        this.number_of_workers = number_of_workers;
        this.workers = (new Array(this.number_of_workers))
            .fill(0)
            .map(() => ({
                id,
                READY: true,
                target: new Worker(this.module_url, { workerData: { id: id++, grammar, ANNOTATED: runner.ANNOTATED, DEBUG: runner.DEBUG } })
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

    mergeWorkerData(worker: WorkerContainer, response: HybridDispatchResponse) {

        this.IN_FLIGHT_JOBS--;

        const { const_map, fn, productions, production_id } = response;

        const fn_data = SC.Bind(fn);

        this.runner.join_constant_map(const_map, fn_data);

        this.functions[production_id] = {
            id: 0,
            fn: fn_data,
            productions: productions,
            str: fn_data.renderCode()
        };

        worker.READY = true;
    }

    *run() {

        while (this.RUN) {

            //Load all available workers with jobs
            for (let i = 0; i < this.number_of_workers; i++) {

                const worker = this.workers[i];

                if (worker.READY) {

                    let JOB: HybridDispatch = { job_type: HybridJobType.UNDEFINED };

                    // Dispatch all LL functions first
                    for (let i = 0; i < this.to_process_rd_fn.length; i++) {

                        const production_id = this.to_process_rd_fn[i];

                        if (production_id > 0) {
                            JOB.job_type = HybridJobType.CONSTRUCT_RD_FUNCTION;
                            JOB.production_id = production_id - 1;
                            this.to_process_rd_fn[i] = 0;
                            this.IN_FLIGHT_JOBS++;
                            break;
                        }
                    }

                    if (JOB.job_type != HybridJobType.UNDEFINED) {

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
                COMPLETE: false
            };
        }

        //trace ll states from root and set productions
        const pending = [this.functions[0], ...this.functions.filter(f => f.RENDER)], reached = new Set([0]);

        try {
            for (let i = 0; i < pending.length; i++) {
                const fn = pending[i];
                fn.RENDER = true;
                for (const production of fn.productions.values()) {
                    if (!reached.has(production)) {
                        pending.push(this.functions[production]);
                        reached.add(production);
                    }
                }
            }
        } catch (e) {
            return yield {
                jobs: 0,
                errors: [e],
                COMPLETED: true
            };
        }

        //Clean up workers.
        this.workers.forEach(wk => wk.target.terminate());

        return yield {
            jobs: this.IN_FLIGHT_JOBS,
            errors: this.errors,
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
            COMPLETE: true
        };
    }
};