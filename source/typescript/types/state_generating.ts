import { TRANSITION_TYPE } from "./recognizer_state.js";
import { Symbol } from "./symbol.js";
import { Item } from "../utilities/item.js";
import { SC } from "../utilities/skribble.js";


export type SelectionGroup = {
    syms: Symbol[];
    code: SC;
    items: Item[];
    hash: string;
    FIRST: boolean;
    LAST: boolean;
    prods: number[];
    transition_types: TRANSITION_TYPE[];
};
export type SelectionClauseGenerator = Generator<SelectionGroup>;
export type MultiItemReturnObject = {
    root: SC;
    leaves: SC[];
    prods: number[];
};

export type SingleItemReturnObject = {
    root: SC;
    leaf: SC;
    prods: number[];
};
