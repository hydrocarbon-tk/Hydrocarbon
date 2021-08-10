/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { SKFunction } from "../skribble/types/node.js";
export interface RDProductionFunction {

    id: number,

    entry: SKFunction,

    goto: SKFunction,

    reduce: SKFunction,

    productions?: Set<number>;

    RENDER?: boolean;

}
