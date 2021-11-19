/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import "../types/array_globals.js";

Array.prototype.groupMap = function <T, KeyType>(
    this: Array<T>,
    fn: (arg: T, G: T[]) => (KeyType | KeyType[])
): Map<KeyType, T[]> {

    const groups: Map<KeyType, T[]> = new Map;

    this.forEach(e => {

        const id = fn(e, this);

        for (const ident of Array.isArray(id) ? id : [id]) {

            if (!groups.has(ident))
                groups.set(ident, []);

            //@ts-ignore
            groups.get(ident).push(e);
        }
    });

    return groups;
};
Array.prototype.setFilter = function <T>(
    this: Array<T>,
    fn: (arg: T) => (string | number) = _ => _ ? (<any>_).toString() : ""
): T[] {

    const set = new Set;

    return this.filter(i => {
        const id = fn(i);

        if (set.has(id))
            return false;
        set.add(id);
        return true;
    });
};

Array.prototype.group = function <T, KeyType>(this: Array<T>, fn: (arg: T, G: T[]) => (KeyType | KeyType[]) = _ => _ ? (<any>_).toString() : ""): T[][] {
    return [...this.groupMap(fn).values()];
};

export const numeric_sort = (a: number, b: number): number => a - b;