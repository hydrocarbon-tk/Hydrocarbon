/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import URI from "@candlelib/uri";
import { Helper } from "../build/helper.js";
import { getEnumTypeName } from "../grammar/passes/process_cpp_code.js";
import { jump8bit_table_byte_size } from "../runtime/parser_memory_new.js";
import { sk, skRenderAsCPP, skRenderAsCPPDeclarations, skRenderAsCPPDefinitions, skRenderAsJavaScript, skRenderAsTypeScript } from "../skribble/skribble.js";
import { SKNode } from "../skribble/types/node.js";
import { HCG3Grammar } from "../types/grammar_nodes.js";
import { ParserGenerator } from "../types/ParserGenerator.js";
import { RDProductionFunction } from "../types/rd_production_function.js";
import { getProductionFunctionNameSk } from "../utilities/code_generating.js";
import { renderSkribbleRecognizer } from "./skribble_recognizer_template.js";

export function buildCPPRecognizerSource(
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper
): string {
    const recognizer_code = compileRecognizerSource(meta, grammar, recognizer_functions);

    let recognizer_source = skRenderAsCPP(recognizer_code);

    //Adding forward declaration to get things to cooperate
    const { fn: const_functions_a } = meta.render_constants();

    return `
/*Begin Forward Declarations*/\n
class Lexer;
class ParserData;
class ParserDataBuffer;
${const_functions_a.map(fn => {
        const name = skRenderAsCPP(fn.name);
        const type = skRenderAsCPP(fn.return_type);
        const args = fn.parameters.map(p => skRenderAsCPP(p.primitive_type));
        return `${type} ${name}(${args});`;
    }).join("\n")}

${recognizer_functions.map(fn => {
        const name = getProductionFunctionNameSk(grammar.productions[fn.id]);
        const declarations = [`int ${name}(Lexer&, ParserData&, ParserDataBuffer&, unsigned int, unsigned int, unsigned int);`];
        if (fn.goto)
            declarations.push(`int ${name}_goto(Lexer&, ParserData&, ParserDataBuffer&, unsigned int, unsigned int, unsigned int);`);
        if (fn.reduce)
            declarations.push(`int ${name}_reduce(Lexer&, ParserData&, ParserDataBuffer&, unsigned int, unsigned int, unsigned int);`);
        return declarations.join("\n");
    }).join("\n")}
${""}
/*End Forward Declarations*/

${recognizer_source}`;
}


export async function generateCPPLibraryFiles(output_location: string = "") {

    const

        fs = (await import("fs")).default,

        fsp = fs.promises,

        package_dir = URI.resolveRelative(output_location, "./"),

        header_dir = URI.resolveRelative("./include/", package_dir),

        source_dir = URI.resolveRelative("./source/", package_dir),

        core_parser_header_file = URI.resolveRelative("./core_parser.h", header_dir),

        core_parser_source_file = URI.resolveRelative("./core_parser.cpp", source_dir);

    await fsp.mkdir(header_dir + "", { recursive: true });
    await fsp.mkdir(source_dir + "", { recursive: true });

    //Core Files
    //*
    const recognizer_code = renderSkribbleRecognizer();

    await fsp.writeFile(core_parser_header_file + '',
        `#pragma once
#include "char_lu_table.h"
#include "ast_ref.h"
#include "type_defs.h"
namespace HYDROCARBON 
{ ${skRenderAsCPPDeclarations(recognizer_code)} \n }`
    );
    let core_def = skRenderAsCPPDefinitions(recognizer_code);
    await fsp.writeFile(core_parser_source_file + '',
        `#include "../include/core_parser.h" \n namespace HYDROCARBON { \n ${core_def} \n }`
    );
}

