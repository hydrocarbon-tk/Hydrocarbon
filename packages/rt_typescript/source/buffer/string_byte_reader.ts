/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

import { ByteReader, fillByteBufferWithUTF8FromString, get_utf8_code_point_from } from '@hctoolkit/common';

/**
 * Naive implementation of a byte reader for a JS UTF16 string
 */
export class StringByteReader extends ByteReader {

    buffer: Uint8Array;
    cursor: number;
    internal_word: number;
    internal_code_point: number;
    constructor(string: string, buffer: any = null) {

        super();

        this.buffer = buffer;

        if (string && !buffer) {


            const temp_buffer = new Uint8Array((string.length + 1) * 4);

            const actual_length = fillByteBufferWithUTF8FromString(string, temp_buffer, temp_buffer.length);

            this.buffer = new Uint8Array(temp_buffer.buffer, 0, actual_length);
        }

        this.cursor = 0;

        this.internal_word = 0;

        this.internal_code_point = 0;

        this.next(0);
    }

    END() { return this.cursor >= this.buffer.length; }

    next(amount: number = 1) {

        this.cursor += amount;
        this.internal_code_point = 0;

        if (this.END())
            return 0;


        if (amount == 1) {
            this.internal_word = (this.internal_word >> 8) | (this.byte() << 24);
        } else {

            const diff = Math.max(Math.min(4, this.buffer.length - this.cursor), 0);

            let start = this.cursor;

            let end = this.cursor + diff;

            let word = 0;

            for (let i = start, offset = 24; i < end; i++, offset -= 8)
                word |= this.buffer[i] << offset;

            this.internal_word = word;
        }

        this.internal_code_point = get_utf8_code_point_from(this.internal_word);

        if (this.internal_code_point == 0)
            debugger;

        return this.buffer[this.cursor];
    };

    byte() {
        return this.buffer[this.cursor];
    }

    codepoint() {
        return this.internal_code_point;
    }

    setTo(offset: number) {

        if (offset < 0)
            return false;

        if (offset > this.buffer.length)
            offset = this.buffer.length;

        this.cursor = offset;

        this.next(0);

        return true;
    }

    word(): number {
        return this.internal_word;
    }

    clone() {
        const br = new StringByteReader("", this.buffer);
        br.internal_code_point = this.internal_code_point;
        br.internal_word = this.internal_word;
        br.cursor = this.cursor;
        return br;
    }

    offset_at_end(index: number) {
        return index >= this.buffer.length;
    };
}
