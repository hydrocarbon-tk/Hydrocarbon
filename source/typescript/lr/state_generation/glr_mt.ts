"use strict";

import StateResolver from "./state_resolver_mt.js";
import { StateActionEnum } from "../../types/state_action_enums.js";
import {
    shiftReduceCollision,
    reduceCollision
} from "./error.js";
import { LRMultiThreadRunner } from "./lr_mt.js";
import { ParserAction, LRState } from "../../types/lr_state.js";
import { Grammar } from "../../types/grammar.js";

class GLStateResolver extends StateResolver {

    getActionIterator(state) {
        return [...state.actions.values()].flatMap(s => s.name == StateActionEnum.FORK ? [s, ...s.actions] : s);
    }

    createFork(grammar: Grammar, ...existing_actions: Array<ParserAction>): ParserAction {
        const existing_action = existing_actions[0];

        return {
            name: StateActionEnum.FORK,
            actions: [...existing_actions],
            symbol_type: existing_action.symbol_type,
            symbol: existing_action.symbol,
            state_real_id: existing_action.state_real_id,
            state: -1,
            item_string: existing_action.item_string,
            body: existing_action.body,
            item: existing_action.item,
            registered: new Set(existing_actions.map(i => i.item_string))
        };
    }
    //*
    handleShiftReduceCollision(grammar, state, shift_action, reduce_action, errors): ParserAction {

        const symbol = shift_action.symbol;

        if (reduce_action.name == StateActionEnum.REDUCE && reduce_action.item.len == 0)
            return state.actions.set(symbol, shift_action);

        shiftReduceCollision(grammar, state, shift_action, reduce_action, errors);

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

    handleForkReduceCollision(grammar: Grammar, state: LRState, fork_action: ParserAction, reduce_action: ParserAction): void {
        this.handleForkOtherActionCollision(state, fork_action, reduce_action);
    }

    handleForkShiftCollision(grammar: Grammar, state: LRState, fork_action: ParserAction, shift_action: ParserAction): void {
        this.handleForkOtherActionCollision(state, fork_action, shift_action);
    } //*/
}

export default function* (grammar, env, env_path) {

    try {
        const runner = new LRMultiThreadRunner(grammar, env, env_path, <typeof StateResolver>GLStateResolver);
        return yield* runner.run();
    } catch (e) {
        return yield {
            errors: { strings: [e] },
            states: { COMPILED: false },
            num_of_states: 0,
            total_items: 0,
            items_left: 0,
            COMPLETE: true
        };
    }
}