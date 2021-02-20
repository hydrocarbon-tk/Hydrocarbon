/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Grammar } from "../types/grammar.js";
import { TokenSymbol } from "../types/symbol";
import { getTrueSymbolValue } from "./code_generating.js";
import { getUniqueSymbolName, Sym_Is_A_Production } from "./symbol.js";
import { getProductionClosure } from "./production.js";


export function getFirstTerminalSymbols(production_id: number, grammar: Grammar) {
    const closure = getProductionClosure(production_id, grammar);
    const syms = closure.filter(i => !i.atEND && !Sym_Is_A_Production(i.sym(grammar)))
        .flatMap(i => getTrueSymbolValue(<TokenSymbol>i.sym(grammar), grammar))
        .setFilter(getUniqueSymbolName);

    return syms;
}
