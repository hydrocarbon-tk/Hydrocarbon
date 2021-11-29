
/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
/**
 * Base id token integer identifiers 
*/
export enum TokenTypes {
    RECOVERY = 0,
    UNDEFINED = 0,
    EOF,
    SYMBOL,
    IDENTIFIER,
    NUMBER,
    NEW_LINE,
    SPACE,
    IDENTIFIERS,
    NUMBERS,
    SYMBOLS,
    CUSTOM_START_POINT, // <= Do Not Move
    UNICODE_IDENTIFIER,
    DEFAULT = 9009,
}

