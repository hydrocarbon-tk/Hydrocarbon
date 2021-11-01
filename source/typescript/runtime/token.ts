/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Lexer } from "@candlelib/wind";

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
    toJSON() {
        return [``];
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

    createError(message, source_path = "") {

        const lex = new Lexer(this.source);

        lex.source = source_path;

        lex.off = this.off;
        lex.tl = this.length;
        lex.line = this.line;

        let i = this.off;

        for (; this.source[i] != "\n" && i >= 0; --i);

        lex.column = this.off - i;

        return new Error(lex.errorMessage(message));
    }

    throw(message, source = "") {
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
    }

    copy() {
        const tok = new KernelToken(this.type, this.byte_offset, this.byte_length, this.codepoint_offset, this.codepoint_length);

        tok.line = this.line;

        return tok;
    }

    clone(token: KernelToken) {
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
