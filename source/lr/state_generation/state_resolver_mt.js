import {
    ACCEPT,
    SHIFT,
    REDUCE,
    FORK,
    IGNORE,
    ERROR,
    GOTO
} from "../common/state_action_enums.js";
import { Item } from "../../util/common.mjs";
import {
    shiftReduceCollision,
    reduceCollision
} from "./error.mjs";

export default class StateResolver {

    handleShiftReduceCollision(grammar, state, shift_action, reduce_action) {
        shiftReduceCollision(grammar, state, shift_action, reduce_action);
        state.actions.set(shift_action.symbol, shift_action);
    }

    handleReduceCollision(grammar, state, existing_reduce, new_reduce) {

        if (existing_reduce.state_real_id == new_reduce.state_real_id)
            return;

        reduceCollision(grammar, state, existing_reduce, new_reduce);

        const
            body_a = new_reduce.item.body_(grammar),
            body_b = existing_reduce.item.body_(grammar);

        if (body_a.production.graph_id < body_b.production.graph_id)
            state.actions.set(new_reduce.symbol, new_reduce);
        else
            state.actions.set(existing_reduce.symbol, existing_reduce);
    }

    handleForkReduceCollision() {
        //DO Nothing in LALR
    }

    handleForkShiftCollision() {
        //DO Nothing in LALR
    }
    /* 
        Completes the states by converting state_ids to integers and assgning integer state IDs to actions
    */
    complete(states_map, grammar) {
        const states = [...(states_map.values())];

        states.forEach((state, i) => state.id = i);

        for (const state of states) {

            for (const action of state.actions.values()) {
                action.state = states_map.get(action.state_real_id).id;
            }

            for (const goto of state.goto.values()) {
                goto.state = states_map.get(goto.state_real_id).id;
            }

            grammar.meta.ignore.forEach(
                i => i.symbols.forEach((sym) => {
                    if (!state.actions.has(sym.val) && state.grammar_stamp == i.grammar_stamp) {
                        state.actions.set(sym.val, { symbol_type: sym.type, name: IGNORE, state: state.id, body: state.body, len: 0, original_body: state.body });
                    }
                })
            );

            grammar.meta.error.forEach(
                i => i.symbols.forEach((sym) => {
                    if (!state.actions.has(sym.val) && state.grammar_stamp == i.grammar_stamp) {
                        state.actions.set(sym.val, { symbol_type: sym.type, name: ERROR, state: state.id, body: state.body, len: 0, original_body: state.body });
                    }
                })
            );
        }

        states.type = "lr";
        states.map = states_map;
        states.count = states.length;

        return states;
    }

    /* 
        Resolves the merger of a new state into the current set of states. 
        Merges new state if existing state has matching sid.
    */
    resolve(states, new_state, grammar) {

        const sid = new_state.real_id;

        const existing_state = (states.has(sid) ? states.get(sid) : new_state);

        if (!existing_state.goto) {
            existing_state.actions = new Map;
            existing_state.goto = new Map;
        }

        if (!existing_state.actions)
            existing_state.actions = new Map();

        states.set(sid, existing_state);

        for (const action of new_state.to_process_actions) {
            action.item = Item.fromArray(action.item, grammar);

            const symbol = action.symbol;

            //if (action.item.len <= 0) continue;

            if (action.name == GOTO) {
                if (!existing_state.goto.get(symbol))
                    existing_state.goto.set(symbol, action);
                continue;
            }

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
                                this.handleShiftReduceCollision(grammar, existing_state, action, existing_action);
                                break;
                            case FORK:
                                this.handleForkShiftCollision(grammar, existing_state, existing_action, action);
                                break;
                        }
                        break;
                    case REDUCE:
                        if (action.item.len <= 0) continue;

                        switch (existing_action.name) {
                            case ACCEPT:
                                break;
                            case SHIFT:
                                this.handleShiftReduceCollision(grammar, existing_state, existing_action, action);
                                break;
                            case REDUCE:

                                this.handleReduceCollision(grammar, existing_state, action, existing_action);
                                break;
                            case FORK:
                                this.handleForkReduceCollision(grammar, existing_state, existing_action, action);
                                break;
                        }
                        break;
                    case IGNORE:
                    case ERROR:
                    default:
                        if (existing_action.name !== ACCEPT) {
                            if (existing_action.name !== action.name)
                                throw "Conflicting actions";
                            //existing_state.actions.set(symbol, action);
                        }
                }
            }
        }

        existing_state.to_process_actions = [];
    }
}