import { Lexer } from "@candlefw/wind";
import { Item } from "../util/item";
import { Production } from "./Production";
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

export const EOF_SYM: TokenSymbol = { val: "END_OF_FILE", precedence: 0, type: SymbolType.END_OF_FILE };

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
    excludes: Map<number, TokenSymbol[][]>;
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

export interface Preamble {
    type: "symbols" | "precedence" | "ignore" | "error" | "name" | "ext";
    symbols?: any[];
    grammar_stamp?: number;
    id?: Symbol;
    terminal?: Symbol;
    val?: number;
}

export interface ItemMapEntry {
    item: Item;
    reset_sym: string[];

    /**
     * List of all items that can be derived from this item
     */
    closure: string[];

    /**
     * Does the item contain left recursion
     */
    LR: boolean;
    /**
     * List of unique symbol names that shift into a right recursion
     */
    RR: string[];
    containing_items: Set<string>;

    /**
     * Measure of the number of steps need to reach
     * this item from the root production
     */
    depth: number;

    /**
     * Symbols that can be skipped over at this item
     */
    skippable: Set<string>;

    /**
     * Set of all symbols that follow an item that has reached its last position.
     */
    follow: Set<string>;
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

    /**
     * A mapping of the closure for all grammar items, 
     * keyed by an item's id.
     */
    item_map: Map<string, ItemMapEntry>;

};

export interface GrammarFunction {
    type: "CLASS" | "RETURNED" | "INLINE" | "AssemblyScript";

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

    /**
     * For Assertion Functions. Compiled AssemblyScript text
     */
    assemblyscript_txt?: string;

    /**
     * For Assertion Functions. List of first symbols
     */
    first?: TokenSymbol[];
}
