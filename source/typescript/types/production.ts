import { TokenSymbol } from "./symbol";
import { ProductionBody } from "./grammar";


export interface Production {
    id: number;
    name: string;
    val?: number;
    type: "production";

    /**
     * Productions sub types:
     * - [ not defined ](default): All user defined productions default to this
     * - **"list"**: A production that's auto generated through the use of the (*)/(+) grammar symbols
     * - **"group"**: A production that's auto generated from symbols surrounded by parenthesize 
     */
    subtype?:
     "list"
    | "group";


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
    HAS_EMPTY?:boolean;
    CHECKED_FOR_EMPTY?: boolean;
    resolveFunction?: (arg0: Production) => void;
    recovery_handler?: {
        type: "ERROR_RECOVERY";
        lexer_text: string;
        body_text: string;
        reduce_id: number;

    };
    graph_id?: number;


}
