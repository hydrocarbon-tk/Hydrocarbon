/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */

import "../utilities/array_globals.js";


//Runtime - Hybrid
import { initializeUTFLookupTable } from "../runtime/parser_memory_new.js";
import { loadWASM, buildParserMemoryBuffer } from "../runtime/parser_memory_old.js";
import { ParserFactory } from "../runtime/parser_loader.js";
import { ParserFactory as ParserFactoryNew } from "../runtime/parser_loader_alpha.js";
import { ParserFactory as ParserFactoryNext } from "../runtime/parser_loader_next.js";
import { Token } from "../runtime/token.js";

//Diagnostics
import { ParserEnvironment } from "../types/parser_environment.js";
import { HCGParser } from "../types/parser.js";


export {
    //Types
    HCGParser,
    ParserEnvironment,
    Token,

    //Code
    loadWASM,
    ParserFactory,
    ParserFactoryNew,
    ParserFactoryNext,
    buildParserMemoryBuffer,

    initializeUTFLookupTable,
};

