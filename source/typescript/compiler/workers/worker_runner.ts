import { Worker } from "worker_threads";
import { Grammar } from "../../types/grammar.js";
import { HybridDispatch, HybridDispatchResponse, HybridJobType } from "../../types/worker_messaging.js";
import { ParserEnvironment } from "../../types/parser_environment";
import { RDProductionFunction } from "../../types/rd_production_function.js";
import { WorkerContainer } from "../../types/worker_container";

import { SC } from "../../utilities/skribble.js";
import { Helper } from "../helper.js";
import { LocalWorker } from "./local_worker.js";
import { worker } from "cluster";



export class WorkerRunner {
    grammar: Grammar;
    RUN: boolean;
    env: ParserEnvironment;
    module_url: string;
    number_of_workers: number;
    workers: Array<WorkerContainer>;
    functions: Array<RDProductionFunction>;
    errors: any;
    to_process_rd_fn: number[];
    runner: Helper;
    IN_FLIGHT_JOBS: number;

    constructor(
        grammar: Grammar,
        env: ParserEnvironment,
        runner: Helper,
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
            .replace("worker_runner", "worker");

        this.number_of_workers = number_of_workers;
        this.workers = (new Array(this.number_of_workers))
            .fill(0)
            .map((obj) => (obj = <WorkerContainer>{
                id,
                READY: true,
                target: this.number_of_workers == 1 ?
                    new LocalWorker(
                        { workerData: { id: id++, grammar, ANNOTATED: runner.ANNOTATED, DEBUG: runner.DEBUG } },
                        (data: HybridDispatchResponse) => this.mergeWorkerData(<WorkerContainer>obj, data)
                    )
                    : new Worker(this.module_url, { workerData: { id: id++, grammar, ANNOTATED: runner.ANNOTATED, DEBUG: runner.DEBUG } })
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

        const { const_map, fn, productions, production_id } = response;

        const fn_data = SC.Bind(fn);

        this.runner.join_constant_map(const_map, fn_data);

        this.functions[production_id] = {
            id: 0,
            fn: fn_data,
            productions: productions,
        };

        this.IN_FLIGHT_JOBS--;

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

            if (
                this.IN_FLIGHT_JOBS < 1
                && this.workers.every(wk => wk.READY)
                && this.to_process_rd_fn.every(i => i == 0)
            ) {

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