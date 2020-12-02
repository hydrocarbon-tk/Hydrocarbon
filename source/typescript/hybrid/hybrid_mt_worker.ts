import { Grammar } from "../types/grammar";
import { ParserEnvironment } from "../types/parser_environment.js";
import { filloutGrammar, Item, preCalcLeftRecursion } from "../util/common.js";
import { workerData, parentPort } from "worker_threads";
import { HybridDispatch, HybridJobType, HybridDispatchResponse } from "./types/hybrid_mt_msg_types.js";
import { CompilerRunner, constructCompilerRunner } from "./types/CompilerRunner.js";
import { makeRDHybridFunction } from "./rd_hybrid.js";
import { IntegrateState, CompileHybridLRStates } from "./lr_hybrid.js";

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
            const production = this.grammar[job.production_id];

            switch (job.job_type) {

                case HybridJobType.CONSTRUCT_LR_STATE:
                    Response.potential_states = CompileHybridLRStates(grammar, { old_state: job.item_set.old_state, items: job.item_set.items.map(Item.fromArray) });
                    break;

                case HybridJobType.CONSTRUCT_LR_STATE_FUNCTION:
                    break;

                case HybridJobType.CONSTRUCT_RD_TO_LR_FUNCTION:
                    const { start_state, potential_states } = IntegrateState(production, this.grammar, "$" + production.name);
                    Response.state = start_state;
                    Response.production_id = job.production_id;
                    Response.potential_states = potential_states;
                    break;

                case HybridJobType.CONSTRUCT_RD_FUNCTION:
                    const { IS_RD, fn, productions } = makeRDHybridFunction(this.grammar[job.production_id], this.grammar, this.runner);
                    Response.fn = fn;
                    Response.productions = productions;
                    Response.production_id = job.production_id;
                    Response.CONVERT_RD_TO_LR = !IS_RD;

                    if (IS_RD)
                        Response.const_map = this.runner.constant_map;


                    break;
            }

            parentPort.postMessage(Response);
            this.runner.constant_map.clear();
        });
    }
}

if (workerData && parentPort)
    new HybridMultiThreadProcessWorker();