import { Lexer } from "@candlefw/wind";


type StateMeta = any & { pos: Lexer; };
/**
 * The stack store both the current state index
 * and a meta object with information about the 
 * current token that can be accessed within action
 * functions as the [meta] object.
 */
export type StateStack = Array<number | StateMeta>;
