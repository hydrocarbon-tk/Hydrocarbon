import { Item } from "../util/common.js";



export interface State {
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
     * The state only has items produced from the
     * same production body.
     */
    PURE: boolean;

    /**
     * The state represents a transition
     * from a non-terminal symbol, i.e: GOTO
     */
    TERMINAL_TRANSITION: boolean;

    /**
     * The state contains at least one item
     * that at the REDUCE point.
     */
    HAS_COMPLETED_PRODUCTION: boolean;

    /**
     * Contains only completed bodies.
     */
    CONTAINS_ONLY_COMPLETE: boolean;

    /**
     * Tracks item full ids to determine if
     * the merging state has been encountered
     * at a previous point.
     */
    state_merge_tracking: Set<string>;

    /**
     * The states numerical id for tracking linkages.
     */
    index: number;

    /**
     * An map of symbols/productions and the expected transition
     * state(s) that should follow the symbol/production.
     */
    maps: Map<string, number[]>;

    /**
     * Number of proceeding states that will transition to
     * this state.
     */
    refs: number;

    /**
     * All topmost productions that this state will produce
     */
    yields: Set<number>;
}
