import { Item } from "../util/common";
import { State } from "./State";
import { ItemSet } from "../types/item_set";
import { JSNode } from "@candlefw/js";

export const enum HybridJobType {
    UNDEFINED,
    CONSTRUCT_LR_STATE,
    CONSTRUCT_RC_FUNCTION,
    CONSTRUCT_RCLR_FUNCTION,
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
    potential_states?: State[];
    CONVERT_RC_TO_LR?: boolean;
    fn?: JSNode;
}