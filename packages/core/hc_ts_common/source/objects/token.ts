/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

import { TokenType } from '../utilities/runtime/magic_numbers.js';
import { ByteWriter, ByteReader } from './buffer_handlers.js';


/**
 * Stores source string in a global repo for use in 
 * serialization and deserialization of Tokens.
 */


/**
 * Small class to that methods to extract string information
 * and retrieve text meta data for particular tokens and token
 * sequences.
 */
export class Token {
    path: string;
    readonly source: string;
    readonly off: number;
    readonly length: number;
    private _line: number;



    static fromRange(start: Token, end: Token): Token {
        return new Token(
            start.source,
            end.off - start.off + end.length,
            start.off
        );
    }


    toJSON() {
        return {
            path: this.path,
            off: this.off,
            len: this.len,
            line: this.line,
            source: ""
        };
    }

    /**
     * Does the conversion
     */
    static from(obj: object) {
        if (typeof obj == "object")
            if ("len" in obj && "source" in obj && "off" in obj && "line" in obj) {
                return new Token(
                    (<any>obj).source,
                    +(<any>obj).len,
                    +(<any>obj).off,
                    +(<any>obj).line
                );
            }
        return new Token("", 0, 0, 0);
    }


    constructor(source: string, token_length: number, token_offset: number, line: number = -1) {
        this.source = source;
        this.length = token_length;
        this.off = token_offset;
        this._line = line;
        this.path = "";
    }

    setPath(path: string) {
        this.path = path;
        return this;
    }

    setSource(source: string) {
        return new Token(source, this.length, this.off, this.line).setPath(this.path);
    }

    private getSliceRange(start: number, end: number) {

        start = start < 0
            ? Math.max(this.off, this.off + this.length + start)
            : Math.min(this.off + start, this.off + this.length);

        end = end < 0
            ? Math.max(this.off, this.off + this.length + end)
            : Math.min(this.off + end, this.off + this.length);

        if (end < start) {
            end = this.off;
            start = this.off;
        }
        return { start, end };
    }

    /**
     * Returns a range object compatible with the LSP specification
     * for a cursor bounded text range.
     * 
     * https://microsoft.github.io/language-server-protocol/specifications/specification-current/#range
     */
    range(start: number = 0, end: number = this.length) {

        let { start: adjusted_start, end: adjusted_end } = this.getSliceRange(start, end);

        let line_start = this.line;
        let col_start = 0;
        let line_end = this.line;

        for (let i = adjusted_start; i > 0; i--) {
            col_start++;
            if (this.source.codePointAt(i) == 10)
                break;
        }
        let col_end = col_start;

        for (let i = adjusted_start; i < adjusted_end; i++, col_end++) {
            if (this.source.codePointAt(i) == 10) {
                line_end++;
                col_end = 0;
            }
        }

        return {
            start: {
                line: line_start,
                col: col_start,
            },
            end: {
                line: line_end,
                col: col_end,
            }
        };
    }

    /**
     * Return a string slice of the source bounded buy the token 
     * or a portion of the token.
     */
    slice(start: number = 0, end: number = this.length) {

        let { start: adjusted_start, end: adjusted_end } = this.getSliceRange(start, end);

        return this.source.slice(adjusted_start, adjusted_end);
    }

    /**
     * Return a new Token of the source bounded buy the existing 
     * token  or a portion of the existing token.
     */
    token_slice(start: number = 0, end: number = this.length) {

        let { start: adjusted_start, end: adjusted_end } = this.getSliceRange(start, end);

        return new Token(
            this.source,
            adjusted_end - adjusted_start,
            adjusted_start,
            this.line
        ).setPath(this.path);
    }

    toString() {
        return this.slice();
    }

    get len() {
        return this.length;
    }

    get line() {
        if (this._line < 0) {
            this._line = 0;
            for (let i = 0; i < this.off; i++)
                if (this.source.charCodeAt(i) == 10)
                    this._line++;
        }
        return this._line;
    }

    get column() {

        let i = this.off;

        for (; this.source[i] != "\n" && i >= 0; --i);

        return this.off - i;
    }

    blameDiagram(message: string, source_path: string = "") {

        const source = source_path || this.path;
        const off = this.off;
        const tl = this.length;
        const line = this.line;

        let i = this.off;

        for (; this.source[i] != "\n" && i >= 0; --i);

        const column = this.off - i;

        return message + "\n\n" + blame(
            this.source,
            off,
            tl,
            line,
            column
        );
    }

    createError(message: string, source_path: string = "") {
        return new Error(this.blameDiagram(message, source_path));
    }

    throw(message: string, source = "") {
        throw this.createError(message, source);
    }
    /**
     * Return the source string with the section covered 
     * by this token replaced with the given string.
     */
    replace(replacement_string: string) {
        return [
            this.source.slice(0, this.off),
            replacement_string,
            this.source.slice(this.off + this.len)
        ].join("");
    }

    serialize(writer: ByteWriter) {
        writer.write_byte(TokenType);
        writer.write_word(this.length);
        writer.write_word(this.off);
        writer.write_word(this.line);
        writer.write_string(this.source);
    }

    static Deserialize(reader: ByteReader): Token {

        if (reader.assert_byte(TokenType)) {
            var length = reader.read_word();
            var off = reader.read_word();
            var line = reader.read_word();
            var str = reader.read_string();
            return new Token(str, length, off, line);
        }

        return new Token("", 0, 0, 0);
    }
};

export class KernelToken {

    // The type value of this token. A type value of 0 indicates this
    // token has not yet been assigned a type value
    type: number;

    byte_offset: number;

    byte_length: number;

