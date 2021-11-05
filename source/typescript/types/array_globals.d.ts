/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
//@ts-ignore
export declare global {
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
         * Group items into sub-arrays based on an identifier defined by a function or
         * by the string value of the object
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


