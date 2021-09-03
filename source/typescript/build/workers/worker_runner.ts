/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import URI from '@candlelib/uri';
import { GrammarObject } from "source/typescript/types/grammar_nodes.js";
import { RDProductionFunction } from "../../types/rd_production_function.js";
import { WorkerContainer } from "../../types/worker_container";
import { HybridDispatch, HybridDispatchResponse, HybridJobType } from "../../types/worker_messaging.js";
import { LocalWorker } from "./local_worker.js";
export class WorkerRunner {
    grammar: GrammarObject;
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
        grammar: GrammarObject,
        number_of_workers = 2
    ) {

        this.grammar = grammar;

        this.tables = new Map;
        this.to_process_rd_fn = this.grammar.productions.map((a, i) => i + 1);
        this.IN_FLIGHT_JOBS = 0;
        this.functions = [];
        this.RUN = true;

        this.module_url = URI.getEXEURL(import.meta).pathname.replace("worker_runner", "worker");

        this.number_of_workers = number_of_workers;
    }

    mergeWorkerData(worker: WorkerContainer, response: HybridDispatchResponse) {

        const { tables, production_id } = response;

        const production_name = this.grammar.productions[production_id].name;

        for (const [key, val] of tables.entries()) {

            if (this.tables.has(key)) {
                if (key == production_name)
                    this.tables.set(key, val);
            } else
                this.tables.set(key, val);
        }

        this.IN_FLIGHT_JOBS--;

        worker.READY = true;
    }

    async *run() {

        //Load workers. Depending on platform and number of workers, web worker, node worker or local worker

        let id = 0;

        const workerClass = this.number_of_workers <= 1
            ? LocalWorker :
            (typeof globalThis["process"] != "undefined")
                ? (await import("worker_threads")).Worker
                : (class extends Worker {
                    constructor(uri, ...rest) { super(uri, { type: "module" }); }
                    on(event: "error" | "message", handler) {
                        switch (event) {
                            case 'error': this.onmessage = handler; return;
                            case 'message': this.onerror = handler; return;
                        }
                    }
                });

        this.workers = (new Array(this.number_of_workers))
            .fill(0)
            .map((obj) => (obj = <WorkerContainer>{
                id: id++,
                READY: true,
                target: new workerClass(
                    (this.module_url),
                    {},
                    (data: HybridDispatchResponse) => this.mergeWorkerData(<WorkerContainer>obj, data)
                )
            }));

        this.workers.forEach(
            wkr => {

                wkr.target.on("error", e => {
                    console.log({ e });
                    this.RUN = false;
                });

                wkr.target.on("message", data => this.mergeWorkerData(wkr, data));

                wkr.target.postMessage({ job_type: HybridJobType.INITIALIZE, id: wkr.id, grammar: this.grammar });
            }
        );

        while (this.RUN) {

            //Load all available workers with jobs
            for (let i = 0; i < this.number_of_workers; i++) {

                const worker = this.workers[i];

                if (worker.READY) {

                    let JOB = <HybridDispatch>{
                        job_type: HybridJobType.UNDEFINED,
                        production_id: -1
                    };

                    // Dispatch all LL functions first
                    for (let i = 0; i < this.to_process_rd_fn.length; i++) {

                        const production_id = this.to_process_rd_fn[i];

                        if (production_id > 0) {

                            JOB.job_type = HybridJobType.CONSTRUCT_RD_FUNCTION;
                            //@ts-ignore
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

        //Clean up workers.
        this.workers.forEach(wk => wk.target.terminate());

        return yield {
            jobs: this.IN_FLIGHT_JOBS,
            errors: this.errors,
            COMPLETE: true
        };
    }
}