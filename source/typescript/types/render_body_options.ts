import { Grammar } from "./grammar.js";
import { Production } from "./production";
import { Helper } from "../compiler/helper.js";
import { SC } from "../utilities/skribble.js";
import { Item } from "../utilities/item.js";

export interface RenderBodyOptions {
    /**
     * Source grammar for the language
     */
    grammar?: Grammar;
    /**
     * Active Compiler Runner
     */
    runner?: Helper;
    /**
     * Production currently being processed
     */
    production?: Production;
    /**
     * List of all production ids whose production function is called
     */
    called_productions?: Set<number>;
    /**
     * List of all productions that are produced from leaf states
     */
    leaf_productions: Set<number>;

    production_shift_items: Item[];

    /**
     * Items that shift on the production but are 
     * not part of the productions initial closure.
     */
    extended_production_shift_items: Item[];

    cache: Map<string, { code: SC, prods: number[]; hash: string; }>;
}
export const enum ReturnType {
    ACCEPT = 0,
    RETURN = 1,
    NONE = 2
}
