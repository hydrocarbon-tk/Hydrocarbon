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
    readonly tl: number;
    private _line: number;

    static fromRange(start: Token, end: Token): Token {

        return new Token(
            start.source,
            start.path,
            end.off - start.off + end.tl,
            start.off
        );
    }


    constructor(source: string, source_path: string, token_length: number, offset: number, line: number = -1) {
        this.source = source;
        this.path = source_path;
        this.tl = token_length;
        this._line = line;
        this.off = offset;
    }

    slice() {
        return this.source.slice(this.off, this.off + this.tl);
    }

    toString() {
        return this.slice();
    }
    toJSON() {
        return [``];
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

    throw(message) {
        const lex = new Lexer(this.source);

        lex.off = this.off;
        lex.tl = this.tl;
        lex.line = this.line;

        let i = this.off;

        for (; this.source[i] != "\n" && i >= 0; --i);

        lex.column = this.off - i - 1;

        lex.throw(message);

        throw Error("Could not parse data");
    }
};
