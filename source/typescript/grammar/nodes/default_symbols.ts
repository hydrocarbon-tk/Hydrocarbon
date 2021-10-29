import { Token } from '../../runtime/token.js';
import { TokenTypes } from "../../types/TokenTypes.js";
import {
    EOFSymbol,
    GeneratedIdentifier,
    GeneratedNewLine,
    GeneratedNumber,
    GeneratedSpace,
    GeneratedSymbol, EOPSymbol, SymbolType, RecoverySymbol, GeneratedIdentifiers, GeneratedNumbers
} from "../../types/grammar_nodes";

/**
 * Default Symbols
 */

export const user_defined_state_mux = "__USER_DEFINED__";

export const
    default_EOP: EOPSymbol = {
        type: SymbolType.END_OF_FILE,
        val: "END_OF_PRODUCTION",
        id: TokenTypes.END_OF_FILE,
        tok: new Token("EOP", 3, 0),
        meta: null,
    },
    default_EOF: EOFSymbol = {
        type: SymbolType.END_OF_FILE,
        val: "END_OF_FILE",
        id: TokenTypes.END_OF_FILE,
        tok: new Token("$oef", 4, 0),
        meta: null,
    },
    default_GEN_SPACE: GeneratedSpace = {
        type: SymbolType.GENERATED,
        val: "sp",
        id: TokenTypes.SPACE,
        tok: new Token("g:sp", 4, 0),
        meta: null,
    },
    default_GEN_IDS: GeneratedIdentifiers = {
        type: SymbolType.GENERATED,
        val: "ids",
        id: TokenTypes.IDENTIFIERS,
        tok: new Token("g:ids", 5, 0),
        meta: null,
    },

    default_GEN_NUMBERS: GeneratedNumbers = {
        type: SymbolType.GENERATED,
        val: "nums",
        id: TokenTypes.NUMBERS,
        tok: new Token("g:nums", 6, 0),
        meta: null,
    },
    default_GEN_ID: GeneratedIdentifier = {
        type: SymbolType.GENERATED,
        val: "id",
        id: TokenTypes.IDENTIFIER,
        tok: new Token("g:id", 4, 0),
        meta: null,
    },
    default_GEN_SYM: GeneratedSymbol = {
        type: SymbolType.GENERATED,
        val: "sym",
        id: TokenTypes.SYMBOL,
        tok: new Token("g:sym", 5, 0),
        meta: null,
    },
    default_GEN_NEWLINE: GeneratedNewLine = {
        type: SymbolType.GENERATED,
        val: "nl",
        id: TokenTypes.NEW_LINE,
        tok: new Token("g:nl", 4, 0),
        meta: null,
    },
    default_GEN_NUMBER: GeneratedNumber = {
        type: SymbolType.GENERATED,
        val: "num",
        id: TokenTypes.NUMBER,
        tok: new Token("g:num", 5, 0),
        meta: null,
    },
    default_RECOVERY: RecoverySymbol = {
        type: SymbolType.GENERATED,
        val: "rec",
        id: TokenTypes.RECOVERY,
        tok: new Token("g:rec", 5, 0),
        meta: null,
    };


export const default_array = [
    default_RECOVERY,
    default_EOP,
    default_EOF,
    default_GEN_SPACE,
    default_GEN_ID,
    default_GEN_SYM,
    default_GEN_NEWLINE,
    default_GEN_NUMBER,
    default_GEN_NUMBERS,
    default_GEN_IDS
];