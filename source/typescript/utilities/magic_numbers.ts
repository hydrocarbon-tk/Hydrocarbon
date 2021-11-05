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
export const LocalState = 0;
export const GlobalState = -1;
export const default_case_indicator = 9999;