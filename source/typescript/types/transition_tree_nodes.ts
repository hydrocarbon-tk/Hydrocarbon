/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Symbol, TokenSymbol } from "./symbol";
import { Item } from "../utilities/item";


export interface TransitionTreeNode {
    last_progress?: number;
    progress?: boolean;
    depth: number;

    item_ids: string[];
    sym: string;
    unskippable: TokenSymbol[];
    roots: Item[];
    next: TransitionTreeNode[];
    closure: Item[];
    starts?: Item[];
    final_count: number;

    root_id?: number;
}
export interface ClosureGroup {
    sym: Symbol;
    item_id?: string;
    index: number;
    closure: Item[];
    unskippable?: TokenSymbol[];
    final: number;
    /**
     * Items that transition on the sym
     */
    starts?: Item[];
    root_id?: number;

    production_shift_items: Item[];
}
