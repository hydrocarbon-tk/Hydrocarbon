import { Lexer } from "@candlefw/wind";
import { SymbolType } from "./grammar";
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

export interface SpecifiedNumericSymbol extends SymbolBase {
    type: SymbolType.ESCAPED | SymbolType.LITERAL | SymbolType.SYMBOL;
    val: string;
}

export interface SpecifiedIdentifierSymbol extends SymbolBase {
    type: SymbolType.ESCAPED | SymbolType.LITERAL | SymbolType.SYMBOL;
    val: string;
}

export interface SpecifiedCharacterSymbol extends SymbolBase {
    type: SymbolType.ESCAPED | SymbolType.LITERAL | SymbolType.SYMBOL;
    val: string;
}


export interface GeneratedSymbol extends SymbolBase {
    type: SymbolType.GENERATED;
    val: string;
}

export interface EOFSymbol extends SymbolBase {
    type: SymbolType.END_OF_FILE;
    val: string;
}

export interface EmptySymbol extends SymbolBase {
    type: SymbolType.EMPTY;
    val: "";
}

export interface ProductionSymbol extends SymbolBase {
    type: SymbolType.PRODUCTION;
    val: number;
}

export interface AssertionFunctionSymbol extends SymbolBase {
    type: SymbolType.PRODUCTION_ASSERTION_FUNCTION;
    val: string;
}

export type SpecifiedSymbol =
    SpecifiedIdentifierSymbol
    | SpecifiedCharacterSymbol
    | SpecifiedNumericSymbol;
export type TokenSymbol =
    SpecifiedCharacterSymbol
    | GeneratedSymbol
    | EOFSymbol
    | EmptySymbol
    | AssertionFunctionSymbol
    | SpecifiedSymbol;

export type Symbol = TokenSymbol | ProductionSymbol; 