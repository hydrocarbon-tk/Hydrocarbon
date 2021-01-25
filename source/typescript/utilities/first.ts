import { Grammar } from "../types/grammar.js";
import { TokenSymbol } from "../types/symbol";
import { getTrueSymbolValue } from "./code_generating.js";
import { getUniqueSymbolName, symIsAProduction } from "./symbol.js";
import { getProductionClosure } from "./production.js";


export function getFirst(production_id: number, grammar: Grammar) {
    const closure = getProductionClosure(production_id, grammar);
    const syms = closure.filter(i => !i.atEND && !symIsAProduction(i.sym(grammar)))
        .flatMap(i => getTrueSymbolValue(<TokenSymbol>i.sym(grammar), grammar))
        .setFilter(getUniqueSymbolName);

    return syms;
}
