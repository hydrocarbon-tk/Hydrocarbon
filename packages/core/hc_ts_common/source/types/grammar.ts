/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

import { CompilableStruct } from "./compilable_nodes.js";
import { TokenTypes } from "./token_types.js";
import { Item } from "../utilities/item.js";
import { ItemMapEntry } from "./item_map.js";
import { IR_State } from './ir_types.js';
import { Token } from '../objects/token.js';
export const enum RECURSIVE_STATE {
    UNKNOWN = 0,
    LEFT = 1,
    RIGHT = 2,
    LEFT_RIGHT = 3,
    NONE = 4
}

export enum SymbolType {

    EOF = "eof",
    PRODUCTION = "sym-production",
    LITERAL = "literal",
    EXCLUSIVE_LITERAL = "exclusive-literal",
    GENERATED = "generated",
    SYMBOL = "symbol",
    EMPTY = "empty",
    DEFAULT = "DEFAULT",
    PRODUCTION_ASSERTION_FUNCTION = "assert_token_function",
    PRODUCTION_TOKEN_SYMBOL = "production_token",
    IMPORT_PRODUCTION = "sym-production-import",
    LOOK_BEHIND = "look-behind",
    VIRTUAL_TOKEN = "v-token-production",
    GROUP_PRODUCTION = "group-production",
    LIST_PRODUCTION = "list-production",
    AMBIGUOUS = "hybrid",
    REFERENCE = "reference"
}

export type HCG3TokenPosition = Token;
export interface HCGGrammarNode {
    type: string;
    tok?: Token;
}


export interface PreambleNode extends HCGGrammarNode { }



export interface OutOfBandFunctionDeclaration extends HCGGrammarNode {
    type: "out_of_band";
    reference: ReferenceSymbol;
    txt: string;
    tok: Token;
}
export interface OutOfBandReduceFunctionDeclaration extends HCGGrammarNode {

    type: "out_of_band";
    production?: ProductionSymbol | ProductionImportSymbol;
    index: number[];
    txt: string;
    tok: Token;
}
export interface OutOfBandReduceFunctionReference extends HCGGrammarNode {

    type: "out_of_band";

    production?: ProductionSymbol | ProductionImportSymbol;

    index: number[];
    reference: ReferenceSymbol;
    tok: Token;
}

export type OutOfBandFunction = OutOfBandFunctionDeclaration | OutOfBandReduceFunctionDeclaration | OutOfBandReduceFunctionReference;

export interface ReferencedFunction extends HCGGrammarNode {
    type: "referenced-function";
    ref: ReferenceSymbol;
}


export interface ProductionFunction extends HCGGrammarNode {
    type: "RETURNED";
    txt: string;
    js?: string;
    cpp?: string;
    ref?: ReferenceSymbol;
    name?: string;
    compilable_ast?: any;
}

export interface GrammarComment extends HCGGrammarNode {
    type: "comment", val: string;
}

export interface IgnorePreamble extends HCGGrammarNode {
    type: "ignore", symbols: SymbolNode[];
}

export interface ImportPreamble extends HCGGrammarNode {
    type: "import", val: string; uri: string, reference: string;
}

export interface ExportPreamble extends HCGGrammarNode {
    type: "export", production: (ProductionSymbol); reference: string;
}

export interface ProductionNode extends HCGGrammarNode {
    name: string;
    symbol: ProductionSymbol | ProductionImportSymbol;
    bodies: HCG3ProductionBody[];
    id: number;
    RECURSIVE: RECURSIVE_STATE,
    /**
     * A production that represents the root of the grammar or sub-grammar. 
     */
    ROOT_PRODUCTION?: boolean;

    /**
     *  The production represents an entrypoint into the grammar / sub-grammar. 
     */
    IS_ENTRY: boolean;

    entry_name?: string;
    /**
     * The original identifier of the source grammar if it 
     * has been imported
     */
    grammar_id?: string;
    CHECKED_FOR_EMPTY?: boolean;
    HAS_EMPTY?: boolean;

    token_id?: number;

    priority: number;
}
export interface GeneralProductionNode extends ProductionNode {
    type: "production",
}

export interface ScannerProductionNode extends ProductionNode {
    type: "scanner-production",
    token_id: number;
}

export interface MergedProductionNode extends ProductionNode {
    type: "production-merged";

}

export type GrammarProduction = GeneralProductionNode | ScannerProductionNode | MergedProductionNode;

