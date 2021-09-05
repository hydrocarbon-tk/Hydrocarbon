/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { GrammarObject } from "../../types/grammar_nodes";
import { HybridDispatch, HybridDispatchResponse, HybridJobType } from "../../types/worker_messaging.js";
import { constructTableParser } from "../table_constructor.js";

export class LocalWorker {

    grammar: GrammarObject;
    id: number;
    response: any;
    parent_postMessage: (data: HybridDispatchResponse) => void;

    constructor(uri: string, worker_data, postMessage) {

        this.grammar = null;

        this.id = -1;

        this.response = null;

        this.parent_postMessage = postMessage;
    }

    postMessage(job: HybridDispatch) {

        const { job_type } = job;

        if (job.job_type == HybridJobType.INITIALIZE) {

            const { grammar, id } = job;

            this.grammar = grammar;

            this.id = id;

        } else if (job.job_type == HybridJobType.CONSTRUCT_RD_FUNCTION) {

            let Response: HybridDispatchResponse = {};

            const { parse_code_blocks: tables, id } = constructTableParser(this.grammar.productions[job.production_id], this.grammar);

            Response.tables = tables;

            Response.production_id = job.production_id;

            this.parent_postMessage(Response);
        }
    }

    on(type, fn) {
        if (type == "message")
            this.response = fn;
    }

    get target() { return this; }

    terminate() { }
}