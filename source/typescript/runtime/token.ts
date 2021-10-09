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
    readonly path: string;
    readonly source: string;
    readonly off: number;
    readonly length: number;
    private _line: number;

    static fromRange(start: Token, end: Token): Token {

        return new Token(
            start.source,
            start.path,
            end.off - start.off + end.length,
            start.off
        );
    }


    constructor(source: string, source_path: string, token_length: number, token_offset: number, line: number = -1) {
        Object.defineProperty(this, 'source', {
            enumerable: false,
            value: source
        });
        Object.defineProperty(this, 'length', {
            enumerable: false,
            value: token_length
        });
        Object.defineProperty(this, 'off', {
            enumerable: false,
            value: token_offset
        });
        Object.defineProperty(this, '_line', {
            enumerable: false,
            writable: true,
            value: line
        });
        Object.defineProperty(this, 'path', {
            enumerable: false,
            writable: true,
            value: source_path
        });
    }

    /**
     * Return a string slice of the source bounded buy the token 
     * or a portion of the token.
     * @param start 
     * @param end 
     * @returns 
     */
    slice(start: number = 0, end: number = this.length) {

        let adjusted_start = start < 0
            ? Math.max(this.off, this.off + this.length + start)
            : Math.min(this.off + start, this.off + this.length);

        let adjusted_end = end < 0
            ? Math.max(this.off, this.off + this.length + end)
            : Math.min(this.off + end, this.off + this.length);

        if (adjusted_end < adjusted_start) {
            adjusted_end = this.off;
            adjusted_start = this.off;
        }

        return this.source.slice(adjusted_start, adjusted_end);
    }

    /**
     * Return a new Token of the source bounded buy the existing 
     * token  or a portion of the existing token.
     * @param start 
     * @param end 
     * @returns 
     */
    token_slice(start: number = 0, end: number = this.length) {
        let adjusted_start = start < 0
            ? Math.max(this.off, this.off + this.length + start)
            : Math.min(this.off + start, this.off + this.length);

        let adjusted_end = end < 0
            ? Math.max(this.off, this.off + this.length + end)
            : Math.min(this.off + end, this.off + this.length);

        if (adjusted_end < adjusted_start) {
            adjusted_end = this.off;
            adjusted_start = this.off;
        }

        return new Token(
            this.source,
            this.path,
            adjusted_end - adjusted_start,
            adjusted_start,
            this.line
        );
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

    createError(message, source = "") {

        const lex = new Lexer(this.source);

        lex.source = source;

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