export interface HCG3ProductionBody extends HCGGrammarNode {
    type: "body",
    reduce_function?: ProductionFunction | ReferencedFunction;
    sym: HCG3Symbol[];
    id: number;
    production?: GrammarProduction;
    length?: number;
    excludes?: TokenSymbol[][][];
    ignore?: TokenSymbol[][];
    reset?: TokenSymbol[][];
    reduce_id?: number;
    priority: number;


}

export interface ConditionNode extends HCGGrammarNode {
    type: "condition";
}
export interface GrammarObject extends HCGGrammarNode {
    type: "hc-grammar-5";
    preamble: (ImportPreamble | IgnorePreamble | ExportPreamble)[];
    productions: GrammarProduction[];
    functions: (
        OutOfBandFunctionDeclaration
        | OutOfBandReduceFunctionDeclaration
        | OutOfBandReduceFunctionReference
    )[];
    imported_grammars: { reference: string, uri: string, grammar: GrammarObject; }[];

    meta?: {

        id_offset?: number;

        ignore?: HCG3Symbol[];

        all_symbols?: Map<string, HCG3Symbol> & { by_id: Map<number, HCG3Symbol>; };

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
     * A list of author defined intermediate states.
     */
    ir_states?: IR_State[];

    /**
     * An byte buffer of all defined characters sequences that can show up in the grammar. 
     * These are mapped back to DefinedSymbols with the offset indicating where that particular
     * symbols sequence begins and a the length in bytes of the symbols sequence.
     */
    sequence_string: string;

    URI: string;

    common_import_name: string;

    bodies: HCG3ProductionBody[];

    production_hash_lookup?: any;
    /**
     * Properties for producing a JS/TS/WASM module
     */
    js?: {

    };

    /**
     * Properties for producing a cpp module
     */
    compiled?: {
        primary_enum: any;
        structs: CompilableStruct[];

    };
    /**
     * All items that are `S => β • A γ`
     * for some production `A`. 
     * 
     * The key is the numerical id of the production 
     * and values are array items with matching keys.
     */
    lr_items?: Map<number, Item[]>;

    resource_path: string;
}

////////////////////////////////////////////////////////////////////
//// SYMBOLS
export interface SymbolNode extends HCGGrammarNode {
    val: any;
    IS_OPTIONAL?: number;
    IS_NON_CAPTURE?: boolean;
    DOES_SHIFT?: boolean;
    subtype?: string;
    precedence?: number;
    tok: Token;
    meta: boolean;
    id?: number;
    annotation?: string;
}

export interface ListProductionSymbol extends SymbolNode {
    type: SymbolType.LIST_PRODUCTION;
    val: HCG3Symbol;
    terminal_symbol: HCG3Symbol;
    OPTIONAL: boolean;
    meta: false;
}

export interface ReferenceSymbol extends SymbolNode {
    type: SymbolType.REFERENCE;
    val: string;
}

export interface GroupProductionSymbol extends SymbolNode {
    type: SymbolType.GROUP_PRODUCTION;
    val: HCG3ProductionBody[];
    meta: false;
}

export interface DEFAULTSymbol extends SymbolNode {
    type: SymbolType.DEFAULT;
    val: "DEFAULT";
    id: TokenTypes.DEFAULT;
    meta: false;
}

export interface EOFSymbol extends SymbolNode {
    type: SymbolType.GENERATED;
    val: "eof";
    id: TokenTypes.EOF;
    meta: false;
}

export interface EmptySymbol extends SymbolNode {
    type: SymbolType.EMPTY;
    val: "";
    byte_length: 0;
    byte_offset: 0;
    meta: false;
}

export interface BaseGeneratedSymbol extends SymbolNode {
    type: SymbolType.GENERATED;
    meta: false;
}

export interface LiteralSymbol extends SymbolNode {
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

export interface ExclusiveLiteralSymbol extends SymbolNode {
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

export interface ProductionTokenSymbol extends SymbolNode {
    type: SymbolType.PRODUCTION_TOKEN_SYMBOL;
    name: string;
    val: number;
    production?: GeneralProductionNode;
    meta: false;
    token_id: number;
}

export interface ProductionSymbol extends SymbolNode {
    type: SymbolType.PRODUCTION;
    name: string;
    val: number;
    production?: GeneralProductionNode;
    meta: false;


}

export interface ProductionImportSymbol extends SymbolNode {
    type: SymbolType.IMPORT_PRODUCTION;
    production?: ProductionNode;
    module: any;
    meta: false;
    name: string;
    reference: string;
}

export interface LookBehindSymbol extends SymbolNode {
    type: SymbolType.LOOK_BEHIND;
    phased: TokenSymbol;
}

export interface MetaExcludeSymbol extends SymbolNode {
    type: "meta-exclude",
    sym: TokenSymbol[],
    meta: true;
    index: number;
}
export interface MetaErrorSymbol extends SymbolNode {
    type: "meta-error",
    sym: HCG3Symbol[],
    meta: true;
    index: number;
}
export interface MetaIgnoreSymbol extends SymbolNode {
    type: "meta-ignore",
    sym: TokenSymbol[],
    meta: true;
    index: number;
}
export interface MetaResetSymbol extends SymbolNode {
    type: "meta-reset",
    sym: TokenSymbol[],
    meta: true;
    index: number;
}
export interface MetaReduceSymbol extends SymbolNode {
    type: "meta-reduce",
    sym: HCG3Symbol,
    meta: true;
    index: number;
}

export interface DefinedNumericSymbol extends LiteralSymbol { }

export interface DefinedIdentifierSymbol extends LiteralSymbol { }

export interface DefinedCharacterSymbol extends LiteralSymbol { }

export interface GeneratedSymbol extends BaseGeneratedSymbol {
    val: "sym";
    id: TokenTypes.SYMBOL;
}

export interface GeneratedSymbols extends BaseGeneratedSymbol {
    val: "syms";
    id: TokenTypes.SYMBOLS;
}

export interface GeneratedNewLine extends BaseGeneratedSymbol {
    val: "nl";
    id: TokenTypes.NEW_LINE;
}
export interface GeneratedNumber extends BaseGeneratedSymbol {

