/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { HCG3Grammar } from "../../types/grammar_nodes";
import { ParserEnvironment } from "../../types/parser_environment.js";
import { HybridDispatch, HybridDispatchResponse } from "../../types/worker_messaging.js";
import { constructHybridFunctionParser } from "../function_constructor.js";
import { constructTableParser } from "../table_constructor.js";
import { createRunner, Helper } from "../helper.js";



export class LocalWorker {

    grammar: HCG3Grammar;
    id: number;
    runner: Helper;

    response: any;

    parent_postMessage: (data: HybridDispatchResponse) => void;

    constructor(wd, postMessage) {

        const { workerData: { grammar, env_path, id, ANNOTATED, DEBUG } } = wd;

        this.grammar = grammar;

        this.id = id;

        this.runner = createRunner(ANNOTATED, DEBUG);

        this.response = null;

        this.parent_postMessage = postMessage;
    }

    postMessage(job: HybridDispatch) {


        let Response: HybridDispatchResponse = {};

        if (false) {
            const { fn, productions } = constructHybridFunctionParser(this.grammar.productions[job.production_id], this.grammar, this.runner);
            Response.fn = fn;
            Response.productions = productions;
        } else {
            const { tables, id } = constructTableParser(this.grammar.productions[job.production_id], this.grammar, this.runner);
            Response.tables = tables;
        }

        console.log("\\\\\ \n\n\n");
        Response.production_id = job.production_id;
        Response.const_map = this.runner.constant_map;

        this.parent_postMessage(Response);

        this.runner.constant_map.clear();
    }

    on(type, fn) {
        if (type == "message")
            this.response = fn;
    }

    get target() { return this; }

    terminate() { }
}