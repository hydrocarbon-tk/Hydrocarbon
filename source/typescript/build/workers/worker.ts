/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { HCG3Grammar } from "source/typescript/types/grammar_nodes.js";
import { parentPort, workerData } from "worker_threads";
import { HybridDispatch, HybridDispatchResponse } from "../../types/worker_messaging.js";
import "../../utilities/array_globals.js";
import { Item } from "../../utilities/item.js";
import { constructTableParser } from '../table_constructor.js';

/**
 * Fillout Worker Grammar
 * 
 * Takes an existing filled out grammar that has been transferred to 
 * a worker and re-implements missing methods for custom types.
 * 
 * Returns nothing
 */
export function filloutWorkerGrammar(grammar: HCG3Grammar) {
    for (const [key, val] of grammar.item_map.entries()) {
        val.item = Item.fromArray(val.item);
    }
}

export class Worker {

    grammar: HCG3Grammar;
    id: number;
    pp: typeof parentPort;

    constructor(wd = workerData, pp = parentPort) {

        const { grammar, env_path, id, ANNOTATED, DEBUG } = wd;

        this.grammar = grammar;

        this.id = id;

        this.pp = pp;

        this.start();
    }
    start() {

        filloutWorkerGrammar(this.grammar);

        this.pp.on("message", (job: HybridDispatch) => {

            let Response: HybridDispatchResponse = {};

            const { tables, id } = constructTableParser(this.grammar.productions[job.production_id], this.grammar);

            Response.tables = tables;

            Response.production_id = job.production_id;

            parentPort.postMessage(Response);
        });
    }
}

if (workerData && parentPort)
    new Worker();