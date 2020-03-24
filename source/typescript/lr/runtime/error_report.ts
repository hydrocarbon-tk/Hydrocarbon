import { Lexer } from "@candlefw/wind";
import { ParserResultData } from "../../types/parser_result_data.js";

export function errorReport<T>(tk: number, lex: Lexer, off: number, cycles: number, total_cycles: number, fork_depth: number): ParserResultData<T> {
    if (tk == 0) {
        return {
            value: null,
            error: lex.errorMessage("Unexpected end of input"),
            cycles,
            total_cycles,
            off,
            fork_depth,
            efficiency: 0
        };
    }
    else {
        return {
            value: null,
            error: lex.errorMessage(`Unexpected token [${lex.tx}]`),
            cycles,
            total_cycles,
            off,
            fork_depth,
            efficiency: 0
        };
    }
}
