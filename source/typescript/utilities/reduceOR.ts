/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { SC } from "./skribble.js";


export function reduceOR<T>(red: T, exp: T, i: number): T {
    if (!red)
        return exp;
    return <T><any>SC.Binary(<any>red, "||", <any>exp);
}


export function reduceAnd<T>(red: T, exp: T, i: number): T {
    if (!red)
        return exp;
    return <T><any>SC.Binary(<any>red, "&&", <any>exp);
}
