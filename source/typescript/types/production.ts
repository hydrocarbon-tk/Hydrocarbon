import { TokenSymbol } from "./symbol";
import { ProductionBody } from "./grammar";


export interface Production {
    id: number;
    name: string;
    val?: number;
    type: "production";
    subtype?: "string";

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
        type: "ERROR_RECOVERY";
        lexer_text: string;
        body_text: string;
        reduce_id: number;

    };
    graph_id?: number;
}
