/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Leaf, TRANSITION_TYPE } from "./transition_node";
import { Item } from "../utilities/item";
import { SKExpression } from "../skribble/types/node";
import { TokenSymbol } from "./grammar_nodes";


export type TransitionGroup = {
    syms: TokenSymbol[];
    code: SKExpression[];
    items: Item[];
    hash: string;
    FIRST: boolean;
    LAST: boolean;
    prods: number[];
    leaves: Leaf[];
    PUIDABLE: boolean,
    root_id: number,
    transition_types: TRANSITION_TYPE[];
};
export type TransitionClauseGenerator = Generator<TransitionGroup>;
export type MultiItemReturnObject = {
    root: SKExpression[];
    leaves: Leaf[];
    prods: number[];
};

export type SingleItemReturnObject = {
    leaf: Leaf;
};
