/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Item } from "../utilities/item";
import { HCG3EOFSymbol, HCG3EOPSymbol } from "./grammar_nodes";
import { Production } from "./production";
import { Symbol, TokenSymbol } from "./symbol";
import { SymbolType } from "./symbol_type";

export const EOF_SYM: HCG3EOFSymbol = { val: "END_OF_FILE", precedence: 0, type: SymbolType.END_OF_FILE, meta: null, pos: null };

export const EOP_SYM: HCG3EOPSymbol = { val: "END_OF_PRODUCTION", precedence: 0, type: SymbolType.END_OF_PRODUCTION, meta: null, pos: null };

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

    type?: string;
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

    hash: string,

    containing_items: Set<string>;

    excludes: TokenSymbol[][],

    /**
     * Measure of the number of steps need to reach
     * this item from the root production
     */
    depth?: number;

    /**
     * Symbols that can be skipped over at this item
     */
    skippable: Set<string>;

    /**
     * Set of all symbols that follow an item that has reached its last position.
     */
    follow: Set<string>;

    /**
     * Set of all productions that can reach this item
     */
    breadcrumbs: Set<number>;

    /**
     * An positionally unique identifier for the symbol
     */
    sym_uid: number;
}


export type Grammar = Array<Production> & {

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
    /**
     * An byte buffer of all defined characters sequences that can show up in the grammar. 
     * These are mapped back to DefinedSymbols with the offset indicating where that particular
     * symbols sequence begins and a the length in bytes of the symbols sequence.
     */
    sequence_string: string;

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
