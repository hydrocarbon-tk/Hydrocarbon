import { LRState } from "./State";

export interface RDProductionFunction {
    id: number;
    fn?: string;
    IS_RD: boolean;
    productions?: Set<number>;
    RENDER?: boolean;
    str?: string;
    state?: LRState;
}
