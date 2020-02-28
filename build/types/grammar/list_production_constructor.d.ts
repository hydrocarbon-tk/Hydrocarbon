import { Lexer } from "@candlefw/whind";
import { Production } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment.js";
export default class implements Production {
    id: -1;
    type: "production";
    name: string;
    val: number;
    subtype: string;
    IS_OPTIONAL: boolean;
    constructor(sym: Array<any>, env: GrammarParserEnvironment, lex: Lexer);
}
