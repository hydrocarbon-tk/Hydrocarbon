/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

import { initializeUTFLookupTableNewPlus, jump8bit_table_byte_size } from '../parser_memory_new.js';

export let char_lu_table: Uint8Array = new Uint8Array(jump8bit_table_byte_size);

initializeUTFLookupTableNewPlus(char_lu_table);

export function fillByteBufferWithUTF8FromString(string: string, buffer: Uint8Array, max_length) {

    let i = 0, j = 0, l = string.length;

    for (; i < l && j < max_length - 4; i++) {

        const code_point = string.codePointAt(i);

        if ((code_point & 0x7F) == code_point) {
            buffer[j++] = (code_point & 0x7F);
        } else if ((code_point & 0x7FF) == code_point) {
            buffer[j++] = 0xC0 | ((code_point >> 6) & 0x1F);
            buffer[j++] = 0x80 | ((code_point & 0x3F));
        } else if ((code_point & 0xFFFF) == code_point) {
            buffer[j++] = 0xE0 | ((code_point >> 12) & 0xF);
            buffer[j++] = 0x80 | ((code_point >> 6) & 0x3F);
            buffer[j++] = 0x80 | ((code_point & 0x3F));
        } else {
            buffer[j++] = 0xF0 | ((code_point >> 18) & 0x7);
            buffer[j++] = 0x80 | ((code_point >> 12) & 0x3F);
            buffer[j++] = 0x80 | ((code_point >> 6) & 0x3F);
            buffer[j++] = 0x80 | ((code_point & 0x3F));
        }

        if (code_point > 65535) {
            i++;
        }
    }

    //Ensure input is null terminated
    buffer[j] = 0;

    return j;
}

/////////////////////////////////////////////
// OTHER FUNCTIONS
/////////////////////////////////////////////
export function get_ut8_byte_length_from_code_point(code_point: number): number {
    if ((code_point) == 0) {
        return 1;
    }
    else if ((code_point & 0x7F) == code_point) {
        return 1;
    }
    else if ((code_point & 0x7FF) == code_point) {
        return 2;
    }
    else if ((code_point & 0xFFFF) == code_point) {
        return 3;
    }
    else {
        return 4;
    };
}

export function get_token_length_from_code_point(code_point: number): number {
    if (code_point > 0xFFFF)
        return 2;
    return 1;
}

export function get_utf8_code_point_from(word: number): number {


    if (word & 0x80000000) {

        const a = (word >>> 24) & 0xFF;
        const b = (word >>> 16) & 0xFF;
        const c = (word >>> 8) & 0xFF;
        const d = (word >>> 0) & 0xFF;


        if ((word & 0xE0C00000) >>> 0 == 0xC0800000)
            return ((a & 0x1F) << 6) | b & 0x3F;

        if ((word & 0xF0C0C000) >>> 0 == 0xE0808000)
            return ((a & 0xF) << 12) | ((b & 0x3F) << 6) | (c & 0x3F);

        if ((word & 0xF8C0C0C0) >>> 0 == 0xF0808080)
            return ((a & 0x7) << 18) | ((b & 0x3F) << 12) | ((c & 0x3F) << 6) | (d & 0x3F);

    } else
        return (word >>> 24) & 0xFF;

    return 0;
}

export function getTypeAt(code_point: number): number { return (char_lu_table[code_point] & 0x1F); }