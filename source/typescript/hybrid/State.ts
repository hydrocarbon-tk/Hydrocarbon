import { Item } from "../util/common.js";



export interface State {

    /**
     * Optional name to reference the state function
     */
    name?: string;
    sym: string;

    /**
     * Unique identifier that is comprised of
     * the non-unique item signatures (no FOLLOW sym)
     * that have transitioned to this state.
     */
    id: string;

    sid: string;

    /**
     * A unique array of items with FOLLOW
     */
    items: Item[];

    /**
     * The states numerical id for tracking linkages.
     */
    index: number;

    /**
     * True if another state references this state and 
     * a path can be made from any of the root states 
     * to this state
     */
    REACHABLE: boolean;

    /**
     * Tracks item full ids to determine if
     * the merging state has been encountered
     * at a previous point.
     */
    state_merge_tracking?: Set<string>;

    /**
     * A map of symbols/productions and the expected transition
     * state(s) that should follow the symbol/production.
     */
    maps?: Map<number | string, number[]>;


    /**
     * A set of state indices that are called from this state.
     */
    reachable?: Set<number>;
}
