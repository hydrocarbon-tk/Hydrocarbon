import { ProductionBody } from "source/typescript/types/grammar.js";
import { ParserAction } from "source/typescript/types/LRState.js";
import { ParserEnvironment } from "source/typescript/types/parser_environment.js";
export declare function setNode(funct: any, length: any, functions: any, return_val: any, COMPILE_FUNCTION?: boolean): {
    str: string;
};
export declare function convertSymbols(s: any, SYM_LU: any, types: any): any;
export declare function processStateTransition(s: [number, ParserAction], env: ParserEnvironment, bodies: ProductionBody[], state_map: any[], state_functions_map: Map<any, any>, state_str_functions: any[], COMPILE_FUNCTION: boolean, fork_map: number[], SYM_LU: any, types: undefined): number;
