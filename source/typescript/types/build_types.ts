export interface State {
    type: "state" | "on-fail-state";
    id: string;
    instructions: Instruction[];
    symbol_meta?: {
        type: "symbols";
        expected: number[];
        skipped: number[];
    };
    fail?: {
        type: "on-fail-state";
        id: string;
        instructions: Instruction[];
        symbol_meta?: {
            type: "symbols";
            expected: number[];
            skipped: number[];
        };
    };
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
    pop = "pop",
    on_fail = "on-fail",
    token_length = "token-length",
    pass = "pass",
    fail = "fail",
    repeat = "repeat-state"
}
export interface Instruction {
    type: InstructionType;
    ids?: number[];
    state?: string;
    states?: string[];
    id?: number;
    instructions?: Instruction[];
    token_ids: number[];
    len?: number;
    reduce_fn?: number;
}
export type i32 = number;
type bit = number;
export type u32 = number;
type u16 = number;
type u8 = number;
type u2 = number;
type u3 = number;
type u10 = number;
interface StateTableEntryHeader {

    //32bytes
    number_of_rows: u16;
    increment_stack_pointer_for_failure: bit;
    have_default_action: bit;
    undefined2: u2;
    undefined3: u2;
    undefined1: u2;
    state_type: u2;
    undefined4: u2;
    undefined5: u2;
    undefined6: u2;


    //32 Bytes
    failure_state_data: u32;

    //32Bytes
    skip_table_row: u16;
    token_table_row: u16;

    //32 Bytes
    row_size: u16;
    prod_or_tok_basis: u16;
}
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
interface StateTableEntryHeader {

    //32bytes
    number_of_rows: u16;
    increment_stack_pointer_for_failure: bit;
    have_default_action: bit;
    undefined2: u2;
    undefined3: u2;
    undefined1: u2;
    state_type: u2;
    undefined4: u2;
    undefined5: u2;
    undefined6: u2;


    //32 Bytes
    failure_state_data: u32;

    //32Bytes
    skip_table_row: u16;
    token_table_row: u16;

    //32 Bytes
    row_size: u16;
    prod_or_tok_basis: u16;
}
