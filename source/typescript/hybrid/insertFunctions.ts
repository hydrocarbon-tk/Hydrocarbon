import { stmt, JSNode } from "@candlefw/js";

export function insertFunctions(item, grammar, LL: boolean = false): string[] {
    const stmts: string[] = [];
    //Check for functions
    const fns = item.getFunctions(grammar);

    for (const fn of fns) {

        if (!fn.txt) {
            stmts.push(`e.fn.${fn.name}(l, e, s, ${!LL})`);
        } else {
            stmts.push(fn.txt);
        }

    }

    return stmts;
}
