import { parentPort, workerData } from "worker_threads";
import { Grammar } from "../../types/grammar";
import { HybridDispatch, HybridDispatchResponse } from "../../types/worker_messaging.js";
import { ParserEnvironment } from "../../types/parser_environment.js";

import { filloutWorkerGrammar } from "../../util/grammar.js";
import { constructHybridFunction } from "../function_constructor.js";
import { constructCompilerRunner, Helper } from "../helper.js";

export class Worker {

    grammar: Grammar;
    env: ParserEnvironment;
    id: number;
    runner: Helper;

    pp: typeof parentPort;

    constructor(wd = workerData, pp = parentPort) {

        const { grammar, env_path, id, ANNOTATED, DEBUG } = wd;

        this.grammar = grammar;

        this.env = { functions: {} };

        this.id = id;

        this.runner = constructCompilerRunner(ANNOTATED, DEBUG);

        this.pp = pp;

        this.start();
    }
    start() {

        const grammar = this.grammar;

        filloutWorkerGrammar(this.grammar);

        grammar.graph_id = 0;

        this.pp.on("message", (job: HybridDispatch) => {

            let Response: HybridDispatchResponse = {};

            const { fn, productions } = constructHybridFunction(this.grammar[job.production_id], this.grammar, this.runner);

            Response.fn = fn;
            Response.productions = productions;
            Response.production_id = job.production_id;
            Response.const_map = this.runner.constant_map;
            parentPort.postMessage(Response);

            this.runner.constant_map.clear();
        });
    }
}

if (workerData && parentPort)
    new Worker();