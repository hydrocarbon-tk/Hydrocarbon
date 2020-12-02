import { Grammar } from "../types/grammar";
import { ParserEnvironment } from "../types/parser_environment.js";
import { filloutGrammar, preCalcLeftRecursion } from "../util/common.js";
import { workerData, parentPort } from "worker_threads";
import { HybridDispatch, HybridDispatchResponse } from "./types/hybrid_mt_msg_types.js";
import { CompilerRunner, constructCompilerRunner } from "./types/CompilerRunner.js";
import { constructHybridFunction } from "./hybrid_function_constructor.js";

export class HybridMultiThreadProcessWorker {

    grammar: Grammar;
    env: ParserEnvironment;
    id: number;
    runner: CompilerRunner;

    pp: typeof parentPort;

    constructor(wd = workerData, pp = parentPort) {

        const { grammar, env_path, id, ANNOTATED } = wd;

        this.grammar = grammar;

        this.env = { functions: {} };

        this.id = id;

        this.runner = constructCompilerRunner(ANNOTATED);

        this.pp = pp;

        this.start();
    }
    start() {

        const grammar = this.grammar;

        filloutGrammar(this.grammar, this.env);
        preCalcLeftRecursion(this.grammar);

        grammar.graph_id = 0;

        this.pp.on("message", (job: HybridDispatch) => {

            let Response: HybridDispatchResponse = {
                job_type: job.job_type
            };

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
    new HybridMultiThreadProcessWorker();