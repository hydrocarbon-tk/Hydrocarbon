Array.prototype.groupMap = function <T, KeyType>(
    this: Array<T>,
    fn: (T, G: T[]) => (KeyType | KeyType[])
): Map<KeyType, T[]> {

    const groups: Map<KeyType, T[]> = new Map;

    this.forEach(e => {

        const id = fn(e, this);

        for (const ident of Array.isArray(id) ? id : [id]) {
            if (!groups.has(ident))
                groups.set(ident, []);
            groups.get(ident).push(e);
        }
    });

    return groups;
};
Array.prototype.setFilter = function <T>(
    this: Array<T>,
    fn: (T) => (string | number) = _ => _ ? _ : ""
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

Array.prototype.group = function <T, KeyType>(this: Array<T>, fn: (T, G: T[]) => (KeyType | KeyType[]) = _ => _ ? _.toString() : ""): T[][] {
    return [...this.groupMap(fn).values()];
};
