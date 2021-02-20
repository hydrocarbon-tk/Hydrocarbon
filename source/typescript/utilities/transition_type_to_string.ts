/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { TRANSITION_TYPE } from "../types/transition_node.js";

/** Translate Transition Type */
export function ttt(type: TRANSITION_TYPE): string {
    switch (type) {
        case TRANSITION_TYPE.ASSERT: return "assert";
        case TRANSITION_TYPE.ASSERT_PEEK: return "assert-peek";
        case TRANSITION_TYPE.ASSERT_PEEK_VP: return "assert-peek-vp";
        case TRANSITION_TYPE.ASSERT_CONSUME: return "assert-consume";
        case TRANSITION_TYPE.POST_PEEK_CONSUME: return "post-peek-consume";
        case TRANSITION_TYPE.ASSERT_END: return "assert-end";
        case TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS: return "assert-production-symbols";
        case TRANSITION_TYPE.PEEK_UNRESOLVED: return "peek-unresolved";
        case TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS: return "peek-production-symbols";
        case TRANSITION_TYPE.ASSERT_PRODUCTION_CALL: return "assert-production-call";
        case TRANSITION_TYPE.IGNORE: return "ignore";
        default: return "unknown";
    }
}
