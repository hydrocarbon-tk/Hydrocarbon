/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

/**
 * A "magic" number assigned to a reduce node's length
 * value to indicate that it is to use the symbol accumulator
 * to determine how many symbols are to removed from the
 * parse stack when the reduce function is called.
 */
export const ir_reduce_numeric_len_id = 0x90FA0102;
export const end_item_addendum = 1 << 20;
export const OutOfScopeItemState = -9999;
export const InScopeItemState = 9999;
export const LocalState = 0;
export const GlobalState = -1;
export const default_case_indicator = 9009;

/**
 * 
 */
export const skipped_scan_prod = 9009;

export const state_index_mask = (1 << 24) - 1;
export const fail_state_mask = 1 << 27;
export const normal_state_mask = 1 << 26;
export const goto_state_mask = 1 << 25;
export const alpha_increment_stack_pointer_mask = 1 << 0;
export const alpha_have_default_action_mask = 1 << 1;
export const production_scope_pop_pointer = 2;
export const instruction_pointer_mask = 0xFFFFFF;
