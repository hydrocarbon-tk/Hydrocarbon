import { TokenSymbol } from "@candlelib/hydrocarbon/build/types/types/symbol";
import { ItemMapEntry } from "./item_map";


export const enum RECURSIVE_STATE {
    UNKNOWN = 0,
    LEFT = 1,
    RIGHT = 2,
    LEFT_RIGHT = 3,
    NONE = 4
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
    js: string;
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

    };

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

    URI: string;

    common_import_name: string;

    bodies?: HCG3ProductionBody[];

    reduce_functions: Map<string, number>;

    production_hash_lookup?: any;
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

export interface HCG3BasicSymbol extends HCG3SymbolNode {
    type: "symbol";
    val: string;
    meta: false;
}

export interface HCG3ListProductionSymbol extends HCG3SymbolNode {
    type: "list-production";
    val: HCG3SymbolNode;
    terminal_symbol: HCG3Symbol;
    OPTIONAL: boolean;
    meta: false;
}

export interface HCG3GroupProduction extends HCG3SymbolNode {
    type: "group-production";
    val: HCG3ProductionBody[];
    meta: false;
}

export interface HCG3EOFSymbol extends HCG3SymbolNode {
    type: "eof";
    val: "END_OF_FILE";
    meta: false;
}
export interface HCG3EOPSymbol extends HCG3SymbolNode {
    type: "eop";
    val: "END_OF_PRODUCTION";
    meta: false;
}

export interface HCG3EmptySymbol extends HCG3SymbolNode {
    type: "empty";
    val: "";
    byte_length: 0;
    byte_offset: 0;
    meta: false;
}

export interface HCG3GeneratedSymbol extends HCG3SymbolNode {
    type: "generated";
    meta: false;
}

export interface HCG3LiteralSymbol extends HCG3SymbolNode {
    type: "literal";

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
    type: "exclusive-literal";

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
    type: "production_token";
    name: string;

    val: string | number;

    production?: HCG3Production; END_OF_PRODUCTION;
    meta: false;
}

export interface HCG3ProductionSymbol extends HCG3SymbolNode {
    type: "sym-production";

    name: string;

    val: string | number;

    production?: HCG3Production;
    meta: false;
}

export interface HCG3ProductionImportSymbol extends HCG3SymbolNode {
    type: "sym-production-import";
    production?: string;
    module: any;
    meta: false;
}

export interface HCG3LookBehind extends HCG3SymbolNode {
    type: "look-behind";
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
export type HCG3Symbol = HCG3BasicSymbol
    | HCG3ListProductionSymbol
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
    | HCG3EOPSymbol;
