import { Grammar } from "../types/grammar";
import { ParserEnvironment } from "../types/parser_environment.js";
import { filloutGrammar, Item } from "../util/common.js";
import { workerData, parentPort } from "worker_threads";
import { HybridDispatch, HybridJobType, HybridDispatchResponse } from "./hybrid_mt_msg_types";
import { CompilerRunner, constructCompilerRunner } from "./CompilerRunner.js";
import { makeLLHybridFunction } from "./ll_hybrid.js";
import { IntegrateState, CompileHybridLRStates } from "./lr_hybrid.js";

export class HybridMultiThreadProcessWorker {

    grammar: Grammar;
    env: ParserEnvironment;
    id: number;
    runner: CompilerRunner;

    constructor() {

        const { grammar, env_path, id } = workerData;

        this.grammar = grammar;

        this.env = { functions: {} };

        this.id = id;

        this.runner = constructCompilerRunner(0);

        this.start();
    }
    start() {

        const grammar = this.grammar;

        filloutGrammar(this.grammar, this.env);

        grammar.graph_id = 0;

        for (const body of grammar.bodies) {

            const production = body.production;

            if (production.graph_id < 0)
                production.graph_id = grammar.graph_id++;
        }

        parentPort.on("message", (job: HybridDispatch) => {

            let Response: HybridDispatchResponse = {
                job_type: job.job_type
            };
            const production = this.grammar[job.production_id];
            //*
            switch (job.job_type) {

                case HybridJobType.CONSTRUCT_LR_STATE:
                    Response.potential_states = CompileHybridLRStates(grammar, { old_state: job.item_set.old_state, items: job.item_set.items.map(Item.fromArray) });
                    break;

                case HybridJobType.CONSTRUCT_LR_STATE_FUNCTION:
                    break;

                case HybridJobType.CONSTRUCT_RCLR_FUNCTION:
                    const { start_state, potential_states } = IntegrateState(production, this.grammar, "$" + production.name);
                    Response.state = start_state;
                    Response.production_id = job.production_id;
                    Response.potential_states = potential_states;
                    break;

                case HybridJobType.CONSTRUCT_RC_FUNCTION:
                    const { L_RECURSION, fn } = makeLLHybridFunction(this.grammar[job.production_id], this.grammar, this.runner);
                    Response.fn = fn;
                    Response.production_id = job.production_id;
                    Response.CONVERT_RC_TO_LR = L_RECURSION;
                    break;
            }
            //*/

            parentPort.postMessage(Response);
        });
    }
}

new HybridMultiThreadProcessWorker();