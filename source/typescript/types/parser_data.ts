import { Lexer } from "@candlefw/whind";
import { ParserEnvironment } from "./parser_environment.js";

export type OutputStack = Array<any>;

type TokenLookupMap = Map<string | number, number>;

export type ErrorHandler = (
    arg0 :number, 
    arg1 :ParserEnvironment, 
    arg2 :OutputStack, 
    arg3 :Lexer, 
    arg4 :Lexer, 
    arg5 :number, 
    arg6 :(arg0 : Lexer)  => number) => number;

export type ActionFunction = (
        arg0 :number, 
        arg1 :ParserEnvironment, 
        arg2 :OutputStack, 
        arg3 :Lexer, 
        arg4 :Lexer,
        arg5 :Array<ActionFunction>, 
        arg6 :any) => number;

export interface ParserData {
    gt: Array<number>;
    sym: Array<string>;
    lu: TokenLookupMap;
    sts: Array<number>;
    sa:Array<ActionFunction>;
    fns: Array<ActionFunction>;
    eh: Array<ErrorHandler>;
    gtk: (arg0: Lexer, arg1: TokenLookupMap, arg2?: boolean) => number;
    ty: any;
    fm: Array<number>;
}
