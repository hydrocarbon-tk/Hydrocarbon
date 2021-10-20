/* 
* Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
* see /source/typescript/hydrocarbon.ts for full copyright and warranty 
* disclaimer notice.
*/

import {
    aii,
    air,
    uni_id_cont_discrete,
    uni_id_cont_ranges,
    uni_id_start_discrete,
    uni_id_start_ranges
} from "@candlelib/wind";
import { TokenTypes } from "./TokenTypes";


export const jump8bit_table_byte_size = 382976;
/**
 * Allocates and initializes a pool of memory large enough to contain the lexer jump table, action array buffer, and error array buffer.
 * @param USE_ARRAY_BUFFER Use ArrayBuffer storage, otherwise use a WebAssembly.Memory buffer.
 * @param action32bit_array_byte_size 
 * @param error8bit_array_byte_size 
 */
export function initializeUTFLookupTable(
    jump_table: Uint8Array,
) {

    //7. Symbol
    // Default Value

    //1. Identifier
    air(jump_table, 1, uni_id_start_ranges);
    aii(jump_table, 1, uni_id_cont_discrete);

    //3. SPACE SET
    aii(jump_table, 2, [32, 0xA0, 0x2002, 0x2003, 0x2004, 0x3000]);

    //4. TAB SET
    aii(jump_table, 2, [9]);

    //5. CARIAGE RETURN 
    aii(jump_table, 4, [13]);

    //6. LINE FEED
    aii(jump_table, 4, [10]);

    //7. Number
    air(jump_table, 5, [48, 57]);

    // For Unicode Identifier symbols
    air(jump_table, 16, [65, 90, 97, 122]);
    air(jump_table, 16, uni_id_start_ranges);
    aii(jump_table, 16, uni_id_start_discrete);
    air(jump_table, 32, uni_id_cont_ranges);
    aii(jump_table, 32, uni_id_cont_discrete);
};


/**
 * Allocates and initializes a pool of memory large enough to contain the lexer jump table.
 * @param USE_ARRAY_BUFFER Use ArrayBuffer storage, otherwise use a WebAssembly.Memory buffer.
 * @param action32bit_array_byte_size 
 * @param error8bit_array_byte_size 
 */
export function initializeUTFLookupTableNew(
    jump_table: Uint8Array,
) {
    //2. Identifier
    air(jump_table, 2, uni_id_start_ranges);
    aii(jump_table, 2, uni_id_start_discrete);

    //4. SPACE
    aii(jump_table, 4, [32, 0xA0, 0x2002, 0x2003, 0x2004, 0x3000]);

    //4. TAB
    aii(jump_table, 4, [9]);

    //8. CARIAGE RETURN 
    aii(jump_table, 8, [13]);

    //8. LINE FEED
    aii(jump_table, 8, [10]);

    //16. Number
    air(jump_table, 16, [48, 57]);

    //1. Symbol
    // Every code point not defined by now is a Symbol
    for (let i = 0; i < jump8bit_table_byte_size; i++)
        if (jump_table[i] == 0)
            jump_table[i] = 1;

    // Add Unicode Identifier Classes
    air(jump_table, 32, [65, 90, 97, 122]);
    air(jump_table, 32, uni_id_start_ranges);
    aii(jump_table, 32, uni_id_start_discrete);
    air(jump_table, 64, uni_id_cont_ranges);
    aii(jump_table, 64, uni_id_cont_discrete);
};

/**
 * Allocates and initializes a pool of memory large enough to contain the lexer jump table.
 * @param USE_ARRAY_BUFFER Use ArrayBuffer storage, otherwise use a WebAssembly.Memory buffer.
 * @param action32bit_array_byte_size 
 * @param error8bit_array_byte_size 
 */
export function initializeUTFLookupTableNewPlus(
    jump_table: Uint8Array,
) {
    //2. Identifier
    air(jump_table, TokenTypes.IDENTIFIER, uni_id_start_ranges);
    aii(jump_table, TokenTypes.IDENTIFIER, uni_id_start_discrete);

    //4. SPACE
    aii(jump_table, TokenTypes.SPACE, [32, 0xA0, 0x2002, 0x2003, 0x2004, 0x3000]);

    //4. TAB
    aii(jump_table, TokenTypes.SPACE, [9]);

    //8. CARIAGE RETURN 
    aii(jump_table, TokenTypes.NEW_LINE, [13]);

    //8. LINE FEED
    aii(jump_table, TokenTypes.NEW_LINE, [10]);

    //16. Number
    air(jump_table, TokenTypes.NUMBER, [48, 57]);

    //1. Symbol
    // Every code point not defined by now is a Symbol
    for (let i = 0; i < jump8bit_table_byte_size; i++)
        if (jump_table[i] == 0)
            jump_table[i] = TokenTypes.SYMBOL;

    // Add Unicode Identifier Classes
    air(jump_table, 32, [65, 90, 97, 122]);
    air(jump_table, 32, uni_id_start_ranges);
    aii(jump_table, 32, uni_id_start_discrete);
    air(jump_table, 64, uni_id_cont_ranges);
    aii(jump_table, 64, uni_id_cont_discrete);
};