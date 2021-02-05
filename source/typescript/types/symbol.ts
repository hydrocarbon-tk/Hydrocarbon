import { Lexer } from "@candlefw/wind";
import { SymbolType } from "./symbol_type";
import { Production } from "./production";


/**
 * Grammar Symbols
*/
export interface SymbolBase {
    type: SymbolType;
    val: string | number;
    subtype?: string;
    offset?: number;
    name?: string;
    sym?: string;
    precedence?: number;
    NO_BLANK?: boolean;
    IS_OPTIONAL?: boolean;
    IS_CONDITION?: boolean;
    IS_NON_CAPTURE?: boolean;
    IMPORTED?: boolean;
    RESOLVED?: boolean;
    DOES_SHIFT?: boolean;
    production?: Production;
    resolveFunction?: () => void;
    pos?: Lexer;

    /**
     * The numerical identifier for this token
     */
    id?: number;
}

export interface DefinedSymbolBase extends SymbolBase {
    /**
     * Size of the character sequence in UTF8 encoding
     */
    byte_length: number;

    /**
     * If the byte_length is more than, then this is the offset of the 
     * character sequence within the character lookup table.
     */
    byte_offset: number;
}

export interface DefinedNumericSymbol extends DefinedSymbolBase {
    type: SymbolType.ESCAPED | SymbolType.LITERAL | SymbolType.SYMBOL;
    val: string;
}

export interface DefinedIdentifierSymbol extends DefinedSymbolBase {
    type: SymbolType.ESCAPED | SymbolType.LITERAL | SymbolType.SYMBOL;
    val: string;
}

export interface DefinedCharacterSymbol extends DefinedSymbolBase {
    type: SymbolType.ESCAPED | SymbolType.LITERAL | SymbolType.SYMBOL;
    val: string;
}


export interface GeneratedSymbol extends SymbolBase {
    type: SymbolType.GENERATED;
    val: string;
}

export interface EOFSymbol extends SymbolBase {
    type: SymbolType.END_OF_FILE;
    val: "END_OF_FILE";
}

export interface EmptySymbol extends SymbolBase {
    type: SymbolType.EMPTY;
    val: "";
}

export interface ProductionSymbol extends SymbolBase {
    type: SymbolType.PRODUCTION;
    name: string;
    val: number;
    production: Production;
}

export interface AssertionFunctionSymbol extends SymbolBase {
    type: SymbolType.PRODUCTION_ASSERTION_FUNCTION;
    val: string;

}

export interface ProductionTokenSymbol extends SymbolBase {
    type: SymbolType.PRODUCTION_TOKEN_SYMBOL;
    name: string;
    val: number;
    production: Production;

}
/**
 * Any symbol that is not a ProductionSymbol, ProductionTokenSymbol, AssertionFunctionSymbol, or GeneratedSymbol.
 * 
 * Specifically, any symbol that is comprised of a discrete sequence of characters
 * defined by the grammar author.
 */
export type DefinedSymbol =
    | DefinedCharacterSymbol
    | DefinedIdentifierSymbol
    | DefinedNumericSymbol;
export type TokenSymbol =
    | DefinedSymbol
    | GeneratedSymbol
    | EOFSymbol
    | EmptySymbol
    | AssertionFunctionSymbol
    | ProductionTokenSymbol;

export type Symbol = TokenSymbol | ProductionSymbol; 