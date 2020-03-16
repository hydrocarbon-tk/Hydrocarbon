import { Lexer } from "@candlefw/wind";
import { StateStack } from "./state_stack.js";
export interface ParserSquashResultData {
    /**
     * Error message if parse failed to parser the input.
     */
    error: string;
    SQUASH?: boolean;
    /**
     * Output Stack
     */
    o: Array<any>;
    /**
     * Stack Pointer
     */
    sp: number;
    /**
     *
     */
    len: number;
    /**
     * Token Symbol Value
     */
    tk: number;
    /**
     * State Stack
     */
    ss: StateStack;
    /**
     * Lexer pointing at next token.
     */
    lex: Lexer;
    /**
    * Number of cycles taken in this branch path
    */
    cycles: number;
    /**
     * Number of cycles taken in all forked paths.
     */
    total_cycles: number;
    /**
     * Offset index position of Lexer
     */
    off: number;
    /**
     * Number of forkes taken at this point
     */
    forks: number;
}
