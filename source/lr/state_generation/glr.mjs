import compileLRStates from "./lr.mjs";
import StateProcessor from "./state_processor.js";
import { KEEP_EXISTING_ACTION, SET_NEW_ACTION } from "../common/state_parse_action_enums.js";
import { FORK_ACTION, SHIFT, REDUCE, ERROR, IGNORE } from "../common/state_action_enums.js";

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


    handleShiftReduceCollision(symbol, grammar, states, state, item, body, shift_state, errors) {
        const key = symbol.val;
        /* 
            Need to check and see if we already have a fork set for this state. 
            If not then we'll add a new fork state. 

            If we do have a fork, then append the reduce action to the fork's actions, 
            ordered by the bodie's production graph-id, descending.
        */
        const existing_action = state.action.get(key);

        if(existing_action.name == REDUCE && existing_action.item.len == 0)
            return SET_NEW_ACTION;

        //if(existing_action.name == REDUCE && existing_action.item.body_(grammar).production.id === item.body_(grammar).production.id){
        //    errors.log("############ REDUNDANT SHIFT/REDUCE #############", existing_action.item.renderWithProduction(grammar), item.renderWithProduction(grammar))
        //    return SET_NEW_ACTION;
        //}

        const fork = (existing_action.name == FORK_ACTION)
            ? existing_action
            : (state.action.set(key, {
                name: FORK_ACTION,
                actions: [existing_action],
                symbol_type: existing_action.symbol_type,
                state: state.id,
                body: body.id,
                offset: item.offset,
                item,
                registered: new Set([existing_action.item.id])
            }), state.action.get(key));

        const action = this.createInterceptedShiftAction(symbol, state, item, body, shift_state);

        if (!fork.registered.has(item.id)) {
            fork.registered.add(item.id);
            //Replace any matching REDUCE productions with this SHIFT action. 
            //fork.actions = fork.actions.filter(e=> e.name !== REDUCE ||  e.item.body_(grammar).production.id !== item.body_(grammar).production.id );
            fork.actions.push(action);
            fork.actions.sort((a, b) => a.name < b.name ? -1 : 1);
        }

        return KEEP_EXISTING_ACTION;
    }


    handleReduceCollision(grammar, states, state, item, body, errors) {

        if(item.len == 0)
            return KEEP_EXISTING_ACTION;

        const key = item.v;
        /* 
            Need to check and see if we already have a fork set for this state. 
            If not then we'll add a new fork state. 

            If we do have a fork, then append the reduce action to the fork's actions, 
            ordered by the bodie's production graph-id, descending.
        */

        const existing_action = state.action.get(key);

        //if(existing_action.name == SHIFT && existing_action.item.body_(grammar).production.id === item.body_(grammar).production.id){
        //    errors.log("############ REDUNDANT REDUCE/SHIFT #############", existing_action.item.renderWithProduction(grammar), item.renderWithProduction(grammar))
        //    return KEEP_EXISTING_ACTION;
        //}

        const fork = (existing_action.name == FORK_ACTION)
            ? existing_action
            : (state.action.set(key, {
                name: FORK_ACTION,
                actions: [existing_action],
                symbol_type: existing_action.symbol_type,
                state: state.id,
                body: body.id,
                offset: item.offset,
                item,
                registered: new Set([existing_action.item.id])
            }), state.action.get(key));

        const action = this.createInterceptedReduceAction(state, item, body);

        if (!fork.registered.has(item.id)) {
           fork.registered.add(item.id);
         //   if(!fork.actions.find(e=> e.name == SHIFT && e.item.body_(grammar).production.id === item.body_(grammar).production.id))
            fork.actions.push(action);
           fork.actions.sort((a, b) => a.name < b.name ? -1 : 1);
        }


        return KEEP_EXISTING_ACTION;
    }
}

export default function* compileStates(grammar, env = {}) {
    return yield* compileLRStates(grammar, env, new GLStateProcessor);
}