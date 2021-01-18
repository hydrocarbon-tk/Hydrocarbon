import { SC } from "../util/skribble";
export interface RDProductionFunction {

    id: number,
    fn?: SC;
    productions?: Set<number>;
    RENDER?: boolean;
}
