/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Symbol } from "./symbol";
import { Item } from "../utilities/item.js";
import { SC } from "../utilities/skribble.js";
import { SKBlock, SKExpression, SKNode } from "../skribble/types/node";

/**
 * Attribute that indicates the type of tree that
 * this node is the root of
 */
export const enum TRANSITION_TYPE {
    /**
     * Indicates the token(s) of this node need to 
     * be consumed before progressing to the next node(s). 
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
     * Indicates that the token(s) at this node only need to be 
     * asserted before progressing to the next node(s)
     * 
     * Friendly name:  `assert`
     */
    ASSERT,


    /**
     * Like ASSERT, except node is generated from a completed item.
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
     * Like ASSERT, except the assertion can be made from through a 
     * production call.
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
    ASSERT_PEEK_VP,

    /**
     * Like ASSERT_PRODUCTION_SYMBOLS, except the assertion should be
     *  made on the peeking lexer instead of the main lexer.
     * 
     * Friendly name:  `peek-production-symbols`
     */
    PEEK_PRODUCTION_SYMBOLS,

    /**
     * This node should be ignored. Used for look-ahead sequences that 
     * should not actual produce code that could manipulate the lexer
     * 
     * Friendly name:  `ignore`
     */
    IGNORE,

    /**
     * This transition is created when multiple items cannot be unambiguously
     * parsed. It leads to a special resolver that can use different 
     * strategies to clear up the ambiguity. If part of a transition branch,
     * the assertion of its symbols can be bypassed if this the last branch
     * case.
     * 
     * Friendly name: `peek-unresolved`
     */
    PEEK_UNRESOLVED
};

/**
 * A parse node that has been transitioned to from either the start 
 * of the production function or from a proceeding node.
 */
export interface TransitionNode {
    /**
     * Code that should be added to the proceeding node's execution scope. May 
     * need to be gated by this node's symbol
     */
    code: SKExpression[];

    /**
     * MD5 hash string of code
     */
    hash: string;

    symbols?: Symbol[];

    /**
     * The depth of the peeking node relative to the initiation of the peek.
     */
    peek_level: number;

    /**
     * The depth of the node relative to the start of the production function.
     */
    offset: number;

    /**
     * Indicates the node will complete a production.
     */
    completing: boolean;

    /**
     * Active items at this node.
     */
    items: Item[];

    transition_type: TRANSITION_TYPE;

    /**
     * Current closure at this Z. 
     */
    closure?: Item[];

    /**
     * production_ids that can be generated from this sequence
     */
    prods?: number[];

    leaves?: Leaf[];

    nodes: TransitionNode[];
    /**
     * Flag to prevent repeat processing of the same node
     */
    PROCESSED: boolean;

    /**
     * Leaf node encountered with sibling leaf nodes. 
     */
    UNRESOLVED_LEAF: boolean;

    PUIDABLE: boolean;
}

/**
 * Collection of processed data returned
 * from transition resolvers
 */
export interface Leaf {
    hash: string;
    root: SKExpression[];
    leaf: SKExpression[];
    prods?: number[];
    original_prods: number[];
    transition_type: TRANSITION_TYPE;

    /**
     * Present if the leaf is part of a GOTO 
     * sequence. 
     */
    keys?: number[];

    /**
     * Indicates this leaf resides in a branch
     * function; it is not directly reachable 
     * from the production RD or GOTO functions
     */
    INDIRECT?: boolean;

    EMPTY?: boolean;
}

export interface GeneratorStateReturn {
    hash: string,
    code: SKExpression[],
    prods: number[];
    leaves: Leaf[];
}