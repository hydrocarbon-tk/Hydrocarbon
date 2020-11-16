import { Item } from "../../util/common";
import { LRState } from "./State";
import { ItemSet } from "../../types/item_set";

export enum HybridJobType {
    UNDEFINED,
    CONSTRUCT_LR_STATE,
    CONSTRUCT_RD_FUNCTION,
    CONSTRUCT_RD_TO_LR_FUNCTION,
    CONSTRUCT_LR_STATE_FUNCTION
}

export interface HybridDispatch {
    job_type: HybridJobType;
    items?: ItemSet;
    production_id?: number;
    state?: LRState;
    item_set?: { old_state: number; items: Item[]; };
}

export interface HybridDispatchResponse {
    job_type: HybridJobType;
    items?: Item[];
    production_id?: number;
    state?: LRState;
    productions?: Set<number>;
    potential_states?: LRState[];
    CONVERT_RD_TO_LR?: boolean;
    const_map?: Map<string, { name: string, type: string; }>;
    fn?: string;
}