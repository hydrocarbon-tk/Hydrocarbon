/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Item } from "../utilities/item";
import { HCG3Symbol } from './grammar_nodes';


export interface TransitionTreeNode {
    last_progress?: number;
    progress?: boolean;
    depth: number;

    item_ids: string[];
    sym: string;
    roots: Item[];
    next: TransitionTreeNode[];
    closure: Item[];
    starts?: Item[];
    final_count: number;

    tree_depth: number;

    root_id?: number;
}
export interface ClosureGroup {
    sym: HCG3Symbol;
    item_id?: string;
    index: number;
    closure: Item[];
    final: number;
    /**
     * Items that transition on the sym
     */
    starts?: Item[];
    tree_depth?: number;
    production_shift_items: Item[];
    previous_group?: ClosureGroup;
}
