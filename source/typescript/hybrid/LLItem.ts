import { Item } from "../util/common.js";
/**
 * Used to keep track of original item origin
 * while progressing through it's sub productions
 */
export interface LLItem {
    body_index: number;

    off: number;

    len: number;

    item: Item;

    closure: Item[];
}
