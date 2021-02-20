/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { SC } from "../utilities/skribble.js";
export interface RDProductionFunction {

    id: number,
    fn?: SC;
    productions?: Set<number>;
    RENDER?: boolean;

}
