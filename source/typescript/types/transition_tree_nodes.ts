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
}
export interface closure_group {
    sym: Symbol;
    item_id?: string;
    index: number;
    closure: Item[];
    unskippable?: TokenSymbol[];
    final: number;
    starts?: Item[];
}
