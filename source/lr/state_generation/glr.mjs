import compileLRStates from "./lr.mjs";
import StateProcessor from "./state_processor.js";
import { KEEP_EXISTING_ACTION } from "../common/state_parse_action_enums.js";
import { FORK_REDUCE } from "../common/state_action_enums.js";

class GLStateProcessor extends StateProcessor {
    handleShiftReduceCollision(grammar, states, state, item, body, error){

    }
    handleReduceCollision(grammar, states, state, item, body, error) {
        const key = item.v;
        /* 
            Need to check and see if we already have a fork set for this state. 
            If not then we'll add a new fork state. 

            If we do have a fork, then append the reduce action to the fork's actions, 
            ordered by the bodie's production graph-id, descending.
        */

        const existing_action = state.action.get(key);

        const fork = (existing_action.name == FORK_REDUCE) 
            ? existing_action 
            : (state.action.set(key, { name: FORK_REDUCE, actions:[existing_action], state: state.id, production: body.production, body: body.id, offset: item.offset }), state.action.get(key));

        const action_intercept = {action:new Map(), id:state.id};
        
        this.reduceAtSymbol(action_intercept, item.follow, body, item);

        fork.actions.push(action_intercept.action.get(key));
        
        fork.actions.sort((a,b)=>a.production.graph_id < b.production.graph_id ? -1 : 1);

        return KEEP_EXISTING_ACTION;
    }
}

export default function* compileStates(grammar, env = {}) {
    return yield* compileLRStates(grammar, env, new GLStateProcessor);
}