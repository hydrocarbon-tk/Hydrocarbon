/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { HCG3Grammar } from "../../types/grammar_nodes";
import { HybridDispatch, HybridDispatchResponse } from "../../types/worker_messaging.js";
import { constructTableParser } from "../table_constructor.js";

export class LocalWorker {

    grammar: HCG3Grammar;
    id: number;
    response: any;
    parent_postMessage: (data: HybridDispatchResponse) => void;

    constructor(wd, postMessage) {

        const { workerData: { grammar, env_path, id, ANNOTATED, DEBUG } } = wd;

        this.grammar = grammar;

        this.id = id;

        this.response = null;

        this.parent_postMessage = postMessage;
    }

    postMessage(job: HybridDispatch) {

        let Response: HybridDispatchResponse = {};

        const { tables, id } = constructTableParser(this.grammar.productions[job.production_id], this.grammar);

        Response.tables = tables;

        Response.production_id = job.production_id;

        this.parent_postMessage(Response);
    }

    on(type, fn) {
        if (type == "message")
            this.response = fn;
    }

    get target() { return this; }

    terminate() { }
}