/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { GrammarObject } from "@hctoolkit/common";
import { constructProductionStates } from "../ir_state_compiler/state_constructor.js";
import { HybridDispatch, HybridDispatchResponse, HybridJobType } from "../types/worker_messaging.js";

export class LocalWorker {

    grammar?: GrammarObject;
    id: number;
    response: any;
    parent_postMessage: (data: HybridDispatchResponse) => void;

    constructor(uri: string, worker_data: any, postMessage: (data: HybridDispatchResponse) => void) {

        this.id = -1;

        this.response = null;

        this.parent_postMessage = postMessage;
    }

    postMessage(job: HybridDispatch) {

        if (job.job_type == HybridJobType.INITIALIZE) {

            const { grammar, id } = job;

            this.grammar = grammar;

            this.id = id;

        } else if (job.job_type == HybridJobType.CONSTRUCT_RD_FUNCTION) {

            if (this.grammar) {

                let Response: HybridDispatchResponse = <any>{};

                const { parse_states, id } = constructProductionStates(this.grammar.productions[job.production_id], this.grammar);

                Response.states = parse_states;

                Response.production_id = job.production_id;

                this.parent_postMessage(Response);
            }
        }
    }

    on(type: string, fn: (t: any) => any) {
        if (type == "message")
            this.response = fn;
    }

    get target() { return this; }

    terminate() { }
}