/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { TokenSymbol } from '@candlelib/hydrocarbon/build/types/types/grammar_nodes';
import { Item } from "../utilities/item";
import { HCG3Symbol } from './grammar_nodes';


export interface TransitionForestNode {
    last_progress?: number;
    progress?: boolean;
    depth: number;
    item_ids: string[];
    sym: string;
    roots: Item[];
    next: TransitionForestNode[];
    closure: Item[];
    starts?: Item[];
    final_count: number;

    tree_depth: number;

    root_id?: number;
}
export interface TransitionForestState {
    type: TransitionStateType,
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
    previous_group?: TransitionForestState;
}


export interface TransitionForestStateA {
    /**
     * The type of transition that occured
     * from the parent state to this one.
     */
    type: TransitionStateType,
    depth: number;
    parent: TransitionForestStateA;
    states: TransitionForestStateA[];
    closure: Item[];
    roots: Item[];
    transitioned_items: Item[];
    symbols: TokenSymbol[],
}
export const enum TransitionStateType {
    UNDEFINED = 0,
    START = 1 << 1,
    /**
     * Transition has occurred from 
     * the consumption of a terminal
     * symbol. All transition should
     * have this set except for the 
     * initial state and the goal state.
     */
    TERMINAL = 1 << 2,
    /**
     * Transition has occurred from the 
     * completion of non-terminal symbol.
     */
    PRODUCTION = 1 << 3,

    /**
     * Transition has occurred from the 
     * accepting of a root item.
     */
    END = 1 << 4,

    /**
     * Transition has occurred from the 
     * accepting of a completed root item.
     */
    ACCEPT = 1 << 5,

    /**
     * Transition has occurred from the 
     * accepting of a completed root item.
     */
    AMBIGUOUS = 1 << 6,

    /**
     * Closure includes extended items that 
     * should be used for peeking. 
     */
    EXTENDED = 1 << 7,
    /**
     * Consumption of tokens is not allowed
     */
    PEEK = 1 << 8
}