export async function generateCPPParser(
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    output_location: string = "",
    ___: string = ""
): Promise<string> {

    const
        fs = (await import("fs")).default,

        fsp = fs.promises,


        package_dir = URI.resolveRelative(output_location, "./"),

        header_dir = URI.resolveRelative("./include/", package_dir),

        entry_header_file = URI.resolveRelative("./parser.h", header_dir),

        source_dir = URI.resolveRelative("./source/", package_dir),

        spec_parser_header_file = URI.resolveRelative("./spec_parser.h", header_dir),

        spec_parser_source_file = URI.resolveRelative("./spec_parser.cpp", source_dir);

    await fsp.mkdir(header_dir + "", { recursive: true });
    await fsp.mkdir(source_dir + "", { recursive: true });

    const main_file = `
#pragma once
#include "hc_cpp/include/hydrocarbon.h"
#include "./spec_parser.h"

namespace myParser {

    using HYDROCARBON::ASTRef;

    enum class ${getEnumTypeName(grammar.enums.name)} : unsigned {

        UNDEFINED,
        ${grammar.enums.keys.map(k => k).join(",\n")}
    };
    ${skRenderAsCPP(createSequenceArraySk(grammar))};

    ${grammar.cpp.classes.join(";\n\n")};
    
    HYDROCARBON::ReduceFunction reduce_functions[] = ${renderCPPReduceFunctionLookupArray(grammar)};
    
    HYDROCARBON::ASTRef parse(char * utf8_encoded_input, unsigned long ut8_byte_length){
        return parserCore(
            utf8_encoded_input, 
            ut8_byte_length,
            sequence_lookup, 
            ${getProductionFunctionNameSk(grammar.productions[0])},
            myParser::reduce_functions
            );
        }
}`;
    await fsp.writeFile(entry_header_file + '', main_file);
    //*/
    //Spec Files
    //*

    const { const: constants_a, fn: const_functions_a } = meta.render_constants();

    const str = [...constants_a, ...const_functions_a];

    for (const { entry, goto, reduce } of recognizer_functions)
        str.push(...[entry, goto, reduce].filter(i => i));

    await fsp.writeFile(spec_parser_header_file + '',
        `#pragma once 
#include "hc_cpp/include/hydrocarbon.h"
namespace myParser { 
    using HYDROCARBON::Lexer;
    using HYDROCARBON::ParserData;
    using HYDROCARBON::ParserDataBuffer;    
\n ${str.map(skRenderAsCPPDeclarations).join("\n\n")} \n }`);

    await fsp.writeFile(spec_parser_source_file + '', `#include "../include/spec_parser.h" \n namespace myParser { \n using namespace HYDROCARBON; \n ${str.map(skRenderAsCPP).join("\n\n")} \n }`);
    //*/;
    return main_file;
}

