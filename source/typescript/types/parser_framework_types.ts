/*
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty
 * disclaimer notice.
 */

import { KernelState, KernelStateBuffer, KernelStateIterator } from "../runtime/kernel";
import { Token } from "../runtime/token";
export interface RecognizeInitializer<R, K extends keyof R> {

    /**
     * Use this function to acquire the Unicode Symbol Look Up Table
     */
    init_table: () => Uint8Array,

    /**
     * Start the recognizer process. Should be called only after init_data 
     * has been called. 
     * 
     * input_size: number - The actual length of the input string in bytes.
     * 
     * production_id: number - The production index from which to start parsing
     * thee input.
     * 
     * Returns the number of KernelData blocks that where created during the 
     * recognition processing.
     */
    recognize: (string: string, production_id: R[K]) => {
        valid: KernelStateBuffer, invalid: KernelStateBuffer;
    };

    create_iterator: (data: KernelState) => KernelStateIterator;
}


export type ParserPack<T, R, K extends keyof R> = {
    parse: (input: string, production_selector: R[K], env: ParserEnvironment) => T[],
    entry_points: R;
};


export interface ProductionFunction<T> {
    (env: ParserEnvironment, sym: (string | T)[], pos: Token): T;
}

/**
 * Loads parser recognizer and links with completer, memory, and production functions
 * 
 * return memory and parser
 */
export interface ParserConstructor<T, R, K extends keyof R> {
    (fns: ProductionFunction<T>[], memory?: WebAssembly.Memory): {
        parser: ParserPack<T, R, K>;
        memory: WebAssembly.Memory;
    };
}

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
