"use strict";

import StateResolver from "./state_resolver_mt.js";
import { StateActionEnum } from "../../types/state_action_enums.js";
import {
    shiftShiftCollision,
    shiftReduceCollision,
    reduceCollision,

} from "./error.js";
import { LRMultiThreadRunner } from "./lr_mt.js";
import { ParserAction, LRState } from "../../types/lr_state.js";
import { Grammar } from "../../types/grammar.js";
import { ErrorHandler } from "../../types/parser_data.js";
import { CompilerErrorStore } from "./compiler_error_store.js";

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
            registered: new Set(existing_actions.map(i => i.state_real_id))
        };
    }
    //*
    handleShiftReduceCollision(grammar: Grammar, state: LRState, shift_action: ParserAction, reduce_action: ParserAction, errors: CompilerErrorStore): ParserAction {

        const symbol = shift_action.symbol,
            shift_production = shift_action.item.getProduction(grammar).id,
            reduce_production = reduce_action.item.getProduction(grammar).id;

        //CASE: Both action lead to reduction to same production. Result: Always Shift
        if (shift_production == reduce_production)
            return void state.actions.set(symbol, shift_action);

        shiftReduceCollision(grammar, state, shift_action, reduce_action, errors);

        const fork = this.createFork(grammar, shift_action, reduce_action);

        state.actions.set(symbol, fork);

        fork.actions.sort((a, b) => a.name < b.name ? -1 : 1);
    }

    handleShiftShiftCollision(grammar: Grammar, state: LRState, shift_new_action: ParserAction, shift_existing: ParserAction, errors: CompilerErrorStore) {
        const symbol = shift_new_action.symbol;

        if (shift_new_action.state_real_id !== shift_existing.state_real_id) {

            if (shift_new_action.item.id == shift_existing.item.id) {
                if (shift_new_action.state_real_id.length > shift_existing.state_real_id.length)
                    return void state.actions.set(symbol, shift_new_action);
                else return;
            }

            shiftShiftCollision(grammar, state, shift_new_action, shift_existing, errors);

            const fork = this.createFork(grammar, shift_new_action, shift_existing);

            state.actions.set(symbol, fork);

            fork.actions.sort((a, b) => a.name < b.name ? -1 : 1);
        }
    }

    handleReduceCollision(grammar, state, existing_reduce, new_reduce, errors) {

        const symbol = existing_reduce.symbol;

        if (existing_reduce.state_real_id == new_reduce.state_real_id)
            return;

        reduceCollision(grammar, state, existing_reduce, new_reduce, errors);

        const fork = this.createFork(grammar, existing_reduce, new_reduce);

        state.actions.set(symbol, fork);

        fork.actions.sort((a, b) => a.name < b.name ? -1 : 1);
    }

    handleForkOtherActionCollision(grammar, state, fork_action, other_action, error) {

        const id = other_action.state_real_id;

        if (!fork_action.registered.has(id)) {

            fork_action.registered.add(id);

            fork_action.actions.push(other_action);

            //Ensure Shift actions are performed before reduce. 
            fork_action.actions.sort((a, b) => a.name < b.name ? -1 : 1);
        }
    }

    handleForkReduceCollision(grammar: Grammar, state: LRState, fork_action: ParserAction, reduce_action: ParserAction, error): void {
        this.handleForkOtherActionCollision(grammar, state, fork_action, reduce_action, error);
    }

    handleForkShiftCollision(grammar: Grammar, state: LRState, fork_action: ParserAction, shift_action: ParserAction, error): void {
        this.handleForkOtherActionCollision(grammar, state, fork_action, shift_action, error);
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