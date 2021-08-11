/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

import { TokenTypes } from "../runtime/TokenTypes";
import { Item } from "../utilities/item";
import { ItemMapEntry } from "./item_map";
export const enum RECURSIVE_STATE {
    UNKNOWN = 0,
    LEFT = 1,
    RIGHT = 2,
    LEFT_RIGHT = 3,
    NONE = 4
}

export const enum SymbolType {
    PRODUCTION = "sym-production",
    LITERAL = "literal",
    EXCLUSIVE_LITERAL = "exclusive-literal",
    GENERATED = "generated",
    SYMBOL = "symbol",
    EMPTY = "empty",
    END_OF_FILE = "eof",
    PRODUCTION_ASSERTION_FUNCTION = "assert_token_function",
    PRODUCTION_TOKEN_SYMBOL = "production_token",
    END_OF_PRODUCTION = "eop",
    IMPORT_PRODUCTION = "sym-production-import",
    LOOK_BEHIND = "look-behind",
    VIRTUAL_TOKEN = "v-token-production",
    GROUP_PRODUCTION = "group-production",
    LIST_PRODUCTION = "list-production",
}

export interface HCG3TokenPosition {
    offset: number;
    line: number;
    column: number;
    length: number;
}
export interface HCG3GrammarNode {
    type: string;
    pos?: HCG3TokenPosition;
}


export interface HCG3PreambleNode extends HCG3GrammarNode { }

export interface HCG3ReferencedFunction extends HCG3GrammarNode {
    type: "ref-function";
    id: string;
    txt: string;
}

export interface HCGENVFunctionRef extends HCG3GrammarNode {
    type: "env-function-reference";
    ref: string;
}

export interface HCGLocalFunctionRef extends HCG3GrammarNode {
    type: "local-function-reference";
    ref: string;
}
export interface HCG3Function extends HCG3GrammarNode {
    type: "RETURNED";
    txt: string;
    js?: string;
    cpp?: string;
    ref?: string;
    name?: string;
}

export interface HCG3Comment extends HCG3GrammarNode {
    type: "comment", val: string;
}

export interface HCG3Ignore extends HCG3GrammarNode {
    type: "ignore", symbols: HCG3SymbolNode[];
}

export interface HCG3Import extends HCG3GrammarNode {
    type: "import", val: string; uri: string, reference: string;
}

export interface HCG3ProductionNode extends HCG3GrammarNode {
    name: any;
    bodies: HCG3ProductionBody[];
    id: number;
    recovery_handler: HCG3Function;
    RECURSIVE: RECURSIVE_STATE,
    /**
     * A production that represents the root of the grammar or sub-grammar. 
     */
    ROOT_PRODUCTION?: boolean;

    /**
     *  The production represents an entrypoint into the grammar / sub-grammar. 
     */
    IS_ENTRY: boolean;

    /**
     * The original identifier of the source grammar if it 
     * has been imported
     */
    grammar_id?: string;



    CHECKED_FOR_EMPTY?: boolean;

    HAS_EMPTY?: boolean;
}
export interface HCG3GeneralProduction extends HCG3ProductionNode {
    type: "production",
}

export interface HCG3VirtualProduction extends HCG3ProductionNode {
    type: "virtual-production",
}

export interface HCG3ImportProduction extends HCG3ProductionNode {
    type: "production-import",

    name: HCG3ProductionImportSymbol;
}

export interface HCG3MergedProduction extends HCG3ProductionNode {
    type: "production-merged-import",

    name: HCG3ProductionImportSymbol;

}

export type HCG3Production = HCG3GeneralProduction | HCG3VirtualProduction | HCG3ImportProduction | HCG3MergedProduction;

export interface HCG3ProductionBody extends HCG3GrammarNode {
    type: "body",
    reduce_function?: HCG3Function | HCGLocalFunctionRef | HCGENVFunctionRef;
    sym: HCG3Symbol[];
    FORCE_FORK: boolean;
    id: number;
    production?: HCG3Production;
    length?: number;
    excludes?: TokenSymbol[][][];
    ignore?: TokenSymbol[][];
    reset?: TokenSymbol[][];
    reduce_id?: number;
}

