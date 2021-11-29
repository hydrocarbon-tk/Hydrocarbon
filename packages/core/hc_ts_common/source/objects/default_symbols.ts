/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Token } from './token.js';
import { TokenTypes } from "../types/token_types.js";
import {
    EOFSymbol,
    DEFAULTSymbol,
    GeneratedIdentifier,
    GeneratedNewLine,
    GeneratedNumber,
    GeneratedSpace,
    GeneratedSymbols,
    GeneratedSymbol,
    SymbolType,
    RecoverySymbol,
    GeneratedIdentifiers,
    GeneratedNumbers
} from "../types/grammar.js";

/**
 * Default Symbols
 */

export const user_defined_state_mux = "__USER_DEFINED__";

export const
    default_DEFAULT: DEFAULTSymbol = {
        type: SymbolType.DEFAULT,
        val: "DEFAULT",
        id: TokenTypes.DEFAULT,
        tok: new Token("$DEFAULT", 9, 0),
        meta: false,
    },
    default_GEN_SPACE: GeneratedSpace = {
        type: SymbolType.GENERATED,
        val: "sp",
        id: TokenTypes.SPACE,
        tok: new Token("g:sp", 4, 0),
        meta: false,
    },
    default_GEN_IDS: GeneratedIdentifiers = {
        type: SymbolType.GENERATED,
        val: "ids",
        id: TokenTypes.IDENTIFIERS,
        tok: new Token("g:ids", 5, 0),
        meta: false,
    },
    default_GEN_NUMBERS: GeneratedNumbers = {
        type: SymbolType.GENERATED,
        val: "nums",
        id: TokenTypes.NUMBERS,
        tok: new Token("g:nums", 6, 0),
        meta: false,
    },
    default_GEN_ID: GeneratedIdentifier = {
        type: SymbolType.GENERATED,
        val: "id",
        id: TokenTypes.IDENTIFIER,
        tok: new Token("g:id", 4, 0),
        meta: false,
    },
    default_GEN_SYM: GeneratedSymbol = {
        type: SymbolType.GENERATED,
        val: "sym",
        id: TokenTypes.SYMBOL,
        tok: new Token("g:sym", 5, 0),
        meta: false,
    },
    default_GEN_SYMS: GeneratedSymbols = {
        type: SymbolType.GENERATED,
        val: "syms",
        id: TokenTypes.SYMBOLS,
        tok: new Token("g:syms", 5, 0),
        meta: false,
    },
    default_GEN_NEWLINE: GeneratedNewLine = {
        type: SymbolType.GENERATED,
        val: "nl",
        id: TokenTypes.NEW_LINE,
        tok: new Token("g:nl", 4, 0),
        meta: false,
    },
    default_GEN_NUMBER: GeneratedNumber = {
        type: SymbolType.GENERATED,
        val: "num",
        id: TokenTypes.NUMBER,
        tok: new Token("g:num", 5, 0),
        meta: false,
    },
    default_RECOVERY: RecoverySymbol = {
        type: SymbolType.GENERATED,
        val: "rec",
        id: TokenTypes.RECOVERY,
        tok: new Token("g:rec", 5, 0),
        meta: false,
    },
    default_EOF: EOFSymbol = {
        type: SymbolType.GENERATED,
        val: "eof",
        id: TokenTypes.EOF,
        tok: new Token("g:eof", 5, 0),
        meta: false,
    };


export const default_array = [
    default_RECOVERY,
    default_DEFAULT,
    default_EOF,
    default_GEN_ID,
    default_GEN_IDS,
    default_GEN_SYM,
    default_GEN_SYMS,
    default_GEN_NUMBER,
    default_GEN_NUMBERS,
    default_GEN_NEWLINE,
    default_GEN_SPACE,
].sort((a, b) => {
    return a.id - b.id;
});
