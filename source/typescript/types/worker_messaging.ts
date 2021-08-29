/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

export enum HybridJobType {
    UNDEFINED,
    CONSTRUCT_RD_FUNCTION
}

export interface HybridDispatch {
    job_type: HybridJobType;
    production_id?: number;
}

export interface HybridDispatchResponse {
    production_id?: number;
    tables?: Map<string, string>;
}