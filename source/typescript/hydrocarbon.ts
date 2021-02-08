/**
 * Copyright 2021
 * 
 * MIT License
 * 
 * Copyright (c) 2021 Anthony C. Weathersby
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */

import "./utilities/array_globals.js";

//Compiling
import { createGrammar } from "./grammar/compile_grammar.js";
import { compile } from "./compiler/compiler.js";

//Runtime - Hybrid
import { initializeUTFLookupTable } from "./runtime/parser_memory_new.js";
import { loadWASM, buildParserMemoryBuffer } from "./runtime/parser_memory_old.js";
//import { loadWASM } from "./runtime/wasm_loader.js";
import { ParserFactory } from "./runtime/parser_loader.js";

//Runtime - Deprecate
import { LexerError } from "./lr(deprecate)/runtime/lexer_error.js";
import { lrParse } from "./lr(deprecate)/runtime/lr_parser.js";

//Diagnostics
import { ParserEnvironment } from "./types/parser_environment.js";
import { ErrorHandler, ParserData } from "./lr(deprecate)/runtime/parser_data.js";

export {
    loadWASM,
    buildParserMemoryBuffer,
    ParserFactory,
    //loadWASM,
    ErrorHandler,
    ParserData,
    LexerError,
    ParserEnvironment,
    createGrammar as compileGrammars,
    initializeUTFLookupTable,
    lrParse,
    compile
};
