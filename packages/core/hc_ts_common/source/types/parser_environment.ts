/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

/**
 * Defines custom function handlers and options for lrParser
 */
export interface ParserEnvironment {

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
        onstart?: (env: ParserEnvironment) => void;
    };
}
