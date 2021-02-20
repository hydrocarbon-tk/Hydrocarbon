/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
/**
 * This interface represents the binary debug
 * data that a parser can generate. Each property
 * should be considered a sequence of bits, with
 * its value indicating the number of bits it
 * takes up with a 16 bit integer.
 */

interface DebugDatum {
    /**
     * Represent the number of items the 
     * datum contains. These follow the head
     * datum and are 16bit number reference the
     * index location of the item within the 
     * grammars item map. 
     * 
     * Note this is limited to 63 items
     * as the number of items in a typical 
     * transition are small fraction of this
     * amount.
     */
    number_of_items: 6;

    /**
     * Number of characters that need to be 
     * consumed to get to this transition point.
     * 
     * Max 62: If this value is 63, then
     * next 16 bit segment in the debug buffer
     * is an uint16 number representing the 
     * larger data offset. 
     * 
     * Delta offset from the last datum's 
     * delta_char_offset
     */
    delta_char_offset: 6;

    /**
     * Flag to indicate whether a peek 
     * has been started
     */
    peek_start: 1;

    /**
     * Flag to indicate whether a peek 
     * has been started
     */
    peek_end: 1;

    /**
     * Flag to that a fork has occurred
     */
    fork_start: 1;

    /**
    * Flag to that a fork has resolved
    */
    fork_end: 1;

}