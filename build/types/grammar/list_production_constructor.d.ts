import { Production } from "../types/grammar";
import { Lexer } from "@candlefw/whind";
import { GrammarParserEnvironment } from "./grammar_compiler_environment";
export default class implements Production {
    id: -1;
    type: "production";
    name: string;
    val: number;
    subtype: string;
    IS_OPTIONAL: boolean;
    constructor(sym: Array<any>, env: GrammarParserEnvironment, lex: Lexer);
}
