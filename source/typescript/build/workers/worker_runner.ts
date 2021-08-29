/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { HCG3Grammar } from "source/typescript/types/grammar_nodes.js";
import { Worker } from "worker_threads";
import { RDProductionFunction } from "../../types/rd_production_function.js";
import { WorkerContainer } from "../../types/worker_container";
import { HybridDispatch, HybridDispatchResponse, HybridJobType } from "../../types/worker_messaging.js";
import { LocalWorker } from "./local_worker.js";
export class WorkerRunner {
    grammar: HCG3Grammar;
    RUN: boolean;
    module_url: string;
    number_of_workers: number;
    workers: Array<WorkerContainer>;
    functions: Array<RDProductionFunction>;
    errors: any;
    to_process_rd_fn: number[];
    IN_FLIGHT_JOBS: number;
    tables: Map<string, string>;

    constructor(
        grammar: HCG3Grammar,
        number_of_workers = 2
    ) {
        let id = 0;

        this.grammar = grammar;

        this.tables = new Map;
        this.to_process_rd_fn = this.grammar.productions.map((a, i) => i + 1);
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
                        { workerData: { id: id++, grammar } },
                        (data: HybridDispatchResponse) => this.mergeWorkerData(<WorkerContainer>obj, data)
                    )
                    : new Worker(this.module_url, { workerData: { id: id++, grammar } })
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

        const { tables } = response;

        for (const [key, val] of tables.entries())
            this.tables.set(key, val);

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