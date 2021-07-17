/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

import { GrammarParserEnvironment } from "./grammar_compiler_environment";
import { ParserEnvironment } from "./parser_environment";

export type HCGParser<T = any, R = any> = {
    (input: string, env: GrammarParserEnvironment): {
        result: T[];
    };
} & R;

export interface HCGTokenPosition {
    line: number,
    column: number,
    offset: number,
}

export interface HCGProductionFunction<T> {
    (env: ParserEnvironment, sym: (string | T)[], pos: HCGTokenPosition): T;
}
/**
 * Loads parser recognizer and links with completer, memory, and production functions
 * 
 * return memory and parser
 */
export interface HCGParserConstructor<T> {
    (fns: HCGProductionFunction<T>[], memory?: WebAssembly.Memory): {
        parser: HCGParser<T>;
        memory: WebAssembly.Memory;
    };
}
