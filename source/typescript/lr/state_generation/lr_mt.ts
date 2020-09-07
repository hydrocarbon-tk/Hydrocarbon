"use strict";

import { Worker } from "worker_threads";

import { filloutGrammar } from "../../util/common.js";
import { Item } from "../../util/item.js";
import StateResolver from "./state_resolver_mt.js";
import * as os from 'os';
import { Grammar, SymbolType } from "../../types/grammar.js";
import { ParserEnvironment } from "../../types/parser_environment.js";
import { LRState } from "../../types/lr_state.js";
import { ItemSet } from "../../types/item_set.js";
import { CompilerErrorStore } from "./compiler_error_store.js";


type WorkerContainer = {
    target: Worker;
    id: number;
    READY: boolean;
};

export class LRMultiThreadRunner {

    resolver: StateResolver;
    grammar: Grammar;
    RUN: boolean;
    env: ParserEnvironment;
    module_url: string;
    number_of_workers: number;
    workers: Array<WorkerContainer>;
    states: Map<string, LRState>;
    item_set: Array<ItemSet>;
    active: number;
    total_items: number;
    errors: any;
    processed_states: Map<string, Set<string>>;

    constructor(grammar: Grammar, env: ParserEnvironment, env_url: string, resolver_constructor = StateResolver) {

        this.resolver = new resolver_constructor();

        this.grammar = grammar;

        this.RUN = true;

        this.env = env;

        filloutGrammar(this.grammar, this.env);

        this.module_url = (process.platform == "win32") ?
            import.meta.url.replace(/file\:\/\/\//g, "")
            : (new URL(import.meta.url)).pathname;

        this.module_url = this.module_url.replace("lr_mt", "lr_wk_mt");

        this.number_of_workers = Math.max(1, os.cpus().length - 2);

        let id = 0;

        this.workers = (new Array(this.number_of_workers)).fill(0).map(() => ({ id, READY: true, target: new Worker(this.module_url, { workerData: { id: id++, grammar, env_url } }) }));

        this.workers.forEach(
            wkr => {

                wkr.target.on("error", e => {
                    function compress(r, i) {
                        const l = r.length - 1;

                        if (+r[l] < 0 && i < 0) {
                            r[l]--;
                        } else {
                            r.push(i);
                        }

                        return r;
                    } (e);
                    this.RUN = false;
                });

                wkr.target.on("message", (data) => {
                    this.mergeWorkerData(wkr, data.to_process_items, data.state, data.errors);
                });
            }
        );

        this.states = new Map();

        this.item_set = [];

        this.active = 0;

        this.total_items = 0;

        this.errors = new CompilerErrorStore;

        this.processed_states = new Map();
    }

    resolveNewState(state: LRState) {
        this.resolver.resolve(this.states, state, this.grammar, this.errors);
    }

    async mergeWorkerData(wkr: WorkerContainer, to_process_items: Array<ItemSet>, state: LRState, errors: any) {

        this.item_set.push(...(to_process_items.filter(i => {
            const id = i.state_id.id,
                sym = i.state_id.sym;

            i.items = i.items.map(i => Item.fromArray(i));

            if (this.processed_states.has(id)) {

                const
                    set = this.processed_states.get(id),
                    out_items = i.items.filter(i => !set.has(i.full_id) && (set.add(i.full_id), true));

                if (out_items.length < 1)
                    return false;


                i.items = out_items;
            } else {

                this.processed_states.set(id, new Set(...i.items.map(i => i.full_id)));
            }

            this.total_items++;

            return true;
        })));

        this.resolveNewState(state);

        wkr.READY = true;

        this.active--;

    }

    *run() {
        //@ts-ignore
        this.item_set = [{ items: [new Item(0, this.grammar.bodies[0].length, 0, { val: "$eof", precedence: 0, type: SymbolType.GENERATED })], excludes: [], state_id: { sym: "$eof", id: "start" } }];

        this.total_items = 1;

        while (this.RUN) {

            if (this.active == 0 && this.item_set.length == 0)
                this.RUN = false;

            for (const worker of this.workers) {

                if (worker.READY && this.item_set.length > 0) {

                    this.active++;

                    worker.target.postMessage({
                        item_set: this.item_set.shift()
                    });

                    worker.READY = false;
                }
            }

            yield {
                errors: this.errors,
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
            errors: this.errors,
            states,
            num_of_states: this.states.size,
            total_items: this.total_items,
            items_left: this.item_set.length,
            COMPLETE: true
        };
    }
}

export default function* (grammar: Grammar, env: ParserEnvironment, env_path: string) {

    try {
        const runner = new LRMultiThreadRunner(grammar, env, env_path);
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