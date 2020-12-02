import { LRState } from "./State";

export interface RDProductionFunction {
    id: number;
    fn?: string;
    productions?: Set<number>;
    RENDER?: boolean;
    str?: string;
    state?: LRState;
}
