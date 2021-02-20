/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { TokenSymbol } from "./symbol";
import { ProductionBody } from "./grammar";
import { Item } from "../utilities/item";


export interface Production {
    id: number;
    name: string;

    val?: number;
    type: "production" | "virtual-production";

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
    HAS_EMPTY?: boolean;
    CHECKED_FOR_EMPTY?: boolean;
    resolveFunction?: (arg0: Production) => void;
    recovery_handler?: {
        type: "ERROR_RECOVERY";
        lexer_text: string;
        body_text: string;
        reduce_id: number;
        txt: string;

    };
    graph_id?: number;
}

export interface VirtualProduction extends Production {
    type: "virtual-production";

    original_item: Item;
}


/**
 * All production bodies must be length one
 * comprised of a terminal symbol and no actions
 * of any kind.
 */
export interface TrivialProduction extends Production {
    IS_TRIVIAL: true;
}