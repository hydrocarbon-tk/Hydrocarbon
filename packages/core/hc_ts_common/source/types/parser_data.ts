import { ParserStateIterator, ParserState, ParserStateBuffer } from "../runtime/core_parser";

/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

export interface RecognizeInitializer {

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
     * Returns the number of ParserData blocks that where created during the 
     * recognition processing.
     */
    recognize: (string: string, production_id: number) => {
        valid: ParserStateBuffer, invalid: ParserStateBuffer;
    };

    create_iterator: (data: ParserState) => ParserStateIterator;
}
