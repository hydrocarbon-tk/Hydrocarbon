import { Lexer } from "@candlefw/wind";

export enum SymbolType {
    PRODUCTION = "production",
    ESCLUDE = "exc",
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
    END_OF_FILE = "eof"
}

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
    precedence?: number,
    NO_BLANK?: boolean;
    IS_OPTIONAL?: boolean;
    IS_CONDITION?: boolean;
    IMPORTED?: boolean;
    RESOLVED?: boolean;
    production?: Production;
    resolveFunction?: () => void;
    pos: Lexer;
}

export interface ProductionBodyFunction {
    /**
     * Name of the of the function if it is a numed ParserEnvironment function
     * Otherwise blank.
     */
    name: string,
    /**
     * Index position of the terminal symbol proceding the function
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
     * Name of the of the function if it is a numed ParserEnvironment function
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
    excludes: Map<number, Symbol[]>;
    ignore: Map<number, Symbol[]>;
    error: Map<number, Symbol[]>;
    reset: Map<number, Symbol[]>;
    reduce: Map<number, Symbol>;
    BUILT: boolean;
    production?: Production;
    precedence?: number;
    uid: string;
    build?: () => void;
    FORK_ON_ENTRY: boolean;
}

export interface Production {
    id: number;
    name: string | Symbol;
    val?: number;
    type: "production";
    subtype?: string;

    url?: string;
    grammar_stamp?: string;

    bodies?: Array<ProductionBody>;

    excludes?: Map<number, Symbol>;
    ignore?: Map<number, Symbol>;
    error?: Map<number, Symbol>;
    reset?: Map<number, Symbol>;
    reduce?: Map<number, Symbol>;

    IMPORT_APPEND?: boolean;
    IMPORT_OVERRIDE?: boolean;
    RESOLVED?: boolean;
    IMPORTED?: boolean;
    resolveFunction?: (arg0: Production) => void;

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

        all_symbols?: Map<string, Symbol>;

        symbols?: Map<string, { val: string; }>;

        error?: any[],

        ignore?: any[],

        preambles?: Preamble[];
    };

    imported: boolean;

    uri: string;

    symbols: Array<any>;

    reserved: Set<any>;

    SYMBOL_LIST: Array<Production>;

    PENDING: boolean;

    graph_id: number;

    bodies: Array<ProductionBody>;
};
