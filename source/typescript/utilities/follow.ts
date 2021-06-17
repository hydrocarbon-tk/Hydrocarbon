/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { HCG3Grammar } from "../types/grammar_nodes";
import { TokenSymbol } from "../types/symbol";
import { Item } from "./item.js";


export function getFollow(production_id: number, grammar: HCG3Grammar): TokenSymbol[] {
    const prod = grammar[production_id];

    return prod.bodies
        .map(b => new Item(b.id, b.length, b.length))
        .flatMap(i => [...grammar.item_map.get(i.id).follow.values()])

        .setFilter()
        .map(sym => <TokenSymbol>grammar.meta.all_symbols.get(sym));
}
