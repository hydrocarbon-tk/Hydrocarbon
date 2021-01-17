export declare interface Array<T> {
    group<T>(this: Array<T>, fn: (T) => string | number): T[][];
}