export interface HCGConditionNode extends HCG3GrammarNode {
    type: "condition";
}
export interface HCG3Grammar extends HCG3GrammarNode {
    type: "hc-grammar-3";
    preamble: (HCG3Import | HCG3Ignore)[];
    productions: HCG3Production[];
    functions: HCG3ReferencedFunction[];
    imported_grammars: { reference: string, uri: string, grammar: HCG3Grammar; }[];

    meta?: {

        ignore?: HCG3Symbol[];

        all_symbols?: Map<string, HCG3Symbol>;

        symbol?: Map<string, HCG3Symbol>;

        reduce_functions?: Map<any, string>;
        /**
         * Number of 32 bit blocks required to cover all token ids
         * within the token look up tables. 
         */
        token_row_size: number;

    };

    /**
     * A mapping of the closure for all grammar items, 
     * keyed by an item's id.
     */
    item_map: Map<string, ItemMapEntry>;

    /**
     * A lookup matrix that identifies tokens that collide with each other
     */
    collision_matrix: boolean[][];


    /**
     * An byte buffer of all defined characters sequences that can show up in the grammar. 
     * These are mapped back to DefinedSymbols with the offset indicating where that particular
     * symbols sequence begins and a the length in bytes of the symbols sequence.
     */
    sequence_string: string;

    URI: string;

    common_import_name: string;

    bodies?: HCG3ProductionBody[];

    reduce_functions: Map<string, number>;

    production_hash_lookup?: any;
    /**
     * Properties for producing a JS/TS/WASM module
     */
    js?: {

    };

    /**
     * Properties for producing a cpp module
     */
    cpp?: {
        primary_enum: any;
        classes: string[];

    };
}

////////////////////////////////////////////////////////////////////
//// SYMBOLS
export interface HCG3SymbolNode extends HCG3GrammarNode {
    val: any;
    IS_OPTIONAL?: number;
    IS_NON_CAPTURE?: boolean;
    DOES_SHIFT?: boolean;
    subtype?: string;
    opt_id?: bigint;
    precedence?: number;
    pos: any;
    meta: boolean;
    id: number;
}

export interface HCG3ListProductionSymbol extends HCG3SymbolNode {
    type: SymbolType.LIST_PRODUCTION;
    val: HCG3SymbolNode;
    terminal_symbol: HCG3Symbol;
    OPTIONAL: boolean;
    meta: false;
}

export interface HCG3GroupProduction extends HCG3SymbolNode {
    type: SymbolType.GROUP_PRODUCTION;
    val: HCG3ProductionBody[];
    meta: false;
}

export interface HCG3EOFSymbol extends HCG3SymbolNode {
    type: SymbolType.END_OF_FILE;
    val: "END_OF_FILE";
    meta: false;
}
export interface HCG3EOPSymbol extends HCG3SymbolNode {
    type: SymbolType.END_OF_PRODUCTION;
    val: "END_OF_PRODUCTION";
    meta: false;
}

export interface HCG3EmptySymbol extends HCG3SymbolNode {
    type: SymbolType.EMPTY;
    val: "";
    byte_length: 0;
    byte_offset: 0;
    meta: false;
}

export interface HCG3GeneratedSymbol extends HCG3SymbolNode {
    type: SymbolType.GENERATED;
    meta: false;
}

export interface HCG3LiteralSymbol extends HCG3SymbolNode {
    type: SymbolType.LITERAL;

    /**
     * Size of the character sequence in UTF8 encoding
     */
    byte_length?: number;

    /**
     * If the byte_length is more than, then this is the offset of the 
     * character sequence within the character lookup table.
     */
    byte_offset?: number;
    meta: false;

}

export interface HCG3ExclusiveLiteralSymbol extends HCG3SymbolNode {
    type: SymbolType.EXCLUSIVE_LITERAL;

    /**
     * Size of the character sequence in UTF8 encoding
     */
    byte_length?: number;

    /**
     * If the byte_length is more than, then this is the offset of the 
     * character sequence within the character lookup table.
     */
    byte_offset?: number;
    meta: false;

}

export interface HCG3ProductionTokenSymbol extends HCG3SymbolNode {
    type: SymbolType.PRODUCTION_TOKEN_SYMBOL;
    name: string;
    val: number;
    production?: HCG3Production; END_OF_PRODUCTION;
    meta: false;
    token_id: number;
}

export interface HCG3ProductionSymbol extends HCG3SymbolNode {
    type: SymbolType.PRODUCTION;

