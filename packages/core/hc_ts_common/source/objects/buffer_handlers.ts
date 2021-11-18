/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */


/**
 * This function interface a parse run on an input provided by a
 * a an object that implements the ByteReader interface.
 */

import { hashString } from '../index.js';
import { StringType } from "../utilities/runtime/magic_numbers";
import {
    getTypeAt,
    get_token_length_from_code_point,
    get_ut8_byte_length_from_code_point,
    get_utf8_code_point_from
} from '../utilities/runtime/utf8.js';

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
    peek_byte(): number { return 0; }
    peek_short(): number { return 0; }
    peek_word(): number { return 0; }
    peek_double_word(): number { return 0; }
    peek_double(): number { return 0; }
    peek_float(): number { return 0; }

    read_byte(): number { return 0; }
    read_short(): number { return 0; }
    read_word(): number { return 0; }
    read_double_word(): number { return 0; }
    read_double(): number { return 0; }
    read_float(): number { return 0; }

    assert_byte(val: number): boolean { return false; }
    assert_short(val: number): boolean { return false; }
    assert_word(val: number): boolean { return false; }
    assert_double_word(val: number): boolean { return false; }
    assert_double(val: number): boolean { return false; }
    assert_float(val: number): boolean { return false; }

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

    read_string(): string { return ""; };

    offset_at_end(index: number) { return false; };
}



export class ByteWriter {

    buffer: ArrayBuffer;

    cursor: number;

    dv: DataView;
    interned_strings: Map<string, number>;

    constructor() {
        this.buffer = new ArrayBuffer(512);
        this.cursor = 0;
        this.dv = new DataView(this.buffer);
        this.interned_strings = new Map;
    }

    get_chunk(): ArrayBuffer {
        return this.buffer.slice(0, this.cursor);
    }

    purge() {
        this.cursor = 0;
    }

    write_byte(byte: number) {
        if (this.cursor + 1 >= 512) this.purge();
        this.dv.setUint8(this.cursor, byte >>> 0);
        this.cursor++;
    }

    write_short(short: number) {
        if (this.cursor + 2 >= 512) this.purge();
        this.dv.setUint16(this.cursor, short >>> 0);
        this.cursor += 2;
    }

    write_word(word: number) {
        if (this.cursor + 4 >= 512) this.purge();
        this.dv.setUint32(this.cursor, word >>> 0);
        this.cursor += 4;
    }

    write_float(float: number) {
        if (this.cursor + 4 >= 512) this.purge();
        this.dv.setFloat32(this.cursor, float);
        this.cursor += 4;
    }

    write_double_word(double_word: number) {
        if (this.cursor + 8 >= 512) this.purge();
        this.dv.setFloat64(this.cursor, double_word);
        this.cursor += 8;
    }

    write_double(double_word: number) {
        if (this.cursor + 8 >= 512) this.purge();
        this.dv.setFloat64(this.cursor, double_word);
        this.cursor += 8;
    }

    write_string(str: string): number {

        //Get the hash of the string
        const hash = hashString(str);

        const ptr = this.cursor;

        this.write_byte(StringType >>> 0);

        if (this.interned_strings.has(hash)) {

            const ptr = <number>this.interned_strings.get(hash);

            this.write_byte(0xF8);

            this.write_short(ptr);

            return <number>ptr;
        }

        this.interned_strings.set(hash, ptr);

        let i = 0, j = 0, l = str.length;

        for (; i < l; i++) {

            const code_point: number = <number>str.codePointAt(i);

            if ((code_point & 0x7F) == code_point) {
                this.write_byte((code_point & 0x7F));
            } else if ((code_point & 0x7FF) == code_point) {
                this.write_byte(0xC0 | ((code_point >> 6) & 0x1F));
                this.write_byte(0x80 | ((code_point & 0x3F)));
            } else if ((code_point & 0xFFFF) == code_point) {
                this.write_byte(0xE0 | ((code_point >> 12) & 0xF));
                this.write_byte(0x80 | ((code_point >> 6) & 0x3F));
                this.write_byte(0x80 | ((code_point & 0x3F)));
            } else {
                this.write_byte(0xF0 | ((code_point >> 18) & 0x7));
                this.write_byte(0x80 | ((code_point >> 12) & 0x3F));
                this.write_byte(0x80 | ((code_point >> 6) & 0x3F));
                this.write_byte(0x80 | ((code_point & 0x3F)));
            }

            if (code_point > 65535) {
                i++;
            }
        }

        this.write_byte(0xFF);

        return j;
    }
}