import compileLRStates from "./lr.mjs";
import StateProcessor from "./state_processor.js";
import { KEEP_EXISTING_ACTION } from "../common/state_parse_action_enums.js";
import { FORK_ACTION } from "../common/state_action_enums.js";

class GLStateProcessor extends StateProcessor {
    createInterceptedReduceAction(state, item, body) {
        const key = item.v;

        const action_intercept = { action: new Map(), id: state.id };

        this.reduceAtSymbol(action_intercept, item.follow, body, item);

        return action_intercept.action.get(key);
    }

    createInterceptedShiftAction(symbol, state, item, body, shift_state) {
        const key = symbol.val;

        const action_intercept = { action: new Map(), id: state.id };

        this.shiftAtSymbol(action_intercept, symbol, body, item, shift_state);

        return action_intercept.action.get(key);
    }


    handleShiftReduceCollision(symbol, grammar, states, state, item, body, shift_state) {
        const key = symbol.val;
        /* 
            Need to check and see if we already have a fork set for this state. 
            If not then we'll add a new fork state. 

            If we do have a fork, then append the reduce action to the fork's actions, 
            ordered by the bodie's production graph-id, descending.
        */
        const
            existing_action = state.action.get(key),
            fork = (existing_action.name == FORK_ACTION)
            ? existing_action
            : (state.action.set(key, {
                name: FORK_ACTION,
                actions: [existing_action],
                symbol_type: symbol.type,
                state: state.id,
                body: body.id,
                offset: item.offset,
                item,
                registered: new Set([existing_action.item.id])
            }), state.action.get(key));

        const action = this.createInterceptedShiftAction(symbol, state, item, body, shift_state);

        if (!fork.registered.has(item.id)) {
            fork.registered.add(item.id);
            fork.actions.push(action);
            fork.actions.sort((a, b) => grammar.bodies[a.body].production.graph_id < grammar.bodies[b.body].production.graph_id ? -1 : 1);
        }

        fork.actions.sort((a, b) => grammar.bodies[a.body].production.graph_id < grammar.bodies[b.body].production.graph_id ? -1 : 1);

        return KEEP_EXISTING_ACTION;
    }


    handleReduceCollision(grammar, states, state, item, body) {
        const key = item.v;
        /* 
            Need to check and see if we already have a fork set for this state. 
            If not then we'll add a new fork state. 

            If we do have a fork, then append the reduce action to the fork's actions, 
            ordered by the bodie's production graph-id, descending.
        */

        const
            existing_action = state.action.get(key),
            fork = (existing_action.name == FORK_ACTION)
            ? existing_action
            : (state.action.set(key, {
                name: FORK_ACTION,
                actions: [existing_action],
                symbol_type: item.follow.type,
                state: state.id,
                body: body.id,
                offset: item.offset,
                item,
                registered: new Set([existing_action.item.id])
            }), state.action.get(key));

        const action = this.createInterceptedReduceAction(state, item, body);

        if (!fork.registered.has(item.id)) {
            fork.registered.add(item.id);
            fork.actions.push(action);
            fork.actions.sort((a, b) => grammar.bodies[a.body].production.graph_id < grammar.bodies[b.body].production.graph_id ? -1 : 1);
        }


        return KEEP_EXISTING_ACTION;
    }
}

export default function* compileStates(grammar, env = {}) {
    return yield* compileLRStates(grammar, env, new GLStateProcessor);
}