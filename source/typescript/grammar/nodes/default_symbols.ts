import { TokenTypes } from "../../runtime/TokenTypes.js";
import {
    EOFSymbol,
    GeneratedIdentifier,
    GeneratedNewLine,
    GeneratedNumber,
    GeneratedSpace,
    GeneratedSymbol, EOPSymbol, SymbolType, RecoverySymbol
} from "../../types/grammar_nodes";

/**
 * Default Symbols
 */

export const
    default_EOP: EOPSymbol = {
        type: SymbolType.END_OF_FILE,
        val: "END_OF_PRODUCTION",
        id: TokenTypes.END_OF_FILE,
        pos: {},
        meta: null,
    },
    default_EOF: EOFSymbol = {
        type: SymbolType.END_OF_FILE,
        val: "END_OF_FILE",
        id: TokenTypes.END_OF_FILE,
        pos: {},
        meta: null,
    },
    default_GEN_SPACE: GeneratedSpace = {
        type: SymbolType.GENERATED,
        val: "sp",
        id: TokenTypes.SPACE,
        pos: {},
        meta: null,
    },
    default_GEN_ID: GeneratedIdentifier = {
        type: SymbolType.GENERATED,
        val: "id",
        id: TokenTypes.IDENTIFIER,
        pos: {},
        meta: null,
    },
    default_GEN_SYM: GeneratedSymbol = {
        type: SymbolType.GENERATED,
        val: "sym",
        id: TokenTypes.SYMBOL,
        pos: {},
        meta: null,
    },
    default_GEN_NEWLINE: GeneratedNewLine = {
        type: SymbolType.GENERATED,
        val: "nl",
        id: TokenTypes.NEW_LINE,
        pos: {},
        meta: null,
    },
    default_GEN_NUMBER: GeneratedNumber = {
        type: SymbolType.GENERATED,
        val: "num",
        id: TokenTypes.NUMBER,
        pos: {},
        meta: null,
    },
    default_RECOVERY: RecoverySymbol = {
        type: SymbolType.GENERATED,
        val: "rec",
        id: TokenTypes.RECOVERY,
        pos: {},
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
    default_GEN_NUMBER
];