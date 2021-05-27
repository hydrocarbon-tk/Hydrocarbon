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
}
export interface HCG3Comment extends HCG3GrammarNode {
    type: "comment", value: string;
}

export interface HCG3Ignore extends HCG3GrammarNode {
    type: "ignore", symbols: HCG3SymbolNode[];
}

export interface HCG3Import extends HCG3GrammarNode {
    type: "import", value: string; uri: string, reference: string;
}

export interface HCG3ProductionNode extends HCG3GrammarNode {
    name: string;
    bodies: HCGProductionBody[];
    id: number;
    recovery_handler: HCG3Function;
}
export interface HCG3Production extends HCG3ProductionNode {
    type: "production",
}

export interface HCG3ImportProduction extends HCG3ProductionNode {
    type: "production-import",
}

export interface HCG3MergedProduction extends HCG3ProductionNode {
    type: "production-merged-import",
}

export interface HCGProductionBody extends HCG3GrammarNode {
    type: "body",
    symbols: HCG3Symbol[];
    reduce?: HCG3Function;
    FORCE_FORK: boolean;
    id: number;
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
}

////////////////////////////////////////////////////////////////////
//// SYMBOLS
export interface HCG3SymbolNode extends HCG3GrammarNode {
    value: any;
    IS_OPTIONAL?: boolean;
    IS_NON_CAPTURE?: boolean;
}

export interface HCG3BasicSymbol extends HCG3SymbolNode {
    type: "symbol";
    value: string;
}

export interface HCG3ListProductionSymbol extends HCG3SymbolNode {
    type: "list-production";
    value: HCG3SymbolNode;
    terminal_symbol: HCG3Symbol;
    OPTIONAL: boolean;
}

export interface HCG3GroupProduction extends HCG3SymbolNode {
    type: "group-production";
    value: HCGProductionBody[];
}

export interface HCG3EOFSymbol extends HCG3SymbolNode {
    type: "eof";
    value: "END_OF_FILE";
}

export interface HCG3EmptySymbol extends HCG3SymbolNode {
    type: "empty";
    value: "";
}

export interface HCG3GeneratedSymbol extends HCG3SymbolNode {
    type: "generated";
}

export interface HCG3LiteralSymbol extends HCG3SymbolNode {
    type: "literal";
}

export interface HCG3ProductionTokenSymbol extends HCG3SymbolNode {
    type: "production-token";
}

export interface HCG3ProductionSymbol extends HCG3SymbolNode {
    type: "sym-production";
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