export async function generateWebAssemblyParser(
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    hydrocarbon_import_path: string = "@candlelib/hydrocarbon",
    export_expression_preamble: string = "export default"
): Promise<string> {

    const
        child_process = (await import("child_process")).default,

        fs = (await import("fs")).default,

        { tmpdir } = await import("os"),

        fsp = fs.promises,

        dir = URI.resolveRelative("./hcg_temp", tmpdir() + "/temp"),

        cpp_file = URI.resolveRelative("./temp.cpp", dir),

        wasm_file = URI.resolveRelative("./temp.wasm", dir),

        package_dir = URI.resolveRelative("../../../../", URI.getEXEURL(import.meta).dir),

        script_file = URI.resolveRelative("./scripts/build.sh", package_dir.dir),

        { const: constants_a, fn: const_functions_a } = meta.render_constants(),

        grammar_functions = [...constants_a, ...const_functions_a];

    for (const { entry, goto, reduce } of recognizer_functions)
        grammar_functions.push(...[entry, goto, reduce].filter(i => i));

    //Build WASM Data segment ----------------------------------------------------

    const cpp_entry_content = `
// The character lookup table will be initialized externally,
// removing the need to include the need to use the lu_character_file;
#define INIT_TABLE_EXTERNALLY

#include "hc_cpp/include/hydrocarbon.h"

unsigned char * HYDROCARBON::char_lu_table = nullptr;

using HYDROCARBON::Lexer;
using HYDROCARBON::ParserData;
using HYDROCARBON::ParserDataBuffer; 
using HYDROCARBON::isOutputEnabled; 

${grammar_functions.map(skRenderAsCPPDeclarations).join("\n\n")}

${grammar_functions.map(skRenderAsCPP).join("\n\n")}

static unsigned char * input = nullptr;

${skRenderAsCPP(createSequenceArraySk(grammar))};

extern "C" {
    
    unsigned char * init_data(unsigned input_len, unsigned rule_len){

        if(input != nullptr)
            delete[] input;

        input = new unsigned char[input_len];

        HYDROCARBON::init_data(input, input_len, rule_len);

        return input;
    }
    
    unsigned char* init_table(){
        
        HYDROCARBON::char_lu_table = new unsigned char[${jump8bit_table_byte_size}];

        return HYDROCARBON::char_lu_table;
    }
    
    unsigned short * get_next_command_block(HYDROCARBON::DataRef * ref) {
        return HYDROCARBON::get_next_command_block(ref);
    }
    
    HYDROCARBON::DataRef** get_fork_pointers() {
        return HYDROCARBON::get_fork_pointers();
    }

    unsigned recognize(unsigned byte_length, unsigned production){

        switch(production){
            ${recognizer_functions.filter(f => f.RENDER && grammar.productions[f.id].IS_ENTRY)
            .map((fn, i) => {

                const name = getProductionFunctionNameSk(grammar.productions[fn.id]);

                return `case ${i} : return HYDROCARBON::recognize(byte_length, production, sequence_lookup, &${name});`;
            }).join("\n" + " ".repeat(16))}
        }

        return 0;
    }
}`;

    await fsp.mkdir(dir + "", { recursive: true });
    await fsp.writeFile(cpp_file + '', cpp_entry_content);

    child_process.execFileSync(script_file + "", [cpp_file + "", wasm_file + ""], {
        shell: false,
        cwd: package_dir + "",
    });

    const

        wasm_data = Buffer.from(await wasm_file.fetchBuffer()),

        line_length = 200,

        data_lines = [];

    let compressed_data = null;
    compressed_data = [...wasm_data].map(i => ("00" + i.toString(16)).slice(-2)).join("");

    for (let i = 0; i < compressed_data.length; i += line_length) {
        const max_line = Math.min(compressed_data.length - i, line_length);
        data_lines.push(compressed_data.slice(i, i + max_line));
    }

    const wasm_data_segment = `${data_lines.map(d => `"${d}"`).join("\n+")}`;

    //Render TS/JS script code ----------------------------------------------------

    return `
    ${hydrocarbon_import_path ? `import { ParserFactoryNext as ParserFactory,  initializeUTFLookupTableNewPlus as memInit  } from "${hydrocarbon_import_path}"` : ""};
    
    const 
        wasm_recognizer = ${wasm_data_segment},
    
        reduce_functions = ${renderJavaScriptReduceFunctionLookupArray(grammar)};
    
    ${export_expression_preamble} ParserFactory
        (reduce_functions, wasm_recognizer, undefined, ${createEntryList(grammar)}, memInit);`;
}

/**
 * Constructs a parser string based on grammar and it's build artifacts.
 * 
 * @param grammar 
 * @param recognizer_functions 
 * @param meta 
 * @param hydrocarbon_import_path - Optional: Adds an import line for Hydrocarbon~ParserFactory
 *  to the top of script. The <hydrocarbon_import_path> will be used to assign the correct
 *  import path from 
 * @returns 
 */
export async function generateJSParser(
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    hydrocarbon_import_path: string = "@candlelib/hydrocarbon",
    export_expression_preamble: string = "export default",
    INCLUDE_TYPES: boolean = false
): Promise<string> {

    const renderFunction = (INCLUDE_TYPES ? skRenderAsTypeScript : skRenderAsJavaScript);

    return `
    ${hydrocarbon_import_path ? `import { ParserFactoryNext as ParserFactory, initializeUTFLookupTableNewPlus as memInit} from "${hydrocarbon_import_path}"` : ""};
    const recognizer_initializer = (()=>{

        const char_lu_table = new Uint8Array(${jump8bit_table_byte_size});

        ${renderFunction(createSequenceArraySk(grammar))};

        ${renderFunction(compileRecognizerSource(meta, grammar, recognizer_functions))};

        function recognize_primary( byte_length, production){

            switch(production){
                ${recognizer_functions.filter(f => f.RENDER && grammar.productions[f.id].IS_ENTRY)
            .map((fn, i) => {

                const name = getProductionFunctionNameSk(grammar.productions[fn.id]);

                return `case ${i} : return recognize(byte_length, production, sequence_lookup, ${name});`;
            }).join("\n" + " ".repeat(16))}
            }
    
            return 0;
        }

        function init_data_primary(input_len, rule_len){
            
            const input = new Uint8Array(input_len);
    
            init_data(input, input_len, rule_len);

            return input;
        }

        return {
            init_data: init_data_primary, 
            get_next_command_block,
            init_table : _=>char_lu_table,
            get_fork_pointers,
            recognize : recognize_primary
        };
    });

    const reduce_functions = ${renderJavaScriptReduceFunctionLookupArray(grammar)};

    ${export_expression_preamble} ParserFactory${INCLUDE_TYPES ? `<any, ${createEntryList(grammar)}>` : ""}
        (reduce_functions, undefined, recognizer_initializer, ${createEntryList(grammar)}, memInit);`;
}

