/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { HCG3Grammar } from "source/typescript/types/grammar_nodes.js";
import { Item } from "../../utilities/item.js";
import { parentPort, workerData } from "worker_threads";
import { ParserEnvironment } from "../../types/parser_environment.js";
import { HybridDispatch, HybridDispatchResponse } from "../../types/worker_messaging.js";
import "../../utilities/array_globals.js";
import { constructHybridFunctionParser } from "../function_constructor.js";
import { createRunner, Helper } from "../helper.js";
import { constructTableParser } from '../table_constructor.js';
import { productions } from '../../../../../../../../projects/lib_candle_library/node_modules/@candlelib/css/build/types/css.js';

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
    runner: Helper;

    pp: typeof parentPort;

    constructor(wd = workerData, pp = parentPort) {

        const { grammar, env_path, id, ANNOTATED, DEBUG } = wd;

        this.grammar = grammar;

        this.id = id;

        this.runner = createRunner(ANNOTATED, DEBUG);

        this.pp = pp;

        this.start();
    }
    start() {

        const grammar = this.grammar;

        filloutWorkerGrammar(this.grammar);

        this.pp.on("message", (job: HybridDispatch) => {

            let Response: HybridDispatchResponse = {};

            if (false) {
                const { fn, productions } = constructHybridFunctionParser(this.grammar.productions[job.production_id], this.grammar, this.runner);
                Response.fn = fn;
                Response.productions = productions;
            } else {
                const { tables, id } = constructTableParser(this.grammar.productions[job.production_id], this.grammar, this.runner);
                Response.tables = tables;
            }

            Response.production_id = job.production_id;
            Response.const_map = this.runner.constant_map;
            parentPort.postMessage(Response);

            this.runner.constant_map.clear();
        });
    }
}

if (workerData && parentPort)
    new Worker();