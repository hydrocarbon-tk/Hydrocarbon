import { ConstantHash, ConstantObj } from "../compiler/helper";
import { SC } from "../util/skribble";

export enum HybridJobType {
    UNDEFINE,
    CONSTRUCT_RD_FUNCTION
}

export interface HybridDispatch {
    job_type: HybridJobType;
    production_id?: number;
}

export interface HybridDispatchResponse {
    production_id?: number;
    productions?: Set<number>;
    const_map?: Map<ConstantHash, ConstantObj>;
    fn?: SC;
}