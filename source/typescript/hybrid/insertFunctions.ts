import { stmt, JSNode } from "@candlefw/js";

export function insertFunctions(item, grammar): JSNode[] {
    const stmts: JSNode[] = [];
    //Check for functions
    const fns = item.getFunctions(grammar);

    for (const fn of fns) {

        if (!fn.txt) {
            stmts.push(stmt(`e.fn.${fn.name}(lex, e, e.eh, sym)`));
        } else {
            stmts.push(stmt(fn.txt));
        }

    }

    return stmts;
}
