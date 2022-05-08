import { BlockData, BranchIRState, Resolved_IR_State } from './ir_types.js';

export interface InternalStateData {

    string: string;
    ir_state_ast: Resolved_IR_State;
    pointer: number;
    block_offset: number;
    block: BlockData | null;
    reference_count: number;
    attributes: StateAttrib;
    expected_tokens?: number[];
    skipped_tokens?: number[];
}

export interface ExportableStateData {
    name: string;
    string: string;
    block_offset: number;
    pointer: number;
    active_tokens: number[];
    skipped_tokens: number[];
}

export interface ExportableStates {
    bytecode_path: string;
    grammar_resource_path: string;
    states: {
        [key: string]: ExportableStateData;
    };
}

export interface BranchIRStateData extends InternalStateData {

    ir_state_ast: BranchIRState;
}
export type ReverseStateLookupMap = Map<number, ExportableStateData>;
export type StateMap = Map<string, InternalStateData>;
export enum StateAttrib {
    HAS_GOTOS = 1 << 0,
    PROD_BRANCH = 1 << 1,
    PEEK_BRANCH = 1 << 2,
    ASSERT_BRANCH = 1 << 3,
    MULTI_BRANCH = 1 << 4,
    FAIL_STATE = 1 << 5,
    PRODUCTION_ENTRY = 1 << 6,
    REQUIRED_GOTO = 1 << 7,
    SCANNER = 1 << 8,
    TOKEN_BRANCH = ASSERT_BRANCH | PEEK_BRANCH
}

