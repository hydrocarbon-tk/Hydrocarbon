import { HCG3EOPSymbol } from "@candlelib/hydrocarbon/build/types/types/grammar_nodes";
import { TokenTypes } from "../../runtime/TokenTypes.js";
import {
    EOFSymbol,
    GeneratedIdentifier,
    GeneratedNewLine,
    GeneratedNumber,
    GeneratedSpace,
    GeneratedSymbol
} from "../../types/symbol";

/**
 * Default Symbols
 */

export const
    default_EOP: HCG3EOPSymbol = {
        type: "eop",
        val: "END_OF_PRODUCTION",
        id: TokenTypes.END_OF_FILE,
        pos: {},
        meta: null,
    },
    default_EOF: EOFSymbol = {
        type: "eof",
        val: "END_OF_FILE",
        id: TokenTypes.END_OF_FILE,
        pos: {},
        meta: null,
    },
    default_GEN_SPACE: GeneratedSpace = {
        type: "generated",
        val: "sp",
        id: TokenTypes.SPACE,
        pos: {},
        meta: null,
    },
    default_GEN_ID: GeneratedIdentifier = {
        type: "generated",
        val: "id",
        id: TokenTypes.IDENTIFIER,
        pos: {},
        meta: null,
    },
    default_GEN_SYM: GeneratedSymbol = {
        type: "generated",
        val: "sym",
        id: TokenTypes.SYMBOL,
        pos: {},
        meta: null,
    },
    default_GEN_NEWLINE: GeneratedNewLine = {
        type: "generated",
        val: "nl",
        id: TokenTypes.NEW_LINE,
        pos: {},
        meta: null,
    },
    default_GEN_NUMBER: GeneratedNumber = {
        type: "generated",
        val: "num",
        id: TokenTypes.NUMBER,
        pos: {},
        meta: null,
    };


export const default_array = [
    default_EOP,
    default_EOF,
    default_GEN_SPACE,
    default_GEN_ID,
    default_GEN_SYM,
    default_GEN_NEWLINE,
    default_GEN_NUMBER
];