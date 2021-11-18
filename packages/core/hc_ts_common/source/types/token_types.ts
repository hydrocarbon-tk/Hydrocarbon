
/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
/**
 * Base id token integer identifiers 
*/
export enum TokenTypes {
    UNDEFINED,
    END_OF_FILE,
    SYMBOL,
    IDENTIFIER,
    NUMBER,
    NEW_LINE,
    SPACE,
    IDENTIFIERS,
    NUMBERS,
    SYMBOLS,
    CUSTOM_START_POINT,
    UNICODE_IDENTIFIER,
    RECOVERY = 0,
}

