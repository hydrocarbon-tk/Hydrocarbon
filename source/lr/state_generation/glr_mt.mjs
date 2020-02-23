"use strict";
import StateProcessor from "./state_processor_mt.js";
import StateResolver from "./state_resolver_mt.js";
import { isMainThread, workerData } from "worker_threads";
import {
    ERROR,
    IGNORE
} from "../common/state_action_enums.js";

class GLStateProcessor extends StateProcessor{}
class GLStateResolver extends StateResolver{
    /*
    handleShiftReduceCollision(state, shift_action, reduce_action) {
        state.actions.set(shift_action.symbol, shift_action);
    }

    handleReduceCollision(state, existing_reduce, new_reduce) {

        if (existing_reduce.item.body_(grammar).production.id == new_reduce.item.body_(grammar).production.id)
            return;

        const
            body_a = new_reduce.body_(grammar),
            body_b = existing_reduce.body_(grammar);

        if (body_a.production.graph_id < body_b.production.graph_id)
            state.actions.set(new_reduce.symbol, new_reduce);
        else
            state.actions.set(existing_reduce.symbol, existing_reduce);
    }

    handleForkReduceCollision(state, fork_action, reduce_action) {
        //DO Nothing in LALR
    }

    handleForkShiftCollision(state, fork_action, shift_action) {
        //DO Nothing in LALR
    }*/
}

import { LRMultiThreadProcessWorker, LRMultiThreadRunner } from "./lr_mt.mjs";

if (!isMainThread) {

    const { grammar, env_path, id } = workerData;

    new LRMultiThreadProcessWorker(grammar, env_path, id, GLStateProcessor);

}

export default function*(grammar, env, env_path) {

    try {
        const runner = new LRMultiThreadRunner(grammar, env, env_path, GLStateResolver);
        return yield* runner.run();
    } catch (e) {
        return yield {
            error: { e },
            states: { COMPILED: false },
            num_of_states: 0,
            total_items: 0,
            items_left: 0,
            COMPLETE: true
        };
    }
}