    name: string;

    val: number;

    production?: HCG3Production;
    meta: false;
}

export interface HCG3ProductionImportSymbol extends HCG3SymbolNode {
    type: SymbolType.IMPORT_PRODUCTION;
    production?: string;
    module: any;
    meta: false;
}

export interface HCG3LookBehind extends HCG3SymbolNode {
    type: SymbolType.LOOK_BEHIND;
    phased: TokenSymbol;
}

export interface HCG3MetaExclude extends HCG3SymbolNode {
    type: "meta-exclude",
    sym: TokenSymbol[],
    meta: true;
    index: number;
}
export interface HCG3MetaError extends HCG3SymbolNode {
    type: "meta-error",
    sym: HCG3Symbol[],
    meta: true;
    index: number;
}
export interface HCG3MetaIgnore extends HCG3SymbolNode {
    type: "meta-ignore",
    sym: TokenSymbol[],
    meta: true;
    index: number;
}
export interface HCG3MetaReset extends HCG3SymbolNode {
    type: "meta-reset",
    sym: TokenSymbol[],
    meta: true;
    index: number;
}
export interface HCG3MetaReduce extends HCG3SymbolNode {
    type: "meta-reduce",
    sym: HCG3Symbol,
    meta: true;
    index: number;
}

export interface DefinedNumericSymbol extends HCG3LiteralSymbol { }

export interface DefinedIdentifierSymbol extends HCG3LiteralSymbol { }

export interface DefinedCharacterSymbol extends HCG3LiteralSymbol { }

export interface GeneratedSymbol extends HCG3GeneratedSymbol {
    val: "sym";
    id: TokenTypes.SYMBOL;
}

export interface GeneratedNewLine extends HCG3GeneratedSymbol {
    val: "nl";
    id: TokenTypes.NEW_LINE;
}
export interface GeneratedNumber extends HCG3GeneratedSymbol {

    val: "num";
    id: TokenTypes.NUMBER;
}
export interface GeneratedSpace extends HCG3GeneratedSymbol {

    val: "sp";
    id: TokenTypes.SPACE;
}
export interface GeneratedIdentifier extends HCG3GeneratedSymbol {
    val: "id";
    id: TokenTypes.IDENTIFIER;
}
export interface EOFSymbol extends HCG3EOFSymbol {
    id: TokenTypes.END_OF_FILE;
}

export interface ProductionSymbol extends HCG3ProductionSymbol { }

export interface VirtualTokenSymbol extends HCG3SymbolNode {
    type: SymbolType.VIRTUAL_TOKEN;
    val: number;
    symbol: HCG3Symbol;
    item: Item;
    root: HCG3ProductionTokenSymbol;
    root_offset: number;
    token_offset: number;
    peek_depth: number;
    closure: Item[];
    production_offset: number;

}

export interface ProductionTokenSymbol extends HCG3ProductionTokenSymbol { }
/**
 * Any symbol that is not a ProductionSymbol, ProductionTokenSymbol, AssertionFunctionSymbol, or GeneratedSymbol.
 * 
 * Specifically, any symbol that is comprised of a discrete sequence of characters
 * defined by the grammar author.
 */
export type DefinedSymbol =
    | DefinedCharacterSymbol
    | DefinedIdentifierSymbol
    | HCG3ExclusiveLiteralSymbol
    | DefinedNumericSymbol;
export type TokenSymbol =
    | VirtualTokenSymbol
    | DefinedSymbol
    | HCG3GeneratedSymbol
    | HCG3EOFSymbol
    | HCG3EOPSymbol
    | HCG3EmptySymbol
    | HCG3ProductionTokenSymbol;
export type HCG3Symbol =
    HCG3ListProductionSymbol
    | HCG3GroupProduction
    | HCG3EOFSymbol
    | HCG3EmptySymbol
    | HCG3GeneratedSymbol
    | HCG3ExclusiveLiteralSymbol
    | HCG3LiteralSymbol
    | HCG3ProductionTokenSymbol
    | HCG3ProductionSymbol
    | HCG3ProductionImportSymbol
    | HCG3MetaExclude
    | HCG3MetaError
    | HCG3MetaIgnore
    | HCG3MetaReset
    | HCG3MetaReduce
    | HCG3LookBehind
    | HCG3EOPSymbol
    | TokenSymbol;