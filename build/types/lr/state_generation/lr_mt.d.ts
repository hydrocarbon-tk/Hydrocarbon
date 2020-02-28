/// <reference types="@types/node" />
import { Worker } from "worker_threads";
import StateProcessor from "./state_processor_mt.js";
import StateResolver from "./state_resolver_mt.js";
import { Grammar } from "../../types/grammar.js";
import { ParserEnvironment } from "../../types/parser_environment.js";
import { LRState } from "../../types/lr_state.js";
import { ItemSet } from "../../types/item_set.js";
declare type WorkerContainer = {
    target: Worker;
    id: number;
    READY: boolean;
};
export declare class LRMultiThreadProcessWorker {
    processor: StateProcessor;
    grammar: Grammar;
    env: ParserEnvironment;
    id: number;
    constructor(grammar: Grammar, env_path: string, id: number, processor_constructor?: typeof StateProcessor);
    start(env_path: string): Promise<void>;
    setupEnvironemnt(env_path: any): Promise<void>;
    runItem(item_obj: any): void;
}
export declare class LRMultiThreadRunner {
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
    constructor(grammar: Grammar, env: ParserEnvironment, env_url: string, resolver_constructor?: typeof StateResolver);
    resolveNewState(state: LRState): void;
    mergeWorkerData(wkr: WorkerContainer, to_process_items: Array<ItemSet>, state: LRState, errors: any): Promise<void>;
    run(): Generator<{
        errors: any;
        states: Map<string, LRState>;
        num_of_states: number;
        total_items: number;
        items_left: number;
        COMPLETE: boolean;
    } | {
        errors: any;
        states: import("../../types/lr_state.js").LRStates;
        num_of_states: number;
        total_items: number;
        items_left: number;
        COMPLETE: boolean;
    }, any, unknown>;
}
export default function (grammar: Grammar, env: ParserEnvironment, env_path: string): Generator<{
    errors: any;
    states: Map<string, LRState>;
    num_of_states: number;
    total_items: number;
    items_left: number;
    COMPLETE: boolean;
} | {
    errors: any;
    states: import("../../types/lr_state.js").LRStates;
    num_of_states: number;
    total_items: number;
    items_left: number;
    COMPLETE: boolean;
} | {
    errors: {
        strings: any[];
    };
    states: {
        COMPILED: boolean;
    };
    num_of_states: number;
    total_items: number;
    items_left: number;
    COMPLETE: boolean;
}, any, unknown>;
export {};
