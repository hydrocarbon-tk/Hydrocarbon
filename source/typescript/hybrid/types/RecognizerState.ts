import { Symbol } from "../../types/Symbol";
import { Item } from "../../util/item";
import { SC } from "../utilities/skribble.js";


export interface RecognizerState {
    /**
     * Code that should be added to parent node`s execution scope
     */
    code: SC;
    /**
     * MD5 hash string of code
     */
    hash: string;

    sym: Symbol;
    peek_level: number;
    offset: number;
    leaf: boolean;
    items: Item[];

    yielder: string;

    /**
     * Current closure at this state. 
     */
    closure?: Item[];

    /**
     * The containing code does not require a boolean check
     */
    CAN_SKIP_BOOL_CHECK?: boolean;

    /**
     * production_ids that can be generated from this sequence
     */
    prods?: number[];
}