/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Helper } from "../build/helper.js";
import { SKExpression, SKReference } from "../skribble/types/node.js";
import { Item } from "../utilities/item.js";
import { HCG3Grammar, HCG3Production } from "./grammar_nodes.js";
import { Leaf } from "./transition_node.js";

export interface BaseOptions {
    /**
     * Source grammar for the language
     */
    grammar?: HCG3Grammar;

    /**
     * Active Compiler Runner
     */
    helper?: Helper;
}

export interface RenderBodyOptions extends BaseOptions {

    scope: "RD" | "GOTO",

    /**
     * Production currently being processed
     */
    productions?: HCG3Production[];

    /**
     * Ids of all productions
     */
    production_ids: number[],

    /**
     * List of all production ids whose production function is called
     */
    called_productions?: Set<number>;

    /**
     * List of all productions that are produced from leaf production nodes
     */
    leaf_productions: Set<number>;

    goto_items: Item[];

    /**
     * Items that shift on a production but are 
     * not part of the productions initial closure.
     */
    extended_goto_items: Set<number>;

    //cache: Map<string, { code: SC, prods: number[]; leaves: Leaf[], hash: string; }>;

    /**
     * Used to track active production shift production ids
     */
    active_keys: number[];

    /**
     * Information from all single item leaf nodes.
     */
    leaves: Leaf[];

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
     * All items in the grammar that are `S => a . A` for some production `A`
     */
    global_production_items: Item[];

    branches: { name: SKReference, body: SKExpression[]; }[];

    /**
     * Object stores for table based builds
     */
    table?: {
        map: Map<string, string>;
        entries: string[];
    };

}
export const enum ReturnType {
    ACCEPT = 0,
    RETURN = 1,
    NONE = 2
}
