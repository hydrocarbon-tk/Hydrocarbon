import { BlockData, BranchIRState, IR_State, Resolved_IR_State } from './ir_types';

export interface IRStateData {
    string: string;
    ir_state_ast: Resolved_IR_State;
    pointer: number;
    block_offset: number;
    block: BlockData;
    reference_count: number;
    attributes: StateAttrib;
    expected_tokens?: number[];
    skipped_tokens?: number[];
}

export interface BranchIRStateData extends IRStateData {

    ir_state_ast: BranchIRState;
}

export type StateMap = Map<string, IRStateData>;
export const enum StateAttrib {
    HAS_GOTOS = 1 << 0,
    PROD_BRANCH = 1 << 1,
    PEEK_BRANCH = 1 << 2,
    ASSERT_BRANCH = 1 << 3,
    MULTI_BRANCH = 1 << 4,
    FAIL_STATE = 1 << 5,
    PRODUCTION_ENTRY = 1 << 6,
    TOKEN_BRANCH = ASSERT_BRANCH | PEEK_BRANCH
}
