declare global {
    interface Array<T> {
        /**
        * Map groups of items based on a common identifier. Returns a new map object of these groups with
        * the key being the identifier and the value being an array of matching objects.
        */
        groupMap: <KeyType>(this: Array<T>,
            /**
             * A function that returns a string or number, or an array of strings and/or numbers,
             * that is used to determine which group(s) the object belongs to. Defaults to a function
             * that returns the string value of the object.
             */
            fn: (item: T, array: T[]) => (KeyType | KeyType[])) => Map<KeyType, T[]>;

        /**
         * Reduces items that share the same identifier to the first matching item.
         */
        setFilter: (this: Array<T>,
            /**
             * A function that returns a string or number that is used to
             * determine which set the object belongs to. Defaults to a function
             * that returns the string value of the object.
             */
            fn?: (item: T) => (string | number)
        ) => T[];

        /**
         * Group items into sub-arrays based on an identifier.
         */
        group: <KeyType>(this: Array<T>,
            /**
             * A function that should return a string or number, or an array of strings and/or numbers,
             * that is used to determine which group(s) the object belongs to. Defaults to a function
             * that returns the string value of the object.
             */
            fn?: (item: T, array: T[]) => (KeyType | KeyType[])
        ) => T[][];
    }
}

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
    fn: (T) => (string | number) = _ => _ ? _.toString() : ""
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
