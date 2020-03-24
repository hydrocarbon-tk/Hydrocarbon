import { Lexer } from "@candlefw/wind";
import { ErrorHandler } from "./parser_data.js";

/**
 * Defines custom function handlers and options for lrParser
 */
export interface ParserEnvironment {
    functions?: {
        defaultError?: ErrorHandler;
        /**
         * Functions used within the lr_parser to handle REDUCE, SHIFT, and ACCEPT
         * actions. 
         */
    };
    /**
     * Proxy of functions
     */
    fn?: {};
    /**
     * List of options that affect how the grammar is compiled. 
     */
    options?: {
        /**
         * If true functions defined in the environment object will be compiled into 
         * the ParserData.
         */
        integrate?: boolean;

        /**
         * A function that is called before parsing begins.
         * 
         * Useful in resetting environment variables between parsing
         * runs.
         */
        onstart?: () => any;
    };
}
