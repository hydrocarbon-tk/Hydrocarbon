import { ItemMapEntry } from "../types/grammar";

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
export interface HCG3Function extends HCG3GrammarNode {
    type: "RETURNED",
    txt: string,
    js: string;
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
    bodies: HCGProductionBody[];
    id: number;
    recovery_handler: HCG3Function;
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

export interface HCGProductionBody extends HCG3GrammarNode {
    type: "body",
    sym: HCG3Symbol[];
    reduce_function?: HCG3Function;
    FORCE_FORK: boolean;
    id: number;
    production?: HCG3Production;

    length?: number;
    reset?: any;
    excludes?: any;

    reduce_id?: number;
}

export interface HCGConditionNode extends HCG3GrammarNode {
    type: "condition";
}
export interface HCG3Grammar extends HCG3GrammarNode {
    type: "hc-grammar-3";
    preamble: (HCG3Import | HCG3Ignore)[];
    productions: HCG3Production[];
    function: HCG3Function[];
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

    bodies?: HCGProductionBody[];

    reduce_functions: Map<string, number>;

    production_hash_lookup?: any;
}

////////////////////////////////////////////////////////////////////
//// SYMBOLS
export interface HCG3SymbolNode extends HCG3GrammarNode {
    val: any;
    IS_OPTIONAL?: boolean;
    IS_NON_CAPTURE?: boolean;
    DOES_SHIFT?: boolean;
    subtype?: string;
    id?: number;
    precedence?: number;
    pos: any;
}

export interface HCG3BasicSymbol extends HCG3SymbolNode {
    type: "symbol";
    val: string;
}

export interface HCG3ListProductionSymbol extends HCG3SymbolNode {
    type: "list-production";
    val: HCG3SymbolNode;
    terminal_symbol: HCG3Symbol;
    OPTIONAL: boolean;
}

export interface HCG3GroupProduction extends HCG3SymbolNode {
    type: "group-production";
    val: HCGProductionBody[];
}

export interface HCG3EOFSymbol extends HCG3SymbolNode {
    type: "eof";
    val: "END_OF_FILE";
}

export interface HCG3EmptySymbol extends HCG3SymbolNode {
    type: "empty";
    val: "";
    byte_length: 0;

    byte_offset: 0;
}

export interface HCG3GeneratedSymbol extends HCG3SymbolNode {
    type: "generated";
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

}

export interface HCG3ProductionTokenSymbol extends HCG3SymbolNode {
    type: "production_token";
    name: string;

    val: string | number;

    production?: HCG3Production;
}

export interface HCG3ProductionSymbol extends HCG3SymbolNode {
    type: "sym-production";

    name: string;

    val: string | number;

    production?: HCG3Production;
}

export interface HCG3ProductionImportSymbol extends HCG3SymbolNode {
    type: "sym-production-import";
}

export type HCG3Symbol = HCG3BasicSymbol
    | HCG3ListProductionSymbol
    | HCG3GroupProduction
    | HCG3EOFSymbol
    | HCG3EmptySymbol
    | HCG3GeneratedSymbol
    | HCG3LiteralSymbol
    | HCG3ProductionTokenSymbol
    | HCG3ProductionSymbol
    | HCG3ProductionImportSymbol;