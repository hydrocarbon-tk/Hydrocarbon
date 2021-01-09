import { Symbol, TokenSymbol } from "../../types/Symbol";
import { Item } from "../../util/item";
import { SC } from "../utilities/skribble.js";

/**
 * State assumed to be separated by boolean
 */
export interface RecognizerState {
    sym: Symbol;
    level: number;
    leaf: boolean;
    peeking: boolean;
    items: Item[];
}

export interface NewType {
    /**
     * Code that should be added to parent node`s execution scope
     */
    code: SC;
    /**
     * MD5 hash string of code
     */
    hash: string;
    state: RecognizerState;
}