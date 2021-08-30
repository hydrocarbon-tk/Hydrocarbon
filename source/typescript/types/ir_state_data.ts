import { BlockData, State } from './build_types';

export interface StateData {
    string: string;
    ir_state_ast: State;
    pointer: number;
    block_offset: number;
    block: BlockData;
    reference_count: number;
    attributes: StateAttrib;
    expected_tokens?: number[];
    skipped_tokens?: number[];
}

export type StateMap = Map<string, StateData>;
export const enum StateAttrib {
    HAS_GOTOS = 1 << 0,
    PROD_BRANCH = 1 << 1,
    PEEK_BRANCH = 1 << 2,
    ASSERT_BRANCH = 1 << 3,
    CONSUME_BRANCH = 1 << 4,
    MULTI_BRANCH = 1 << 5,
    FAIL_STATE = 1 << 6,
    PRODUCTION_ENTRY = 1 << 7,
    TOKEN_BRANCH = ASSERT_BRANCH | CONSUME_BRANCH | PEEK_BRANCH
}
