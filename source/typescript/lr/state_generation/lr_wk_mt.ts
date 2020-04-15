import { filloutGrammar } from "../../util/common.js";
import { Item } from "../../util/item.js";
import StateProcessor from "./state_processor_mt.js";
import { Grammar } from "../../types/grammar.js";
import { ParserEnvironment } from "../../types/parser_environment.js";
import { ItemSet } from "../../types/item_set.js";
import { CompilerErrorStore } from "./compiler_error_store.js";
import { workerData, parentPort } from "worker_threads";

export class LRMultiThreadProcessWorker {
    processor: StateProcessor;
    grammar: Grammar;
    env: ParserEnvironment;
    id: number;
    constructor() {
        const { grammar, env_path, id } = workerData;
        this.processor = new StateProcessor;
        this.grammar = grammar;
        this.env = { functions: {} };
        this.id = id;
        this.start(env_path);
    }
    async start(env_path: string) {
        const grammar = this.grammar;
        await this.setupEnvironment(env_path);
        filloutGrammar(this.grammar, this.env);
        const bodies = this.grammar.bodies;
        grammar.graph_id = 0;
        for (const body of grammar.bodies) {
            const production = body.production;
            if (production.graph_id < 0) {
                production.graph_id = grammar.graph_id++;
            }
        }
        parentPort.on("message", (d: {
            item_set: ItemSet;
        }) => {
            const item_obj = Object.assign({}, d.item_set);
            item_obj.items = item_obj.items.map(i => Item.fromArray(i));
            const result = this.runItem(item_obj);
        });
    }
    async setupEnvironment(env_path) {
        if (env_path) {
            let ext = env_path.split(".").reverse()[0];
            this.env = (await import("file://" + env_path)).default;
        }
    }
    runItem(item_obj) {
        const grammar = this.grammar;
        const error = new CompilerErrorStore();
        const { to_process_items, state, error: state_error } = this.processor.process(item_obj.items, item_obj.state_id, grammar, item_obj.excludes, error);
        state.thread_id = this.id;
        if (state_error)
            console.log(state_error);
        //sanitize items and remove anything thet is not strictly needed per item. 
        parentPort.postMessage({ to_process_items, state, errors: error.strings.length > 0 ? error.strings : null });
    }
}

new LRMultiThreadProcessWorker();