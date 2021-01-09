import { Grammar, Production } from "../../types/grammar.js";
import { CompilerRunner } from "./CompilerRunner.js";
import { VarSC } from "../utilities/skribble.js";
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
     * List of all production ids referenced
     */
    productions?: Set<number>;
    lr_productions: Item[];
}
export const enum ReturnType {
    ACCEPT = 0,
    RETURN = 1,
    NONE = 2
}
