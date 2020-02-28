import { Lexer } from "@candlefw/whind";
import { Symbol, ProductionBodyFunction, ProductionBodyReduceFunction, ProductionBody } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment.d.js";
export default class implements ProductionBody {
    name: string;
    val: number;
    sym: Array<Symbol>;
    lex: Lexer;
    sym_map: Array<number>;
    length: number;
    functions: Array<ProductionBodyFunction>;
    reduce_function: ProductionBodyReduceFunction;
    grammar_stamp: string;
    form: number;
    excludes: Map<number, Symbol>;
    ignore: Map<number, Symbol>;
    error: Map<number, Symbol>;
    reset: Map<number, Symbol>;
    reduce: Map<number, Symbol>;
    BUILT: boolean;
    uid: string;
    precedence: number;
    constructor(sym: any, env: GrammarParserEnvironment, lex: Lexer, form?: number);
    build(): void;
}
