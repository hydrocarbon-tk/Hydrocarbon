/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

export const enum SymbolType {
    PRODUCTION = "production",
    EXCLUDE = "exc",
    IGNORE = "ign",
    ERROR = "err",
    RESET = "rst",
    REDUCE = "red",
    LITERAL = "literal",
    GENERATED = "generated",
    INLINE = "INLINE",
    ESCAPED = "escaped",
    SYMBOL = "symbol",
    EMPTY = "empty",
    END_OF_FILE = "eof",
    PRODUCTION_ASSERTION_FUNCTION = "assert_token_function",
    END_OF_ITEM = "END_OF_ITEM",
    PRODUCTION_TOKEN_SYMBOL = "production_token"
}