    // The offset to the head UTF8 codepoint
    codepoint_offset: number;

    // The combined number of codepoints with the range covered by this token
    codepoint_length: number;

    line: number;

    static new(): KernelToken {
        return new KernelToken(0, 0, 0, 0, 0);
    }

    constructor(
        type: number,
        byte_offset: number,
        byte_length: number,
        codepoint_offset: number,
        codepoint_length: number
    ) {
        this.type = type;
        this.byte_offset = byte_offset;
        this.byte_length = byte_length;
        this.codepoint_offset = codepoint_offset;
        this.codepoint_length = codepoint_length;
        this.line = 0;
    }

    copy() {
        const tok = new KernelToken(this.type, this.byte_offset, this.byte_length, this.codepoint_offset, this.codepoint_length);

        tok.line = this.line;

        return tok;
    }

    impersonate(token: KernelToken) {
        this.type = token.type;
        this.byte_offset = token.byte_offset;
        this.byte_length = token.byte_length;
        this.codepoint_offset = token.codepoint_offset;
        this.codepoint_length = token.codepoint_length;
        this.line = token.line;
    }

    reset() {
        this.type = 0;
        this.byte_offset = 0;
        this.byte_length = 0;
        this.codepoint_offset = 0;
        this.codepoint_length = 0;
        this.line = 0;
    }
}

const HORIZONTAL_TAB = 9,
    arrow = "~",
    line = "-",
    thick_line = "=";

import { col_x11, xtColor, xtReset, xtF, xtBold, xtUnderline, xtInvert } from "@candlelib/paraffin/build/color/color.js";


const u_col = xtF(xtColor(col_x11.Red1), xtBold);
const u_col_r = xtF(xtReset);
export function blame(
    source: string,
    offset: number,
    token_length: number,
    line: number,
    column: number
) {
    if (!source) return "";

    const tab_size = 4, window_size = 400;
    // Get the text from the proceeding and the following lines; 
    // If current line is at index 0 then there will be no proceeding line;
    // Likewise for the following line if current line is the last one in the string.

    let
        line_start = offset - column,
        char = column,
        l = line,
        str = source,
        len = str.length,
        sp = " ";

    token_length = token_length;

    let prev_start = 0,
        next_start = 0,
        next_end = 0,
        i = 0;

    //get the start of the proceeding line
    for (i = line_start; --i > 0 && str.codePointAt(i) !== 10;);
    prev_start = i;


    //get the end of the current line...
    for (i = offset + token_length; i < len && str.codePointAt(i) !== 10; i++);
    next_start = i;

    //and the next line
    for (i++; i < len && str.codePointAt(i) !== 10; i++);
    next_end = i;

    let pointer_pos = char - (line_start > 0 ? 1 : 0);

    for (i = line_start; i < offset; i++)
        if (str.codePointAt(i) == HORIZONTAL_TAB)
            pointer_pos += tab_size - 1;

    prev_start = Math.max(prev_start, 0);
    line_start = Math.max(line_start, 0);
    next_start = Math.max(next_start, 0);
    //find the location of the offending symbol
    const
        prev_line = str.slice(prev_start + (prev_start > 0 ? 1 : 0), line_start).replace(/\n/g, "").replace(/\t/g, sp.repeat(tab_size)),
        curr_line = str.slice(line_start + (line_start > 0 ? 1 : 0), next_start).replace(/\n/g, "").replace(/\t/g, sp.repeat(tab_size)),
        next_line = str.slice(next_start + (next_start > 0 ? 1 : 0), next_end).replace(/\n/g, "").replace(/\t/g, " "),

        //get the max line length;

        max_length = Math.max(prev_line.length, curr_line.length, next_line.length),
        min_length = Math.min(prev_line.length, curr_line.length, next_line.length),
        length_diff = max_length - min_length,

        //Get the window size;
        w_size = window_size,
        w_start = Math.max(0, Math.min(pointer_pos - w_size / 2, max_length)),
        w_end = Math.max(0, Math.min(pointer_pos + w_size / 2, max_length)),
        w_pointer_pos = Math.max(0, Math.min(pointer_pos, max_length + 1)) - w_start - (line_start == 0 ? 1 : 0),


        //append the difference of line lengths to the end of the lines as space characters;

        prev_line_o = (prev_line + sp.repeat(length_diff)).slice(w_start, w_end),
        curr_line_o = (curr_line + sp.repeat(length_diff)).slice(w_start, w_end),
        next_line_o = (next_line + sp.repeat(length_diff)).slice(w_start, w_end),

        trunc = w_start !== 0 ? "..." : "",

        line_number = (n: number) => ` ${(sp.repeat(3) + (n + 1)).slice(-(l + 1 + "").length)}: `,

        error_border = thick_line.repeat(curr_line_o.length + line_number.length + 8 + trunc.length);

    return [
        //* brdr */`\n${error_border}`,
        /* prev */`${l - 1 > -1 ? line_number(l - 1) + trunc + prev_line_o + (prev_line_o.length < prev_line.length ? "..." : "") : ""}`,
        /* curr */`${true ? line_number(l) + trunc + curr_line_o + (curr_line_o.length < curr_line.length ? "..." : "") : ""}`,
        /* arrw */`    ${(" ").repeat(Math.max(0, w_pointer_pos + trunc.length + line_number(l + 1).length - 4)) + u_col + arrow.repeat(token_length) + u_col_r}`,
        /* next */`${next_start < str.length ? line_number(l + 1) + trunc + next_line_o + (next_line_o.length < next_line.length ? "..." : "") : ""}`,
        ///* brdr */`${error_border}`
    ]
        .filter(e => !!e)
        .join("\n");
}