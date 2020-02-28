import { ParserAction, LRState } from "../../types/lr_state.js";
import { CompilerErrorStore } from "./compiler_error_store.js";
import { Grammar } from "../../types/grammar.js";
export declare function shiftReduceCollision(grammar: Grammar, state: LRState, shift: ParserAction, reduce: ParserAction, error: CompilerErrorStore): void;
export declare function reduceCollision(grammar: Grammar, state: LRState, reduce_existing: ParserAction, reduce_new: ParserAction, error: {
    log: (arg0: string) => void;
}): void;
