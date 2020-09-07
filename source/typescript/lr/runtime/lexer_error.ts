import { Lexer } from "@candlefw/wind";
export class LexerError extends Error {
    message: string;

    lexer: Lexer;
    constructor(message, lexer: Lexer) {
        super("");
        this.message = message;
        this.lexer = lexer.copy();
    }

    toString() {
        return this.lexer.errorMessage(this.message);
    }

    get stack(): string {
        return this.lexer.errorMessage(this.message) + super.stack;
    }
}
