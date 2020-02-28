import { Grammar } from "../../types/grammar.js";
import { LRState, LRStates, ParserAction } from "../../types/lr_state.d";
import { CompilerErrorStore } from "./compiler_error_store.js";
export default class StateResolver {
    handleShiftReduceCollision(grammar: Grammar, state: LRState, shift_action: ParserAction, reduce_action: ParserAction, errors: CompilerErrorStore): void;
    handleReduceCollision(grammar: Grammar, state: LRState, existing_reduce: ParserAction, new_reduce: ParserAction, errors: CompilerErrorStore): void;
    handleForkReduceCollision(grammar: Grammar, state: LRState, fork_action: ParserAction, reduce_action: ParserAction): void;
    handleForkShiftCollision(grammar: Grammar, state: LRState, fork_action: ParserAction, reduce_action: ParserAction): void;
    getActionIterator(state: any): any;
    /**
     *   Completes the states by converting state_ids to integers and assgning integer state IDs to actions
    */
    complete(states_map: Map<string, LRState>, grammar: Grammar): LRStates;
    resolve(states: Map<string, LRState>, new_state: LRState, grammar: Grammar, errors: CompilerErrorStore): void;
}
