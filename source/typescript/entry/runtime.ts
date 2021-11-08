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

export { ParserFramework } from '../runtime/parser_framework.js';
//Runtime - Hybrid
import { initializeUTFLookupTable, initializeUTFLookupTableNewPlus } from "../runtime/parser_memory_new.js";
import { Token } from "../runtime/token.js";
import { fillByteBufferWithUTF8FromString } from "../runtime/common/utf8.js";
import { HCGParser } from "../types/parser.js";
//Diagnostics
import { ParserEnvironment } from "../types/parser_environment.js";

import { ParserPack } from '../types/parser_framework_types.js';
export * as KernelParserCore from "../runtime/kernel.js";
export * as KernelParserCore2 from "../runtime/kernel_new.js";

export * as ParserCore from "../runtime/core_parser.js";

import { ParserFramework as ParserFrameworkNew } from '../runtime/parser_framework_new.js';
export { assign_peek } from '../runtime/recognizer/iterator.js';

export { complete } from '../runtime/completer/complete.js';

export { ASTNode, HCObjIterator, iterate } from "../runtime/ast_node.js";
export {
    //Types
    HCGParser,

    ParserEnvironment,
    Token,
    ParserPack,

    //Code
    fillByteBufferWithUTF8FromString,
    ParserFrameworkNew,
    initializeUTFLookupTableNewPlus,
    initializeUTFLookupTable,
};


