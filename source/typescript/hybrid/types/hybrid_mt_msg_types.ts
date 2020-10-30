import { Item } from "../../util/common";
import { State } from "./State";
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
    state?: State;
    item_set?: { old_state: number; items: Item[]; };
}

export interface HybridDispatchResponse {
    job_type: HybridJobType;
    items?: Item[];
    production_id?: number;
    state?: State;
    productions?: Set<number>;
    potential_states?: State[];
    CONVERT_RD_TO_LR?: boolean;
    const_map?: Map<string, { name: string, type: string; }>;
    fn?: string;
}