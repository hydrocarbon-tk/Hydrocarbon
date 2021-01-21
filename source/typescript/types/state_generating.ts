import { TRANSITION_TYPE } from "./recognizer_state";
import { Symbol } from "./symbol";
import { Item } from "../utilities/item";
import { SC } from "../utilities/skribble";


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
