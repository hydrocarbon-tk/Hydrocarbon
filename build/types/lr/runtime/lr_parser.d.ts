import { Lexer } from "@candlefw/whind";
import { ParserData } from "../../types/parser_data.js";
import { ParserResultData } from "../../types/parser_result_data.js";
import { ParserEnvironment } from "../../types/parser_environment.js";
declare const _default: (lex: Lexer, data: ParserData, environment: ParserEnvironment) => ParserResultData;
/**
    Parses an input. Returns an object with parse results and an error flag if parse could not complete.
    @param lex: Lexer - lexer object with an interface defined in candlefw/whind.
    @param data: parser data that includs the look up tables and built in parse action functions.
    @param environment: Environment object containing user defined parse action functions.
*/
export default _default;
