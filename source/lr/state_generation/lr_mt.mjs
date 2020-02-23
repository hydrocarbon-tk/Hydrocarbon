"use strict";
import url from "url";
import { filloutGrammar } from "../../util/common.mjs";
import { Item } from "../../util/item.mjs";
import StateProcessor from "./state_processor_mt.js";
import StateResolver from "./state_resolver_mt.js";
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import os from 'os';
import {
    ERROR,
    IGNORE
} from "../common/state_action_enums.js";


export class LRMultiThreadProcessWorker {

    constructor(grammar, env_path, id, processor_constructor = StateProcessor) {

        this.processor = new processor_constructor;

        this.grammar = grammar;

        this.env = { functions: {} };

        this.id = id;

        this.start(env_path);
    }

    async start(env_path) {
        const grammar = this.grammar;

        await this.setupEnvironemnt(env_path);

        filloutGrammar(this.grammar, this.env);

        const bodies = this.grammar.bodies;

        grammar.graph_id = 0;

        for (const body of grammar.bodies) {
            const production = body.production;
            if (production.graph_id < 0) {
                production.graph_id = grammar.graph_id++;
            }
        }

        parentPort.on("message", d => {
            const item_obj = Object.assign({}, d.item_set);
            item_obj.items = item_obj.items.map(i => Item.fromArray(i, this.grammar));
            const result = this.runItem(item_obj);
        })
    }

    async setupEnvironemnt(env_path) {
        if (env_path) {
            let ext = env_path.split(".").reverse()[0];
            this.env = (await import("file://" + env_path)).default;
        }
    }

    runItem(item_obj) {

        const grammar = this.grammar;

        const errors = [];

        const error = {
            log(...vals) {
                errors.push(`${vals.map(e=>typeof e !== "string" ? JSON.stringify(e).replace(/"/g,"") : e).join(", ")}`);
            }
        };

        const { to_process_items, state, error: state_error } = this.processor.process(item_obj.items, item_obj.state_id, grammar, item_obj.excludes, error, true);

        state.thread_id = this.id;

        if (state_error) {
            console.log(state_error);
        }

        //sanitize items and remove anything thet is not strictly needed per item. 
        parentPort.postMessage({ to_process_items, state, errors: errors.length > 0 ? errors : null });
    }
}

export class LRMultiThreadRunner {

    constructor(grammar, env, env_url, resolver_constructor = StateResolver) {

        this.resolver = new StateResolver();

        this.grammar = grammar;

        this.RUN = true;

        this.env = env;

        filloutGrammar(this.grammar, this.env);

        this.module_url = (process.platform == "win32") ?
            import.meta.url.replace(/file\:\/\/\//g, "")
            : (new URL(
                import.meta.url)).pathname;

        this.number_of_workers = Math.max(1, os.cpus().length - 2);

        console.log({
            ["number of workers"]: this.number_of_workers
        })

        let id = 0;

        this.workers = (new Array(this.number_of_workers)).fill(0).map(() => ({ id, READY: true, target: new Worker(this.module_url, { workerData: { id: id++, grammar, env_url } }) }));

        this.workers.forEach(
            wkr => {

                wkr.target.on("error", e => {
                    console.log(e)
                    this.RUN = false;
                });

                wkr.target.on("message", (data) => {
                    this.mergeWorkerData(wkr, data.to_process_items, data.state, data.errors)
                })
            }
        );

        this.states = new Map();

        this.item_set = [];

        this.messages = [];

        this.active = 0;

        this.total_items = 0;


        this.processed_states = new Map();
    }

    resolveNewState(state) {

        this.resolver.resolve(this.states, state, this.grammar);
    }

    async mergeWorkerData(wkr, to_process_items, state, errors) {

        this.total_items += to_process_items.length;

        this.item_set.push(...(to_process_items.filter(i => {
            const id = i.state_id.id,
                sym = i.state_id.sym;

            if (this.processed_states.has(id)) {
                const set = this.processed_states.get(id)

                if (set.has(sym))
                    return false;

                set.add(sym);
            } else this.processed_states.set(id, new Set(i.sym));
            return true;
        })));

        this.resolveNewState(state);

        wkr.READY = true;

        this.active--;

    }

    *run() {

        this.item_set = [{ items: [new Item(0, this.grammar.bodies[0].length, 0, { v: "$eof", p: 0, type: "generated" }, this.grammar)], excludes: [], state_id: { id: "start" } }];

        this.total_items = 1;

        while (this.RUN) {

            if (this.active == 0 && this.item_set.length == 0)
                this.RUN = false;

            for (const worker of this.workers) {

                if (worker.READY && this.item_set.length > 0) {

                    this.active++;

                    worker.target.postMessage({
                        item_set: this.item_set.shift()
                    })

                    worker.READY = false;
                }
            }

            yield {
                error: this.errors,
                states: this.states,
                num_of_states: this.states.size,
                total_items: this.total_items,
                items_left: this.item_set.length,
                COMPLETE: false
            };
        }

        this.workers.forEach(wk => wk.target.terminate());

        const states = this.resolver.complete(this.states, this.grammar);

        states.COMPILED = true;

        return yield {
            error: this.errors,
            states,
            num_of_states: this.states.size,
            total_items: this.total_items,
            items_left: this.item_set.length,
            COMPLETE: true
        };
    }
}

if (!isMainThread) {

    const { grammar, env_path, id } = workerData;

    new LRMultiThreadProcessWorker(grammar, env_path, id);

}

export default function*(grammar, env, env_path) {

    try {
        const runner = new LRMultiThreadRunner(grammar, env, env_path);
        return yield* runner.run();
    } catch (e) {
        return yield {
            error: { e },
            states: { COMPILED: false },
            num_of_states: 0,
            total_items: 0,
            items_left: 0,
            COMPLETE: true
        }
    }
}