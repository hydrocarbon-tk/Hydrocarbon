import { Grammar } from "./grammar.js";
import { Production } from "./production";
import { Helper } from "../compiler/helper.js";
import { SC } from "../utilities/skribble.js";
import { Item } from "../utilities/item.js";
import { Leaf, TRANSITION_TYPE } from "./recognizer_state.js";

export interface RenderBodyOptions {

    /**
     * Source grammar for the language
     */
    grammar?: Grammar;

    /**
     * Active Compiler Runner
     */
    helper?: Helper;

    /**
     * Production currently being processed
     */
    production?: Production;

    /**
     * List of all production ids whose production function is called
     */
    called_productions?: Set<number>;

    /**
     * List of all productions that are produced from leaf production states
     */
    leaf_productions: Set<number>;

    goto_items: Item[];

    /**
     * Items that shift on a production but are 
     * not part of the productions initial closure.
     */
    extended_goto_items: Item[];

    //cache: Map<string, { code: SC, prods: number[]; leaves: Leaf[], hash: string; }>;

    /**
     * Used to track active production shift production ids
     */
    active_keys: number[];

    /**
     * Information from all single item leaf states.
     */
    leaves: Leaf[];

    /**
     * Set to true if there are no production transitions
     */
    NO_GOTOS: boolean;
    /**
     * All items in the grammar that are `S => a . A` for some production `A`
     */
    global_production_items: Item[];

}
export const enum ReturnType {
    ACCEPT = 0,
    RETURN = 1,
    NONE = 2
}
