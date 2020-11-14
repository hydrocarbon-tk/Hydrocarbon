import { Grammar, SymbolType } from "../../types/grammar.js";
import { Symbol } from "../../types/Symbol";
import { Item } from "../../util/common.js";
export function getTerminalSymsFromClosure(closure: Item[], grammar: Grammar): Symbol[] {
    const syms = [];

    for (const item of closure)
        if (item.atEND) {
            syms.push({
                type: SymbolType.END_OF_ITEM,
                val: SymbolType.END_OF_ITEM
            });
        } else {
            const sym = item.sym(grammar);
            if (sym.type !== "production")
                syms.push(sym);
        }

    return syms.setFilter(s => s.val);
}
