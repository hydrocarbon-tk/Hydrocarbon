/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { GlobalName, ConstantObj } from "../build/helper";
import { SC } from "../utilities/skribble.js";

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
    productions?: Set<number>;
    const_map?: Map<GlobalName, ConstantObj>;
    fn?: SC;
}