export function errorReport(tk, lex, off, cycles, total_cycles, fork_depth) {
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
