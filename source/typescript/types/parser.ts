/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { ParserEnvironment } from "../runtime";
import { GrammarParserEnvironment } from "./grammar_compiler_environment";

export interface HCGParser<T = any> {
    (input: string, env: GrammarParserEnvironment): {
        FAILED: boolean;
        result: T[];
        action_length: number;
        error_message: string;
    };
}

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
