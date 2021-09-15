
import { Token } from '../runtime/token';
import { ENVFunctionRef, LocalFunctionRef, ProductionFunction, ProductionImportSymbol, ProductionSymbol, TokenSymbol } from './grammar_nodes';

export type i32 = number;
type bit = number;
export type u32 = number;
type u16 = number;
type u8 = number;
type u2 = number;
type u3 = number;
type u10 = number;

export interface BaseIRState {
    type: "state" | string;
    id: string | ProductionImportSymbol | ProductionSymbol;
    instructions: IR_Instruction[];
    symbol_meta?: {
        type: "symbols";
        expected: (number | TokenSymbol)[];
        skipped: (number | TokenSymbol)[];
    };
    fail?: FailedIRState | ResolvedFailedIRState;
    pos: Token;
}
export interface FailedIRState extends BaseIRState {
    type: "on-fail-state";
}

export interface ResolvedIRState extends BaseIRState {
    id: string;

    fail?: ResolvedFailedIRState;
}
export interface ResolvedFailedIRState extends ResolvedIRState {
    type: "on-fail-state";
}

export const enum InstructionType {
    prod = "prod",

    increment = "increment",
    empty_consume = "empty-consume",
    consume = "consume",
    inline_assert = "inline-assert",
    peek = "peek",
    assert = "assert",
    goto = "goto",
    reduce = "reduce",
    set_prod = "set-prod",
    fork_to = "fork-to",
    scan_until = "scan-until",
    scan_back_until = "scan-back-until",
    pop = "pop",
    on_fail = "on-fail",
    token_length = "token-length",
    token_id = "token-id",
    pass = "pass",
    fall_through = "fall_through",
    fail = "fail",
    repeat = "repeat-state",
    left_most = "assert-left",
    set_scope = "set-scope",
    not_in_scopes = "not-in-scopes"

}


export interface ResolvedIRBranch {
    type:
    InstructionType.prod |
    InstructionType.assert;
    ids: number[];
    instructions: IR_Instruction[];
}
export interface Base_IR_Instruction {
    type: InstructionType;
    pos: Token;
}
export interface IRTokenBranch {
    ids: (number | TokenSymbol)[];

    instructions: IR_Instruction[];

}
export interface IRAssert extends IRTokenBranch {
    type: InstructionType.assert;
}

export interface IRInlineAssert extends Base_IR_Instruction {
    type: InstructionType.inline_assert;
    id: number,
    token_ids: number[];
    skipped_ids: number[];
}

export interface IRPeek extends IRTokenBranch {
    type: InstructionType.peek;
}
export interface IRProductionBranch extends Base_IR_Instruction {
    type: InstructionType.prod;
    ids: (number | ProductionSymbol | ProductionImportSymbol)[];
    instructions: IR_Instruction[];

}
export interface IRReduce extends Base_IR_Instruction {
    type: InstructionType.reduce;
    len: number;
    reduce_fn: number | ProductionFunction | LocalFunctionRef | ENVFunctionRef;
}
export interface IRSetProd extends Base_IR_Instruction {
    type: InstructionType.set_prod;
    id: (number | ProductionSymbol | ProductionImportSymbol);
}
export interface IRFork extends Base_IR_Instruction {
    type: InstructionType.fork_to;
    states: (string | ProductionSymbol | ProductionImportSymbol)[];
}

export interface IRScanTo extends Base_IR_Instruction {
    type: InstructionType.scan_until;
    ids: (number | TokenSymbol)[];
}

export interface IRNoConsume extends Base_IR_Instruction {
    type: InstructionType.empty_consume;
}


export interface IRConsume extends Base_IR_Instruction {
    type: InstructionType.consume;
    EMPTY: boolean;
}
export interface IRScanBackTo extends Base_IR_Instruction {
    type: InstructionType.scan_back_until;
    ids: (number | TokenSymbol)[];
}

export interface IRPop extends Base_IR_Instruction {
    type: InstructionType.pop;
    len: number;
}

export interface IRSetScope extends Base_IR_Instruction {
    type: InstructionType.set_scope;
    scope: number;
}

export interface IRNotInScopes extends Base_IR_Instruction {
    type: InstructionType.not_in_scopes;
    ids: number[];
}


export interface IRSetTokenID extends Base_IR_Instruction {
    type: InstructionType.token_id;
    id: number | TokenSymbol;
}

export interface IRSetTokenLength extends Base_IR_Instruction {
    type: InstructionType.token_length;
    len: number;
}

export interface IRPass extends Base_IR_Instruction {
    type: InstructionType.pass;
}

export interface IRFail extends Base_IR_Instruction {
    type: InstructionType.fail;
}

export interface IRFallThrough extends Base_IR_Instruction {
    type: InstructionType.fall_through;
}

export interface IREnd extends Base_IR_Instruction {
    type: InstructionType.pass;
}

export interface IRGoto extends Base_IR_Instruction {
    type: InstructionType.goto;
    state: string | ProductionImportSymbol | ProductionSymbol;
}

export interface IRRepeat extends Base_IR_Instruction {
    type: InstructionType.repeat;
}

export type Resolved_IR_State = ResolvedIRState
    | ResolvedFailedIRState;
export type IR_State = BaseIRState | FailedIRState;
export type IR_Instruction = IRConsume |
    IRAssert |
    IRRepeat |
    IRNoConsume |
    IRPeek |
    IRProductionBranch |
    IRFork |
    IRSetProd |
    IRReduce |
    IRScanTo |
    IRScanBackTo |
    IRPop |
    IRSetTokenID |
    IRSetTokenLength |
    IRPass |
    IRFail |
    IRFallThrough |
    IRGoto |
    IREnd |
    IRInlineAssert |
    IRNotInScopes |
    IRSetScope |
    ResolvedIRBranch;

export interface BlockData {
    number_of_elements: number,
    instruction_sequence: any[][];
    total_size: number;
}

export type IRNode =
    IR_State
    | IR_Instruction;
