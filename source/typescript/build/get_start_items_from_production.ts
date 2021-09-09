/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { GrammarProduction } from '../types/grammar_nodes';
import { Item } from "../utilities/item.js";

export function getStartItemsFromProduction(production: GrammarProduction): Item[] {
    return production.bodies.map(b => new Item(b.id, b.length, 0));
}
