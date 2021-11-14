/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */


/**
 * This function interface a parse run on an input provided by a
 * a an object that implements the ByteReader interface.
 */

import {
    getTypeAt,
    get_token_length_from_code_point,
    get_ut8_byte_length_from_code_point,
    get_utf8_code_point_from
} from './utf8.js';

/**
 * Abstract class for a byte reader. Represents
 * an input stream with a bidirectional cursor.
 */
export class ByteReader {

    static new(): ByteReader {
        return new ByteReader;
    }

    /**
     * Returns true if the cursor has reached the end of
     * the input stream.
     */
    END(): boolean { return true; }

    /**
     * Advances the cursor up-to 4-bytes forward and
     * returns a Word (4byte) covering the next 4 bytes at
     * the new cursor position.
     *
     * If the cursor has reached the end of the input stream
     * then the previous byte value is returned.
     */
    next(amount: number): number { return 0; }

    /**
     * Returns the word at the current cursor position, little
     * Endian
     */
    word(): number {
        return 0;
    }

    /**
    * Returns the byte at the current cursor position.
    */
    byte(): number {
        return 0;
    }
    /**
     * Returns UTF8 codepoint information at the current cursor position.
     */
    codepoint() {
        return get_utf8_code_point_from(this.word());
    }

    codepoint_byte_length() {
        return get_ut8_byte_length_from_code_point(this.codepoint());
    }

    codepoint_length() {
        return get_token_length_from_code_point(this.codepoint());
    }

    class() {
        return getTypeAt(this.codepoint());
    }

    /**
     * Resets the cursor back to the value of the `offset`
     * argument. Should the offset value exceed the limits
     * of the underlying implementation, `false` is returned
     * , indicating a parse failure as the input stream can
     * no longer satisfy the requirements of the parser.
     */
    setTo(offset: number): boolean { return true; }


    /**
     * Return a new instance of byte reader with the same
     * state as the source reader. Implementation should provide
     * adequate shared buffers or other resources used to cache the input 
     * stream data, as multiple ByteReaders may be required read
     * data at different cursor positions.
     */
    clone(): ByteReader { return new ByteReader; }

    offset_at_end(index: number) { return false; };
}


