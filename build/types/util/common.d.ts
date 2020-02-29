export declare const MASK: number;
export declare const EMPTY_PRODUCTION = "{!--EMPTY_PRODUCTION--!}";
export declare const isNonTerm: (f: any) => boolean;
import { Item } from "./item.js";
import { FIRST } from "./first.js";
import { FOLLOW } from "./follow.js";
import { processClosure } from "./process_closure.js";
export { Item, FOLLOW, FIRST, processClosure };
export declare const types: any;
export declare function getToken(l: any, SYM_LU: any, IGNORE_KEYWORDS?: boolean): any;
export declare function getPrecedence(term: any, grammar: any): number;
export declare function createPrecedence(body: any, grammar: any): any;
export declare function filloutGrammar(grammar: any, env: any): void;
export declare const actions: {
    ACCEPT: number;
    SHIFT: number;
    REDUCE: number;
    GOTO: number;
};
