"use strict";
import StateResolver from "./state_resolver_mt.js";
import { isMainThread, workerData } from "worker_threads";
import {
    REDUCE,
    FORK,
} from "../common/state_action_enums.js";
import {
    shiftReduceCollision,
    reduceCollision
} from "./error.mjs";


class GLStateResolver extends StateResolver {

    getActionIterator(state){
        return [...state.actions.values()].flatMap(s => s.name == FORK ? [s, ...s.actions] : s);
    }

    createFork(grammar, ...existing_actions) {
        const existing_action = existing_actions[0];

        return {
            name: FORK,
            actions: [...existing_actions],
            symbol_type: existing_action.symbol_type,
            symbol: existing_action.symbol,
            state_real_id: existing_action.state_real_id,
            state: -1,
            body: existing_action.id,
            item: existing_action.item,
            registered: new Set(existing_actions.map(i => i.id))
        };
    }
    //*
    handleShiftReduceCollision(grammar, state, shift_action, reduce_action, errors) {

        const symbol = shift_action.symbol;

        if (reduce_action.name == REDUCE && reduce_action.item.len == 0)
            return state.actions.set(symbol, shift_action);

        shiftReduceCollision(grammar,state,  shift_action, reduce_action, errors);

        const fork = this.createFork(grammar, shift_action, reduce_action);

        state.actions.set(symbol, fork);

        fork.actions.sort((a, b) => a.name < b.name ? -1 : 1);
    }

    handleReduceCollision(grammar, state, existing_reduce, new_reduce, errors) {

        const symbol = existing_reduce.symbol;

        if (existing_reduce.state_real_id == new_reduce.state_real_id, errors)
            return;

        reduceCollision(grammar, state, existing_reduce, new_reduce, errors);

        const fork = this.createFork(grammar, existing_reduce, new_reduce);

        state.actions.set(symbol, fork);

        fork.actions.sort((a, b) => a.name < b.name ? -1 : 1);
    }

    handleForkOtherActionCollision(state, fork_action, other_action) {

        const item = other_action.item;
        if (!fork_action.registered.has(item.id)) {
            fork_action.registered.add(item.id);
            fork_action.actions.push(other_action);
            fork_action.actions.sort((a, b) => a.name < b.name ? -1 : 1);
        }
    }

    handleForkReduceCollision(grammar, state, fork_action, reduce_action) {
        this.handleForkOtherActionCollision(state, fork_action, reduce_action);
    }

    handleForkShiftCollision(grammar, state, fork_action, shift_action) {
        this.handleForkOtherActionCollision(state, fork_action, shift_action);
    } //*/
}

import { LRMultiThreadProcessWorker, LRMultiThreadRunner } from "./lr_mt.mjs";

if (!isMainThread) {

    const { grammar, env_path, id } = workerData;

    new LRMultiThreadProcessWorker(grammar, env_path, id);

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