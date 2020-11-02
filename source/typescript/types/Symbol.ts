import { Lexer } from "@candlefw/wind";
import { SymbolType, Production } from "./grammar";



/**
 * Grammar Symbols
*/

export interface Symbol {
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
