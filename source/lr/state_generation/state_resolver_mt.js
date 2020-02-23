import {
    ACCEPT,
    SHIFT,
    REDUCE,
    FORK,
    IGNORE,
    ERROR
} from "../common/state_action_enums.js";
import { gotoCollisionCheck, reduceCollisionCheck, shiftCollisionCheck } from "./error.mjs";
import { Item } from "../../util/common.mjs";

export default class StateResolver {

    handleShiftReduceCollision(state, shift_action, reduce_action) {
        state.action.set(shift_action.symbol, shift_action);
    }

    handleReduceCollision(state, existing_reduce, new_reduce) {

        if (existing_reduce.body_.production.id == new_reduce.body_.production.id)
            return;

        const
            body_a = new_reduce.body_,
            body_b = existing_reduce.body_;

        if (body_a.production.graph_id < body_b.production.graph_id)
            state.action.set(new_reduce.symbol, new_reduce);
        else
            state.action.set(existing_reduce.symbol, existing_reduce);
    }

    handleForkReduceCollision(state, fork_action, reduce_action) {
        //DO Nothing in LALR
    }

    handleForkShiftCollision(state, fork_action, shift_action) {
        //DO Nothing in LALR
    }
    /* 
        Completes the states by converting state_ids to integers and assgning integer state IDs to actions
    */
    complete(states_map, grammar) {
        const states = [...(states_map.values())];

        states.forEach((state, i) => state.id = i);

        for(const state of states){
            for(const action of state.actions.values()){
                action.state = states_map.get(action.state_real_id).id;
            }

            for(const goto of state.goto.values()){
                goto.state = states_map.get(goto.state_real_id).id;   
            }
        }

        if (grammar.meta.ignore) {
            states.forEach(state => {
                grammar.meta.ignore.forEach(
                    i => i.symbols.forEach((sym) => {
                        if (!state.action.has(sym.val) && state.grammar_stamp == i.grammar_stamp) {
                            state.action.set(sym.val, { symbol_type: sym.type, name: IGNORE, state: state.id, body: state.body, len: 0, original_body: state.body });
                        }
                    })
                );

                grammar.meta.error.forEach(
                    i => i.symbols.forEach((sym) => {
                        if (!state.action.has(sym.val) && state.grammar_stamp == i.grammar_stamp) {
                            state.action.set(sym.val, { symbol_type: sym.type, name: ERROR, state: state.id, body: state.body, len: 0, original_body: state.body });
                        }
                    })
                );
            });
        }

        console.log(states);

        return states;
    }

    /* 
        Resolves the merger of a new state into the current set of states. 
        Merges new state if existing state has matching sid.
    */
    resolve(states, new_state, grammar) {

        const sid = new_state.real_id;

        const existing_state = (states.has(sid) ? states.get(sid) : new_state);

        if (!existing_state.actions)
            existing_state.actions = new Map();

        states.set(sid, existing_state);

        for (const action of new_state.to_process_actions) {
            action.item = Item.fromArray(action.item, grammar);

            const symbol = action.symbol;

            const existing_action = existing_state.actions.get(symbol);

            if (!existing_action) {
                existing_state.actions.set(symbol, action);
            } else {
                switch (action.name) {
                    case ACCEPT: //ACCEPT always wins
                        existing_state.actions.set(symbol, action);
                        break;
                    case SHIFT:
                        switch (existing_action.name) {
                            case ACCEPT:
                                break;
                            case SHIFT:
                                if (action.sid !== existing_action.sid)
                                    throw "NEED to fix this bug: shift shift conflicts should not exist in LALR"; //Serious error. The processor FUped;
                                break;
                            case REDUCE:
                                this.handleShiftReduceCollision(existing_state, action, existing_action);
                                break;
                            case FORK:
                                this.handleForkShiftCollision(existing_state, existing_action, action);
                                break;
                            default:
                                existing_state.actions.set(symbol, action);
                        }
                        break;
                    case REDUCE:
                        switch (existing_action.name) {
                            case ACCEPT:
                                break;
                            case SHIFT:
                                this.handleShiftReduceCollision(existing_state, existing_action, action);
                                break;
                            case REDUCE:
                                this.handleReduceCollision(existing_state, action, existing_action);
                                break;
                            case FORK:
                                this.handleForkReduceCollision(existing_state, existing_action, action);
                                break;
                            default:
                                existing_state.actions.set(symbol, action);
                        }
                        break;
                }
            }
        }

        for (const goto of new_state.goto.values()) {
            existing_state.goto.set(goto.symbol, goto);
        }

        existing_state.to_process_actions = null;
    }
}