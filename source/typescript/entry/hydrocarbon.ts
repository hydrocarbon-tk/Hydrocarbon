/**
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * Contact: acweathersby.codes@gmail.com
 */

import "../utilities/array_globals.js";


//Runtime - Hybrid
import { initializeUTFLookupTable } from "../runtime/parser_memory_new.js";
import { loadWASM, buildParserMemoryBuffer } from "../runtime/parser_memory_old.js";
//import { loadWASM } from "../runtime/wasm_loader.js";
import { ParserFactory } from "../runtime/parser_loader.js";
import { ParserFactory as ParserFactoryNew } from "../runtime/parser_loader_alpha.js";
import { ParserFactory as ParserFactoryNext } from "../runtime/parser_loader_next.js";

//Runtime - Deprecate
import { LexerError } from "../lr(deprecate)/runtime/lexer_error.js";
import { lrParse } from "../lr(deprecate)/runtime/lr_parser.js";

//Diagnostics
import { ParserEnvironment } from "../types/parser_environment.js";
import { ErrorHandler, ParserData } from "../lr(deprecate)/runtime/parser_data.js";
import { compileGrammarFromString, compileGrammarFromURI } from "../grammar/compile.js";

export {
    loadWASM,
    buildParserMemoryBuffer,
    ParserFactory,
    ParserFactoryNew,
    ParserFactoryNext,
    //loadWASM,
    ErrorHandler,
    ParserData,
    LexerError,
    ParserEnvironment,
    initializeUTFLookupTable,
    lrParse,
    compileGrammarFromString,
    compileGrammarFromURI
};

