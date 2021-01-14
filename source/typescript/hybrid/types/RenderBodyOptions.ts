import { Grammar, Production } from "../../types/grammar.js";
import { CompilerRunner } from "./CompilerRunner.js";
import { SC, VarSC } from "../utilities/skribble.js";
import { Item } from "../../util/item.js";

export interface RenderBodyOptions {
    /**
     * Source grammar for the language
     */
    grammar?: Grammar;
    /**
     * Active Compiler Runner
     */
    runner?: CompilerRunner;
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
    lr_productions: Item[];

    cache: Map<string, { code: SC, prods: number[]; }>;
}
export const enum ReturnType {
    ACCEPT = 0,
    RETURN = 1,
    NONE = 2
}
