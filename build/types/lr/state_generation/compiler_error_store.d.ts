export declare class CompilerErrorStore {
    strings: Array<string>;
    constructor();
    log(...vals: Array<any>): void;
    get output(): string;
}
