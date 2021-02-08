import { Leaf, TRANSITION_TYPE } from "./transition_node";
import { Symbol } from "./symbol";
import { Item } from "../utilities/item";
import { SC } from "../utilities/skribble";


export type TransitionGroup = {
    syms: Symbol[];
    code: SC;
    items: Item[];
    hash: string;
    FIRST: boolean;
    LAST: boolean;
    prods: number[];
    leaves: Leaf[];
    transition_types: TRANSITION_TYPE[];
};
export type TransitionClauseGenerator = Generator<TransitionGroup>;
export type MultiItemReturnObject = {
    root: SC;
    leaves: Leaf[];
    prods: number[];
};

export type SingleItemReturnObject = {
    leaf: Leaf;
};
