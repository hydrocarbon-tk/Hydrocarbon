import { ErrorHandler } from "./parser_data.js";
/**
 * Defines custom function handlers and options for lrParser
 */
export interface ParserEnvironment {
    functions?: {
        defaultError?: ErrorHandler;
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
    };
}
