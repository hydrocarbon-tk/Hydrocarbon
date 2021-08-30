/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Item } from "../utilities/item";
import { TokenSymbol } from "./grammar_nodes";
import { Leaf, TRANSITION_TYPE } from "./transition_node";

export interface TransitionGroup {
    syms: TokenSymbol[];
    items: Item[];
    closure: Item[];
    hash: string;
    FIRST: boolean;
    LAST: boolean;
    prods: number[];
    leaves: Leaf[];
    root_id: number,
    transition_types: TRANSITION_TYPE[];
};

export type TransitionClauseGenerator = Generator<TransitionGroup>;

export type MultiItemReturnObject = {
    leaves: Leaf[];
    prods: number[];
};

export type SingleItemReturnObject = {
    leaf: Leaf;
};
