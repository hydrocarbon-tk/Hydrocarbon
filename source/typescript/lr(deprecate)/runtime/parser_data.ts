/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Lexer } from "@candlefw/wind";
import { ParserEnvironment } from "../../types/parser_environment.js";
import { StateStack } from "./state_stack.js";

export type OutputStack = Array<any>;

type TokenLookupMap = Map<string | number, number>;

export type ErrorHandler = (
    token: number,
    env: ParserEnvironment,
    output_stack: OutputStack,
    lexer: Lexer,
    previous_lexer: Lexer,
    state_stack: StateStack,
    lookup: (arg0: Lexer) => number,
    stack_pointer: number,
) => number;

export type ActionFunction = (
    token: number,
    /*Deprecate */ env: ParserEnvironment,
    output_stack: OutputStack,
    lexer: Lexer,
    /*Deprecate */ previous_lexer: Lexer, // Included in state stack.
    state_stack: number[],
    lookup: (arg0: Lexer) => number
) => number;

export interface ParserData {
    gt: Array<number>;
    sym: Array<string>;
    lu: TokenLookupMap;
    sts: Array<number>;
    sa: Array<ActionFunction>;
    fns: Array<ActionFunction>;
    gtk: (arg0: Lexer, arg1: TokenLookupMap, arg2?: boolean) => number;
    ty: any;
    fm: Array<number>;
}