    val: "num";
    id: TokenTypes.NUMBER;
}

export interface GeneratedNumbers extends BaseGeneratedSymbol {

    val: "nums";
    id: TokenTypes.NUMBERS;
}

export interface RecoverySymbol extends BaseGeneratedSymbol {

    val: "rec";
    id: TokenTypes.RECOVERY;
}

;
export interface GeneratedSpace extends BaseGeneratedSymbol {

    val: "sp";
    id: TokenTypes.SPACE;
}

export interface GeneratedSpace extends BaseGeneratedSymbol {

    val: "sp";
    id: TokenTypes.SPACE;
}

export interface GeneratedIdentifiers extends BaseGeneratedSymbol {
    val: "ids";
    id: TokenTypes.IDENTIFIERS;
}
export interface GeneratedIdentifier extends BaseGeneratedSymbol {
    val: "id";
    id: TokenTypes.IDENTIFIER;
}

/**
 * Symbol represents an ambiguous mix of tokens;
 * i.e:
 *      a DefinedIdentifierSymbol token and a 
 *      GeneratedIdentifier identifier token.
 */
export interface AmbiguousSymbol extends SymbolNode {
    type: SymbolType.AMBIGUOUS,
    syms: HCG3Symbol[],
    val: string;
}

export interface VirtualTokenSymbol extends SymbolNode {
    type: SymbolType.VIRTUAL_TOKEN;
    val: number;
    symbol: HCG3Symbol;
    item: Item;
    root: ProductionTokenSymbol;
    root_offset: number;
    token_offset: number;
    peek_depth: number;
    closure: Item[];
    production_offset: number;

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
    | ExclusiveLiteralSymbol
    | DefinedNumericSymbol;
export type TokenSymbol =
    | DefinedSymbol
    | BaseGeneratedSymbol
    | DEFAULTSymbol
    | EmptySymbol
    | ProductionTokenSymbol
    | LookBehindSymbol
    | LiteralSymbol
    | AmbiguousSymbol;
export type HCG3Symbol =
    ListProductionSymbol
    | ReferenceSymbol
    | RecoverySymbol
    | GroupProductionSymbol
    | ProductionSymbol
    | ProductionImportSymbol
    | MetaExcludeSymbol
    | MetaErrorSymbol
    | MetaIgnoreSymbol
    | MetaResetSymbol
    | MetaReduceSymbol
    | GeneratedSymbol
    | GeneratedSymbols
    | GeneratedNewLine
    | GeneratedNumber
    | RecoverySymbol
    | GeneratedSpace
    | GeneratedIdentifier
    | TokenSymbol;
