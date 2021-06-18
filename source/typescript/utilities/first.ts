/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { HCG3Grammar } from "../types/grammar_nodes.js";
import { TokenSymbol } from "../types/symbol";
import { getProductionClosure } from "./production.js";
import { getTrueSymbolValue, getUniqueSymbolName, Sym_Is_A_Production } from "../grammar/nodes/symbol.js";


export function getFirstTerminalSymbols(production_id: number, grammar: HCG3Grammar) {
    const closure = getProductionClosure(production_id, grammar);
    const syms = closure.filter(i => !i.atEND && !Sym_Is_A_Production(i.sym(grammar)))
        .flatMap(i => getTrueSymbolValue(<TokenSymbol>i.sym(grammar), grammar))
        .setFilter(getUniqueSymbolName);

    return syms;
}
