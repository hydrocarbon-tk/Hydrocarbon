/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Grammar } from "../types/grammar.js";
import { HCGParser } from "../types/parser.js";
import { completeGrammar } from "../utilities/grammar.js";
import { grammarParser } from "./grammar_parser.js";
import defaultParser from "./parser.js";

export async function createGrammar(grammar_string: string, grammar_string_path: string, parser: HCGParser<Grammar> = defaultParser): Promise<Grammar> {

    const grammar = await grammarParser(grammar_string, grammar_string_path, undefined, undefined, undefined, parser);

    completeGrammar(grammar, null);

    return grammar;
}