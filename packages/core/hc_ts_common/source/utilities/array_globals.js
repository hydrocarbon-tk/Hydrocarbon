/*
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty
 * disclaimer notice.
 */
import "../types/array_globals";
Array.prototype.groupMap = function (fn) {
    const groups = new Map;
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
Array.prototype.setFilter = function (fn = _ => _ ? _.toString() : "") {
    const set = new Set;
    return this.filter(i => {
        const id = fn(i);
        if (set.has(id))
            return false;
        set.add(id);
        return true;
    });
};
Array.prototype.group = function (fn = _ => _ ? _.toString() : "") {
    return [...this.groupMap(fn).values()];
};
export const numeric_sort = (a, b) => a - b;
