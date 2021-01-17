import { SC } from "../util/skribble";
export interface RDProductionFunction {
    fn?: SC;
    productions?: Set<number>;
    RENDER?: boolean;
}
