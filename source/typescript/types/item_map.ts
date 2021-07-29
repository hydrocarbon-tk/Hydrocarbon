/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Item } from "../utilities/item";
import { TokenSymbol } from "./symbol";

export interface ItemMapEntry {
    item: Item;
    reset_sym: string[];
    /**
     * List of all items that can be derived from this item
     */
    closure: string[];

    hash: string,

    containing_items: Set<string>;

    excludes: TokenSymbol[][],

    /**
     * Measure of the number of steps need to reach
     * this item from the root production
     */
    depth?: number;

    /**
     * Symbols that can be skipped over at this item
     */
    skippable: Set<string>;

    /**
     * Set of all symbols that follow an item that has reached its last position.
     */
    follow: Set<string>;

    /**
     * Set of all productions that can reach this item
     */
    breadcrumbs: Set<number>;

    /**
     * An positionally unique identifier for the symbol
     */
    sym_uid: number;
}