function createSequenceArraySk(grammar: HCG3Grammar): SKNode {
    return <SKNode>sk`[static new] sequence_lookup : array_u8 = a(${grammar.sequence_string.split("").map(s => s.charCodeAt(0)).join(",")})`;
}

/**
 * Constructs a parser string based on grammar and it's build artifacts.
 * 
 * @param grammar 
 * @param recognizer_functions 
 * @param meta 
 * @param hydrocarbon_import_path - Optional: Adds an import line for Hydrocarbon~ParserFactory
 *  to the top of script. The <hydrocarbon_import_path> will be used to assign the correct
 *  import path from 
 * @returns 
 */
export async function generateTSParser(
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    hydrocarbon_import_path: string = "@candlelib/hydrocarbon",
    export_expression_preamble: string = "export default"
): Promise<string> {

    return generateJSParser(grammar, recognizer_functions, meta, hydrocarbon_import_path, export_expression_preamble, true);
}

function createEntryList(grammar: HCG3Grammar) {
    return "{" + grammar.productions.filter(p => p.IS_ENTRY).map((p, i) => p.name.replace(/\:\:/, "_") + ":" + i).join(",") + "}";
}

/**
 * 
 * @param file_path - Fully resolved file path for completed parser file.
 * @param grammar - The parser grammar object
 * @param recognizer_functions  - The built recognizer production function artifacts
 * @param meta  - The built recognizer common artifacts
 * @param hydrocarbon_import_path - [Optional] the import path to the hydrocarbon runtime script
 * @param fn_parser_generator - [Optional] A ParserGenerator function
 * @returns 
 */
export async function writeParserScriptFile(
    file_path: string,
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    hydrocarbon_import_path: string = "@candlelib/hydrocarbon",
    fn_parser_generator: ParserGenerator = generateJSParser
): Promise<boolean> {

    const fs = (await import("fs")).default;

    const fsp = fs.promises;

    const file_dir = (new URI(file_path)).dir;

    await fsp.mkdir(file_dir, { recursive: true });

    const parser_string = await fn_parser_generator(grammar, recognizer_functions, meta, hydrocarbon_import_path);

    try {
        await fsp.writeFile(file_path, parser_string);
        return true;
    } catch (e) {
        throw e;
    }
}


function compileRecognizerSource(runner: Helper, grammar: HCG3Grammar, recognizer_functions: RDProductionFunction[]) {
    const { const: constants_a, fn: const_functions_a } = runner.render_constants();

    const recognizer_code = renderSkribbleRecognizer();

    recognizer_code.statements.push(...constants_a, ...const_functions_a);

    for (const { entry, goto, reduce } of recognizer_functions)
        recognizer_code.statements.push(...[entry, goto, reduce].filter(i => i));

    return recognizer_code;
}

export function renderJavaScriptReduceFunctionLookupArray(grammar: HCG3Grammar): string {
    const reduce_functions_str = [...grammar.reduce_functions.keys()].map((b, i) =>
        b + `/*${i}*/`
    ).join(",\n");

    return `[(_,s)=>s[s.length-1], ${reduce_functions_str}]`;
}

export function renderCPPReduceFunctionLookupArray(grammar: HCG3Grammar): string {
    const reduce_functions_str = [...grammar.reduce_functions.keys()].map((b, i) => b).join(",\n");

    return `{[](HYDROCARBON::ASTRef * stack, int len){return stack[len-1];}, ${reduce_functions_str}}`;
}