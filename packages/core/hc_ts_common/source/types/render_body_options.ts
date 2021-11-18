/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Item } from "../utilities/item.js";
import { GrammarObject, GrammarProduction } from "./grammar.js";

export interface BaseOptions {
    /**
     * Source grammar for the language
     */
    grammar?: GrammarObject;
}

export interface RenderBodyOptions extends BaseOptions {
    //KEEP THIS!!!!
    scope: "RD" | "GOTO",

    /**
     * Production currently being processed
     */
    productions?: GrammarProduction[];

    /**
     * Ids of all productions
     */
    production_ids: number[],

    goto_items: Item[];

    /**
     * Items that shift on a production but are 
     * not part of the productions initial closure.
     */
    extended_goto_items: Set<number>;

    /**
     * Set to true if there are no production transitions
     */
    NO_GOTOS: boolean;

    /**
     * If this number is more than zero we are working in virtual production
     * space
     */
    VIRTUAL_LEVEL: number;

    /**
     * Object stores for table based builds
     */
    table?: {
        map: Map<string, string>;
        entries: string[];
    };

}
