/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { HCG3Grammar } from "../../types/grammar_nodes";
import { ParserEnvironment } from "../../types/parser_environment.js";
import { HybridDispatch, HybridDispatchResponse } from "../../types/worker_messaging.js";
import { constructHybridFunction } from "../function_constructor.js";
import { constructCompilerRunner, Helper } from "../helper.js";



export class LocalWorker {

    grammar: HCG3Grammar;
    env: ParserEnvironment;
    id: number;
    runner: Helper;

    response: any;

    parent_postMessage: (data: HybridDispatchResponse) => void;

    constructor(wd, postMessage) {

        const { workerData: { grammar, env_path, id, ANNOTATED, DEBUG } } = wd;

        this.grammar = grammar;

        this.env = { functions: {} };

        this.id = id;

        this.runner = constructCompilerRunner(ANNOTATED, DEBUG);

        this.response = null;

        this.parent_postMessage = postMessage;
    }

    postMessage(job: HybridDispatch) {


        let Response: HybridDispatchResponse = {};

        const { fn, productions } = constructHybridFunction(this.grammar.productions[job.production_id], this.grammar, this.runner);



        Response.fn = fn;
        Response.productions = productions;
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