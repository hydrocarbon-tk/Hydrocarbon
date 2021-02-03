import "./utilities/array_globals.js";

//Compiling
import { createGrammar } from "./grammar/compile_grammar.js";
import { compile } from "./compiler/compiler.js";

//Runtime - Hybrid
import { buildParserMemoryBuffer, loadWASM } from "./runtime/parser_memory.js";
import { ParserFactory } from "./runtime/parser_loader.js";

//Runtime - Deprecate
import { LexerError } from "./lr(deprecate)/runtime/lexer_error.js";
import { lrParse } from "./lr(deprecate)/runtime/lr_parser.js";

//Diagnostics
import { ParserEnvironment } from "./types/parser_environment.js";
import { ErrorHandler, ParserData } from "./lr(deprecate)/runtime/parser_data.js";

export {
    ParserFactory,
    loadWASM,
    ErrorHandler,
    ParserData,
    LexerError,
    ParserEnvironment,
    createGrammar as compileGrammars,
    buildParserMemoryBuffer,
    lrParse,
    compile
};
