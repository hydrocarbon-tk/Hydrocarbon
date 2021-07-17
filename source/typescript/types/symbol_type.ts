/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

export const enum SymbolType {
    PRODUCTION = "sym-production",
    LITERAL = "literal",
    EXCLUSIVE_LITERAL = "exclusive-literal",
    GENERATED = "generated",
    ESCAPED = "escaped",
    SYMBOL = "symbol",
    EMPTY = "empty",
    END_OF_FILE = "eof",
    PRODUCTION_ASSERTION_FUNCTION = "assert_token_function",
    PRODUCTION_TOKEN_SYMBOL = "production_token",
    END_OF_PRODUCTION = "eop"
}
