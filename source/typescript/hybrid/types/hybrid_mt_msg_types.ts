import { Item } from "../../util/common";
import { RDState } from "./State";
import { ItemSet } from "../../types/item_set";
import { ConstantHash, ConstantObj } from "./CompilerRunner";
import { SC } from "../utilities/skribble";

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
    state?: RDState;
    item_set?: { old_state: number; items: Item[]; };
}

export interface HybridDispatchResponse {
    job_type: HybridJobType;
    items?: Item[];
    production_id?: number;
    state?: RDState;
    productions?: Set<number>;
    potential_states?: RDState[];
    CONVERT_RD_TO_LR?: boolean;
    const_map?: Map<ConstantHash, ConstantObj>;
    fn?: SC;
}