import { SC } from "../util/skribble.js";
export interface RDProductionFunction {

    id: number,
    fn?: SC;
    productions?: Set<number>;
    RENDER?: boolean;

}
