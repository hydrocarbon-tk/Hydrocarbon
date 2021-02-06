import { Symbol } from "./symbol";
import { Item } from "../utilities/item.js";
import { SC } from "../utilities/skribble.js";

/**
 * Attribute that indicates the type of tree that
 * this node is the root of
 */
export const enum TRANSITION_TYPE {
    /**
     * Indicates the token(s) of this state need to 
     * be consumed before progressing to the next state(s). 
     * 
     * Friendly name:  `assert-consume`
     */
    ASSERT_CONSUME,
    /**
     * A consume that immediately follows a peek. This consume
     * can proceed without an assertion
     * 
     * Friendly name:  `post-peek-consume`
     */
    POST_PEEK_CONSUME,

    /**
     * Indicates that the token(s) at this state only need to be 
     * asserted before progressing to the next state(s)
     * 
     * Friendly name:  `assert`
     */
    ASSERT,


    /**
     * Like ASSERT, except state is generated from a completed item.
     * 
     * Friendly name:  `assert-end`
     */
    ASSERT_END,

    /**
     * Assert a call to a production function
     * 
     * Friendly name:  `assert-production-call`
     */
    ASSERT_PRODUCTION_CALL,

    /**
     * Like ASSERT, except state will call a production function.
     * 
     * Assertion of symbols may be skipped, as they will be reasserted
     * within the production call,
     * 
     * Friendly name:  `assert-production-symbols`
     */
    ASSERT_PRODUCTION_SYMBOLS,

    /**
     * Like ASSERT except the assertion should be made on the peeking 
     * lexer instead of the main lexer.
     * 
     * Friendly name:  `assert-peek`
     */
    ASSERT_PEEK,

    /**
     * Like ASSERT_PRODUCTION_SYMBOLS, except the assertion should be
     *  made on the peeking lexer instead of the main lexer.
     * 
     * Friendly name:  `peek-production-symbols`
     */
    PEEK_PRODUCTION_SYMBOLS,

    /**
     * This state should be ignored. Used for look-ahead sequences that 
     * should not actual produce code that could manipulate the lexer
     * 
     * Friendly name:  `ignore`
     */
    IGNORE
};

/**
 * A parse state that has been transitioned to from either the start 
 * of the production function or from a proceeding state.
 */
export interface TransitionNode {
    /**
     * Code that should be added to the proceeding state's execution scope. May 
     * need to be gated by this state's symbol
     */
    code: SC;

    /**
     * MD5 hash string of code
     */
    hash: string;

    symbols?: Symbol[];

    /**
     * The depth of the peeking state relative to the initiation of the peek.
     */
    peek_level: number;

    /**
     * The depth of the state relative to the start of the production function.
     */
    offset: number;

    /**
     * Indicates the state is a will complete a production.
     */
    completing: boolean;

    /**
     * Active items at this state.
     */
    items: Item[];

    transition_type: TRANSITION_TYPE;

    /**
     * Current closure at this state. 
     */
    closure?: Item[];

    /**
     * production_ids that can be generated from this sequence
     */
    prods?: number[];

    leaves?: Leaf[];

    states: TransitionNode[];
    /**
     * Flag to prevent repeat processing of the same state
     */
    PROCESSED: boolean;

    /**
     * Leaf state encountered with sibling leaf states. 
     */
    UNRESOLVED_LEAF: boolean;
}

export interface Leaf {
    hash: string;
    root: SC;
    leaf: SC;
    prods?: number[];
    transition_type: TRANSITION_TYPE;
    /**
     * Present if the leaf is part of a GOTO 
     * sequence. 
     */
    keys?: number[];
}

export interface GeneratorStateReturn {
    hash: string,
    code: SC,
    prods: number[];
    leaves: Leaf[];
}