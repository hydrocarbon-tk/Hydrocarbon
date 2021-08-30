import { HCG3ImportProduction, HCG3Symbol, ProductionTokenSymbol, TokenSymbol } from '@candlelib/hydrocarbon/build/types/types/grammar_nodes';
import { Token } from '../runtime/token';

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
    id: string;
    instructions: IR_Instruction[];
    symbol_meta?: {
        type: "symbols";
        expected: (number | TokenSymbol)[];
        skipped: (number | TokenSymbol)[];
    };
    fail?: FailedIRState;
    pos: Token;
}

export interface FailedIRState extends BaseIRState {
    type: "on-fail-state";
}

export const enum InstructionType {
    prod = "prod",
    no_consume = "no-consume",
    consume = "consume",
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
    fail = "fail",
    repeat = "repeat-state"
}
export interface Base_IR_Instruction {
    type: InstructionType;
    pos: Token;
}
export interface IRTokenBranch {
    ids: (number | TokenSymbol)[];

}
export interface IRConsume extends IRTokenBranch {
    type: InstructionType.consume;
}
export interface IRAssert extends IRTokenBranch {
    type: InstructionType.no_consume;
}
export interface IRNoConsume extends IRTokenBranch {
    type: InstructionType.peek;
}
export interface IRPeek extends IRTokenBranch {
    type: InstructionType.assert;
}
export interface IRProductionBranch extends Base_IR_Instruction {
    type: InstructionType.prod;
    ids: (number | ProductionTokenSymbol | HCG3ImportProduction)[];

}
export interface IRReduce extends Base_IR_Instruction {
    type: InstructionType.reduce;
    len: number;
    reduce_fn: number;
}
export interface IRSetProd extends Base_IR_Instruction {
    type: InstructionType.set_prod;
    id: (number | ProductionTokenSymbol | HCG3ImportProduction);
}
export interface IRFork extends Base_IR_Instruction {
    type: InstructionType.fork_to;
    states: (number | ProductionTokenSymbol | HCG3ImportProduction)[];
}

export interface IRScanTo extends Base_IR_Instruction {
    type: InstructionType.scan_until;
    token_ids: (number | TokenSymbol)[];
}

export interface IRScanBackTo extends Base_IR_Instruction {
    type: InstructionType.scan_back_until;
    token_ids: (number | TokenSymbol)[];
}

export interface IRPop extends Base_IR_Instruction {
    type: InstructionType.pop;
    len: number;
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

export interface IREnd extends Base_IR_Instruction {
    type: InstructionType.pass;
}
export type IR_State = BaseIRState | FailedIRState;
export type IR_Instruction = IRConsume |
    IRAssert |
    IRNoConsume |
    IRPeek |
    IRProductionBranch |
    IRFork |
    IRScanTo |
    IRScanBackTo |
    IRPop |
    IRSetTokenID |
    IRSetTokenLength |
    IRPass |
    IRFail |
    IREnd;

export interface BlockData {
    table_header: {
        increment_stack_pointer_for_failure: boolean;
        consume_peek: boolean;
        use_peek_for_assert_or_consume: boolean;
        number_of_instruction_rows_or_scanfield_length: number;
        have_default_action: boolean;
        input_type: "production" | "token";
        skip_table_row: number;
        token_table_row: number;
        row_size_or_instruction_field_size: number;
        token_basis: number;
        failure_state_data: string;
        state_type: "basic" | "table" | "scanner";
        lexer_type: "peek" | "assert";
    };
    scanner_key_index_pairs?: number[][];
    table_entries: string[][];
    default_entry: string[];
    total_size: number;
}