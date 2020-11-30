import { Lexer } from "@candlefw/wind";
import { Symbol, TokenSymbol } from "./Symbol";

export enum SymbolType {
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
    END_OF_ITEM = "END_OF_ITEM"
}

export const EOF_SYM: Symbol = { val: "END_OF_FILE", precedence: 0, type: SymbolType.END_OF_FILE };

export interface ProductionBodyFunction {
    /**
     * Name of the of the function if it is a named ParserEnvironment function
     * Otherwise blank.
     */
    name: string,
    /**
     * Index position of the terminal symbol proceeding the function
     * in production body.
     */
    offset: number,
    /**
     * If true the function is defined within the ParserEnvironment object.
     */
    env: boolean;
}

export interface ProductionBodyReduceFunction {
    /**
     * Name of the of the function if it is a named ParserEnvironment function
     * Otherwise blank.
     */
    name: string,
    /**
     * If true the function is defined within the ParserEnvironment object.
     */
    env: boolean;
    txt: string;
    type: "RETURNED" | "CLASS";

    /**
     * Indicates that the function statements have been prepared if true.
     */
    BUILT?: boolean;
}

export interface ProductionBody {
    id?: number;
    name: string;
    sym: Array<Symbol>;
    lex: Lexer;
    sym_map: Array<number>;
    length: number;
    functions: Array<ProductionBodyFunction>;
    reduce_function: ProductionBodyReduceFunction;
    grammar_stamp: number;
    form: number;
    excludes: Map<number, TokenSymbol[]>;
    ignore: Map<number, TokenSymbol[]>;
    error: Map<number, TokenSymbol[]>;
    reset: Map<number, TokenSymbol[]>;
    reduce: Map<number, TokenSymbol[]>;
    BUILT: boolean;
    production?: Production;
    precedence?: number;
    uid: string;
    build?: () => void;
    reduce_id?: number;
    FORK_ON_ENTRY: boolean;
}

export interface Production {
    id: number;
    name: string;
    val?: number;
    type: "production";
    subtype?: string;

    url?: string;
    grammar_stamp?: string;

    bodies?: Array<ProductionBody>;

    excludes?: Map<number, TokenSymbol>;
    ignore?: Map<number, TokenSymbol>;
    error?: Map<number, TokenSymbol>;
    reset?: Map<number, TokenSymbol>;
    reduce?: Map<number, TokenSymbol>;
    follow?: Map<string, TokenSymbol>;

    IMPORT_APPEND?: boolean;
    IMPORT_OVERRIDE?: boolean;
    RESOLVED?: boolean;
    IMPORTED?: boolean;
    resolveFunction?: (arg0: Production) => void;

    recovery_handler?: {
        type: "ERROR_RECOVERY",
        lexer_text: string,
        body_text: string,
        reduce_id: number;

    };

    graph_id?: number;
}

export interface Preamble {
    type: "symbols" | "precedence" | "ignore" | "error" | "name" | "ext";
    symbols?: any[];
    grammar_stamp?: number;
    id?: Symbol;
    terminal?: Symbol;
    val?: number;
}

export type Grammar = Array<Production> & {
    /**
     * Hash of all productions strings and bodies order out starting with the goal production
     */
    hash: string;

    LU: Map<string, Production>;

    meta: {
        /**
         * Every symbol encountered in the grammar; keyed
         * by the unique symbol name. 
         */
        all_symbols?: Map<string, Symbol>;

        symbols?: Map<string, Symbol>;

        error?: any[],

        ignore?: any[],

        preambles?: Preamble[];
        /**
         * A lut to map JavaScript function contents
         * to numerical index values.
         */
        reduce_functions?: Map<string, number>;
    };

    imported: boolean;

    uri: string;

    symbols: Array<any>;

    reserved: Set<any>;

    SYMBOL_LIST: Array<Production>;

    PENDING: boolean;

    graph_id: number;

    bodies: Array<ProductionBody>;

    functions: Map<string, GrammarFunction>;

};

interface GrammarFunction {
    type: "CLASS" | "RETURNED" | "INLINE";

    name: string;
    /**
     * 
     * The function should be looked up in the parser environment
     * `functions` property
     */
    env: boolean;
    ref: string;
    txt: string;
    IS_CONDITION: boolean;
}
