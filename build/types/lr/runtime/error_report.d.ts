import { Lexer } from "@candlefw/whind";
import { ParserResultData } from "../../types/parser_result_data.js";
export declare function errorReport(tk: number, lex: Lexer, off: number, cycles: number, total_cycles: number, fork_depth: number): ParserResultData;
