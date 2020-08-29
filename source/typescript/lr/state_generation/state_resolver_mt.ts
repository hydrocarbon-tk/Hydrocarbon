import { Item } from "../../util/common.js";
import {
    shiftReduceCollision,
    reduceCollision
} from "./error.js";
import { Grammar } from "../../types/grammar.js";
import { LRState, LRStates, ParserAction } from "../../types/lr_state.js";
import { StateActionEnum } from "../../types/state_action_enums.js";
import { CompilerErrorStore } from "./compiler_error_store.js";

export default class StateResolver {


    handleShiftReduceCollision(grammar: Grammar, state: LRState, shift_action: ParserAction, reduce_action: ParserAction, errors: CompilerErrorStore) {
        shiftReduceCollision(grammar, state, shift_action, reduce_action, errors);
        state.actions.set(shift_action.symbol, shift_action);
    }

    handleReduceCollision(grammar: Grammar, state: LRState, existing_reduce: ParserAction, new_reduce: ParserAction, errors: CompilerErrorStore) {


        if (existing_reduce.state_real_id == new_reduce.state_real_id, errors)
            return;
        


        reduceCollision(grammar, state, existing_reduce, new_reduce, errors);



        const
            body_a = new_reduce.item.body_(grammar),
            body_b = existing_reduce.item.body_(grammar);

        if (body_a.production.graph_id < body_b.production.graph_id)
            state.actions.set(new_reduce.symbol, new_reduce);
        else
            state.actions.set(existing_reduce.symbol, existing_reduce);
    }

    handleShiftShiftCollision(grammar: Grammar, state: LRState, existing: ParserAction, new_action: ParserAction, errors) {
        //DO Nothing in LALR
        if (existing.state_real_id !== new_action.state_real_id)
            throw new Error("NEED to fix this bug: shift shift conflicts should not exist in LALR"); //Serious error.
    }

    handleForkReduceCollision(grammar: Grammar, state: LRState, fork_action: ParserAction, reduce_action: ParserAction, errors) {
        //DO Nothing in LALR
    }

    handleForkShiftCollision(grammar: Grammar, state: LRState, fork_action: ParserAction, reduce_action: ParserAction, errors) {
        //DO Nothing in LALR
    }

    getActionIterator(state) {
        return state.actions.values();
    }
    /**
     *   Completes the states by converting state_ids to integers and assgning integer state IDs to actions
    */
    complete(states_map: Map<string, LRState>, grammar: Grammar) {

        const states = <LRStates>[...(states_map.values())];

        states.forEach((state, i) => state.id = i);

        for (const state of states) {

            for (const action of this.getActionIterator(state)) {
                action.state = states_map.get(action.state_real_id).id;
            }

            for (const goto of state.goto.values()) {
                goto.state = states_map.get(goto.state_real_id).id;
            }

            grammar.meta.ignore.forEach(
                i => i.symbols.forEach((sym) => {
                    if (!state.actions.has(sym.val) && state.grammar_stamp == i.grammar_stamp) {
                        state.actions.set(sym.val, { symbol_type: sym.type, name: StateActionEnum.IGNORE, state: state.id, body: state.body, original_body: state.body });
                    }
                })
            );

            grammar.meta.error.forEach(
                i => i.symbols.forEach((sym) => {
                    if (!state.actions.has(sym.val) && state.grammar_stamp == i.grammar_stamp) {
                        state.actions.set(sym.val, { symbol_type: sym.type, name: StateActionEnum.ERROR, state: state.id, body: state.body, original_body: state.body });
                    }
                })
            );
        }

        states.type = "lr";
        states.lu_map = states_map;
        states.count = states.length;

        return states;
    }

    /* 
        Resolves the merger of a new state into the current set of states. 
        Merges new state if existing state has matching sid.
    */
    resolve(states: Map<string, LRState>, new_state: LRState, grammar: Grammar, errors: CompilerErrorStore) {

        const sid = new_state.real_id;

        const existing_state = (states.has(sid) ? states.get(sid) : new_state);

        if (!existing_state.goto) {
            existing_state.actions = new Map;
            existing_state.goto = new Map;
        }

        if (!existing_state.actions)
            existing_state.actions = new Map();




        if (existing_state !== new_state) {
            //only store unique items based on body
            const exist = new Set();

            existing_state.items = [...existing_state.items, ...new_state.items]
                .map(i => Item.fromArray(i))
                .filter(
                    i => {
                        if (exist.has(i.id)) return false;
                        exist.add(i.id);
                        return true;
                    }
                );
        }

        states.set(sid, existing_state);

        try {


            for (const action of new_state.to_process_actions) {

                action.item = Item.fromArray(action.item);

                const symbol = action.symbol;



                if (action.item.len <= 0) continue;

                if (action.name == StateActionEnum.GOTO) {
                    if (!existing_state.goto.get(symbol))
                        existing_state.goto.set(symbol, action);
                    continue;
                }

                const existing_action = existing_state.actions.get(symbol);

                if (!existing_action) {
                    existing_state.actions.set(symbol, action);
                } else {
                    switch (action.name) {
                        case StateActionEnum.ACCEPT: //ACCEPT always wins
                            existing_state.actions.set(symbol, action);
                            break;
                        case StateActionEnum.SHIFT:
                            switch (existing_action.name) {
                                case StateActionEnum.ACCEPT:
                                    break;
                                case StateActionEnum.SHIFT:
                                    this.handleShiftShiftCollision(grammar, existing_state, action, existing_action, errors);
                                    break;
                                case StateActionEnum.REDUCE:
                                    this.handleShiftReduceCollision(grammar, existing_state, action, existing_action, errors);
                                    break;
                                case StateActionEnum.FORK:
                                    this.handleForkShiftCollision(grammar, existing_state, existing_action, action, errors);
                                    break;
                            }
                            break;
                        case StateActionEnum.REDUCE:
                            if (action.item.len <= 0) continue;

                            switch (existing_action.name) {
                                case StateActionEnum.ACCEPT:
                                    break;
                                case StateActionEnum.SHIFT:
                                    this.handleShiftReduceCollision(grammar, existing_state, existing_action, action, errors);
                                    break;
                                case StateActionEnum.REDUCE:
                                    this.handleReduceCollision(grammar, existing_state, action, existing_action, errors);
                                    break;
                                case StateActionEnum.FORK:
                                    this.handleForkReduceCollision(grammar, existing_state, existing_action, action, errors);
                                    break;
                            }
                            break;
                        case StateActionEnum.IGNORE:
                        case StateActionEnum.ERROR:
                        default:
                            if (existing_action.name !== StateActionEnum.ACCEPT) {
                                if (existing_action.name !== action.name)
                                    existing_state.actions.set(symbol, action);
                                //throw "Conflicting actions";
                            }
                    }
                }
            }
        } catch (e) {
            errors.log(e.stack);
        }

        existing_state.to_process_actions = [];
    }
}