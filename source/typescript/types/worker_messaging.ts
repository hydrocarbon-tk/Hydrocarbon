/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

import { GrammarObject } from './grammar_nodes';

export const enum HybridJobType {
    UNDEFINED,
    CONSTRUCT_RD_FUNCTION,
    INITIALIZE
}

export type HybridDispatch = {
    job_type: HybridJobType.CONSTRUCT_RD_FUNCTION;
    production_id?: number;
} | {
    job_type: HybridJobType.INITIALIZE;
    grammar: GrammarObject;
    id: number;
} | {
    job_type: HybridJobType.UNDEFINED;
    production_id?: -1;
};

export interface HybridDispatchResponse {
    production_id?: number;
    states?: Map<string, string>;
}