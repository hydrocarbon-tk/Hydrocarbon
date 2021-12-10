/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { HCG3Symbol, Item } from "@hctoolkit/common";


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
     * The type of transition that occurred
     * from the parent state to this one.
     */
    type: TransitionStateType,
    depth: number;
    parent: TransitionForestStateA;
    states: TransitionForestStateA[];
    roots: (number | Item)[];
    items: Item[];
    peek_items: Item[];
    symbols: HCG3Symbol[],
    hash_action?: { hash: string, action: string, assertion: string; };
    USED: boolean;
}
export enum TransitionStateType {
    UNDEFINED = 0,
    START = 1 << 1,
    /**
     * Transition has occurred from 
     * the consumption of a terminal
     * symbol. All transition should
     * have this set except for the 
     * initial state and the goal state.
     */
    O_TERMINAL = 1 << 2,
    /**
     * Transition has occurred from the 
     * completion of non-terminal symbol.
     */
    O_PRODUCTION = 1 << 3,
    /**
     * Node represents a branch of one or
     * more sub-nodes. Each sub-node should 
     * should be gated by an assert, peek, or 
     * consume verification instruction.
     */
    MULTI = 1 << 4,
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
     * State includes items out of the scope of the current production 
     * that should be used for disambiguating states that would
     * cause a reduction to a production ID other thane the current
     * production. 
     */
    I_OUT_OF_SCOPE = 1 << 7,
    /**
     * Consumption of tokens is not allowed
     */
    O_PEEK = 1 << 8,

    I_FORK = 1 << 9,

    /**
     * Transition has occurred from the 
     * accepting of a root item.
     */
    I_END = 1 << 10,

    /**
     * The current state represents a completed 
     * production. Used by scanner to determine
     * when to apply token assignments
     */
    COMPLETED = 1 << 11,

    O_GOTO = 1 << 12,

    LOOP = 1 << 13,

    I_GOTO_START = 1 << 14,

    I_DESCENT_START = 1 << 15,

    I_CONSUME = 1 << 16,

    I_SCANNER = 1 << 17,

    I_PASS = 1 << 18,

    I_FAIL = 1 << 19,

    I_TEST = 1 << 20,

    /**
     * This state is set when the nodes item has a skipped symbol
     * that occludes another item that consumes that symbol.
     */
    I_SKIPPED_COLLISION = 1 << 21,
}
