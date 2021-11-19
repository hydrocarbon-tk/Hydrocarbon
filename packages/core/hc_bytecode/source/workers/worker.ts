/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { GrammarObject, Item } from "@hctoolkit/common";
import { parentPort, MessagePort } from "worker_threads";
import { constructProductionStates } from '../ir_state_compiler/state_constructor.js';
import { HybridDispatch, HybridDispatchResponse, HybridJobType } from "../types/worker_messaging.js";

/**
 * Takes an existing filled out grammar that has been transferred to 
 * a worker and re-implements missing methods for custom types.
 * 
 * So far, the Item class is the only type that needs this "re-hydration"
 */
export function filloutWorkerGrammar(grammar: GrammarObject) {
    for (const [key, val] of grammar.item_map.entries()) {
        val.item = Item.fromArray(val.item);
    }

    for (const [key, array] of grammar.lr_items?.entries() ?? []) {
        const cache = array.slice();

        array.length = 0;

        array.push(...cache.map(i => Item.fromArray(i)));
    }
}

export class Worker {

    grammar?: GrammarObject;
    id: number;
    pp: MessagePort;

    constructor(pp: MessagePort) {

        this.id = -1;

        this.pp = pp;

        this.start();
    }
    start() {

        this.pp.on("message", (job: HybridDispatch) => {

            if (job.job_type == HybridJobType.INITIALIZE) {

                const { grammar, id } = job;

                this.grammar = grammar;

                this.id = id;

                filloutWorkerGrammar(this.grammar);

            } else if (job.job_type == HybridJobType.CONSTRUCT_RD_FUNCTION) {

                if (this.grammar) {

                    let Response: HybridDispatchResponse = <any>{};

                    const { parse_states } =
                        constructProductionStates(this.grammar.productions[job.production_id], this.grammar);

                    Response.states = parse_states;

                    Response.production_id = job.production_id;

                    this.pp.postMessage(Response);
                }
            }
        });
    }
}

if (parentPort)
    new Worker(parentPort);