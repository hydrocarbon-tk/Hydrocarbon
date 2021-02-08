import { SC } from "./skribble.js";


export function reduceOR<T>(red: T, exp: T, i: number): T {
    if (!red)
        return exp;
    return <T><any>SC.Binary(<any>red, "||", <any>exp);
}
