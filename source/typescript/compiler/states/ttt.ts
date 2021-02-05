import { TRANSITION_TYPE } from "../../types/recognizer_state.js";

/** Translate Transition Type */
export function ttt(type: TRANSITION_TYPE): string {
    switch (type) {
        case TRANSITION_TYPE.ASSERT: return "assert";
        case TRANSITION_TYPE.IGNORE: return "ignore";
        case TRANSITION_TYPE.CONSUME: return "consume";
        case TRANSITION_TYPE.PEEK: return "peek";
        case TRANSITION_TYPE.ASSERT_END: return "assert-end";
        case TRANSITION_TYPE.ASSERT_PRODUCTION_SYMBOLS: return "assert-production-closure";
        case TRANSITION_TYPE.PEEK_PRODUCTION_SYMBOLS: return "peek-production-closure";
        default: return "unknown";
    }
}
