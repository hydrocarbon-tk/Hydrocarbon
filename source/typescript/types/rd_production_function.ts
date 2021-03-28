/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { SKNode } from "../skribble/types/node.js";
export interface RDProductionFunction {

    id: number,
    fn?: SKNode[];
    productions?: Set<number>;
    RENDER?: boolean;

}
