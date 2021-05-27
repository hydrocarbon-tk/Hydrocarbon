/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Lexer } from "@candlelib/wind";


type StateMeta = any & { pos: Lexer; };
/**
 * The stack store both the current state index
 * and a meta object with information about the 
 * current token that can be accessed within action
 * functions as the [meta] object.
 */
export type StateStack = Array<number | StateMeta>;


export type HistoryInfo = {
    lex: Lexer,
    tk: number,
    ptr: number,
    forks: number,
    fork_depth: number,
};

/**
 * Stores history of state changes when 
 * debug info is attached to lrParser.
 */
export type HistoryStack = Array<number | HistoryInfo>;
