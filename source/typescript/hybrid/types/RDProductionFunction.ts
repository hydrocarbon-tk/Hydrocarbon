import { SC } from "../utilities/skribble";
import { RDState } from "./State";

export interface RDProductionFunction {
    id: number;
    fn?: SC;
    productions?: Set<number>;
    RENDER?: boolean;
    str?: string;
    state?: RDState;
}
