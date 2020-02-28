import { ParserAction, LRState } from "../../types/LRState.js";
import { CompilerErrorStore } from "./compiler_error_store";
import { Grammar } from "../../types/grammar";
export declare function shiftReduceCollision(grammar: Grammar, state: LRState, shift: ParserAction, reduce: ParserAction, error: CompilerErrorStore): void;
export declare function reduceCollision(grammar: Grammar, state: LRState, reduce_existing: ParserAction, reduce_new: ParserAction, error: {
    log: (arg0: string) => void;
}): void;
