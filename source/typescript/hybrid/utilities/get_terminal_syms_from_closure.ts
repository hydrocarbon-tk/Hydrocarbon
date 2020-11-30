import { EOF_SYM, Grammar } from "../../types/grammar.js";
import { TokenSymbol } from "../../types/Symbol";
import { Item } from "../../util/common.js";
import { isSymAProduction } from "./utilities.js";
export function getTerminalSymsFromClosure(closure: Item[], grammar: Grammar): TokenSymbol[] {
    const syms = [];

    for (const item of closure)
        if (item.atEND) {
            syms.push(EOF_SYM);
        } else {
            const sym = item.sym(grammar);
            if (!isSymAProduction(sym))
                syms.push(sym);
        }

    return syms.setFilter(s => s.val);
}
