/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import URI from "@candlelib/uri";
import { Helper } from "../build/helper.js";
import { jump8bit_table_byte_size } from "../runtime/parser_memory_new.js";
import { sk, skRenderAsCPP, skRenderAsCPPDeclarations, skRenderAsJavaScript, skRenderAsRust, skRenderAsTypeScript } from "../skribble/skribble.js";
import { SKExpression, SKNode } from "../skribble/types/node.js";
import { HCG3Grammar } from "../types/grammar_nodes.js";
import { RDProductionFunction } from "../types/rd_production_function.js";
import { createSymbolScanFunctionNew, getProductionFunctionNameSk, renderPreScanFunction, token_lu_bit_size, token_lu_bit_size_offset } from "../utilities/code_generating.js";
import * as cpp from "./cpp_render.js";
import * as rust from "./rust_render.js";

export async function generateRustParser(
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    output_location: string = "",
    namespace: string = "parser"
): Promise<string> {

    const
        fs = (await import("fs")).default,

        fsp = fs.promises,

        package_dir = URI.resolveRelative(output_location, "./"),

        entry_header_file = URI.resolveRelative("./parser.rs", package_dir),

        spec_parser_source_file = URI.resolveRelative("./spec_parser.rs", package_dir),

        rendered_structs = rust.buildCompilableStructs(grammar),

        main_enum_list = rust.createRustEnumList(grammar),

        main_file = `
    
    use candlelib_hydrocarbon::completer::*;
    use super::spec_parser::*;
    
    pub type NodeRef = ASTRef<TypeEnum>;
    pub type BoxedNodeRef = Box<ASTRef<TypeEnum>>;

    ${rendered_structs.map(s => `#[derive(Debug)]\n${s}`).join("\n\n")}

    #[derive(Debug)]

    ${main_enum_list}
    
    ${rust.renderRustFunctionLUArray(grammar)};


    pub fn parse(string_data: &[u8]) -> OptionedBoxedASTRef<TypeEnum> {
        parser_core(
            string_data, 
            ${grammar.productions[0].id}, 
            ${getProductionFunctionNameSk(grammar.productions[0])}, 
            &reduce_functions
        )
    }
`;
    await fsp.mkdir(package_dir + "", { recursive: true });

    await fsp.writeFile(entry_header_file + '', main_file);

    //*/
    //Spec Files
    //*

    const
        sym_map = new Map(),

        token_lookup_functions = extractAndReplaceTokenMapRefs(createSymbolScanFunctionNew({
            grammar: grammar,
            helper: meta
        }).map(skRenderAsRust).join("\n\n"), sym_map),

        grammar_functions = createGrammarFunctionArray(meta, recognizer_functions),

        functions_string = extractAndReplaceTokenMapRefs(grammar_functions.map(skRenderAsRust).join("\n\n"), sym_map);

    await fsp.writeFile(spec_parser_source_file + '', `
    use candlelib_hydrocarbon::core_parser::*;
    ${skRenderAsRust(createTokenLUSK(sym_map))};
    ${skRenderAsRust(createSequenceArraySk(grammar))};

    fn isTokenActive(token_id: i32, row: u32) -> bool {
        let index = ((row * 6) + (token_id >> 4) as u32) as usize;
        let shift: u16 = 1 << (15 & (token_id - 1));
        return (token_lookup[index] & shift) > 0;
    }

    ${token_lookup_functions}
    ${functions_string} 
`);
    //*/;
    return main_file;
}

export async function generateCPPParser(
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    output_location: string = "",
    namespace: string = "parser"
): Promise<string> {

    const

        fs = (await import("fs")).default,

        fsp = fs.promises,


        package_dir = URI.resolveRelative(output_location, "./"),

        header_dir = URI.resolveRelative("./include/", package_dir),

        entry_header_file = URI.resolveRelative("./parser.h", header_dir),

        source_dir = URI.resolveRelative("./source/", package_dir),

        spec_parser_header_file = URI.resolveRelative("./spec_parser.h", header_dir),

        spec_parser_source_file = URI.resolveRelative("./spec_parser.cpp", source_dir),

        main_file = `
#pragma once
#include "hc_cpp/include/hydrocarbon.h"
#include "./spec_parser.h"

namespace ${namespace} {

    using HYDROCARBON::ASTRef;

    enum class ${cpp.getEnumTypeName(grammar.enums.name)} : unsigned {

        UNDEFINED,
        ${grammar.enums.keys.map(k => k).join(",\n")}
    };
    
    ${grammar.compiled.structs.join(";\n\n")};
    
    HYDROCARBON::ReduceFunction reduce_functions[] = ${renderCPPReduceFunctionLookupArray(grammar)};
    
    HYDROCARBON::ASTRef parse(char * utf8_encoded_input, unsigned long ut8_byte_length){
        return parserCore(
            utf8_encoded_input, 
            ut8_byte_length,
            ${grammar.productions[0].id}, 
            ${getProductionFunctionNameSk(grammar.productions[0])},
            myParser::reduce_functions
            );
        }
}`;


    await fsp.mkdir(header_dir + "", { recursive: true });
    await fsp.mkdir(source_dir + "", { recursive: true });
    await fsp.writeFile(entry_header_file + '', main_file);

    //*/
    //Spec Files
    //*

    const
        sym_map = new Map(),

        token_lookup_functions = extractAndReplaceTokenMapRefs(createSymbolScanFunctionNew({
            grammar: grammar,
            helper: meta
        }).map(skRenderAsCPP).join("\n\n"), sym_map),

        grammar_functions = createGrammarFunctionArray(meta, recognizer_functions),

        functions_string = extractAndReplaceTokenMapRefs(grammar_functions.map(skRenderAsCPP).join("\n\n"), sym_map);

    await fsp.writeFile(spec_parser_header_file + '',
        `#pragma once 
#include "hc_cpp/include/hydrocarbon.h"
namespace ${namespace} { 
    using HYDROCARBON::Lexer;
    using HYDROCARBON::ParserState;
    using HYDROCARBON::ParserStateBuffer;    
\n ${grammar_functions.map(skRenderAsCPPDeclarations).join("\n\n")} \n }`);


    await fsp.writeFile(spec_parser_source_file + '', `#include "../include/spec_parser.h" 
 namespace ${namespace} { 
     using namespace HYDROCARBON; 
    ${skRenderAsCPP(createTokenLUSK(sym_map))};
    ${skRenderAsCPP(createActiveTokenSK(grammar))}
    ${skRenderAsCPP(createSequenceArraySk(grammar))};
    ${token_lookup_functions}
     ${functions_string} 
}`);
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

        sym_map = new Map(),

        token_lookup_functions = extractAndReplaceTokenMapRefs(createSymbolScanFunctionNew({
            grammar: grammar,
            helper: meta
        }).map(skRenderAsCPP).join("\n\n"), sym_map),

        grammar_functions = createGrammarFunctionArray(meta, recognizer_functions),

        functions_string = extractAndReplaceTokenMapRefs(grammar_functions.map(skRenderAsCPP).join("\n\n"), sym_map),

        //Build WASM Data segment ----------------------------------------------------

        cpp_entry_content = `
// The character lookup table will be initialized externally,
// removing the need to include the need to use the lu_character_file;
#define INIT_TABLE_EXTERNALLY

#include "hc_cpp/include/hydrocarbon.h"

unsigned char * HYDROCARBON::char_lu_table = nullptr;

using HYDROCARBON::char_lu_table;
using HYDROCARBON::Lexer;
using HYDROCARBON::ParserState;
using HYDROCARBON::ParserStateIterator;
using HYDROCARBON::ParserStateBuffer; 
using HYDROCARBON::ParserResultBuffers; 
using HYDROCARBON::is_output_enabled; 
using HYDROCARBON::set_production; 
using HYDROCARBON::u16; 
using HYDROCARBON::u32; 

${grammar_functions.map(skRenderAsCPPDeclarations).join("\n\n")};

${skRenderAsCPP(createTokenLUSK(sym_map))};
${skRenderAsCPP(createActiveTokenSK(grammar))}
${skRenderAsCPP(createSequenceArraySk(grammar))};

${token_lookup_functions}
${functions_string}

static unsigned char * input = nullptr;

extern "C" {
    
    unsigned char* init_table(){
        
        char_lu_table = new unsigned char[${jump8bit_table_byte_size}];

        return char_lu_table;
    }

    ParserStateIterator* create_iterator(ParserState * state) { 
        return new ParserStateIterator(*state);
    }


    u16 iterator_next(ParserStateIterator* iter) { 
        return iter->next();
    }

    bool iterator_valid(ParserStateIterator* iter) { 
        return iter->is_valid();
    }

    bool buffer_valid(ParserStateBuffer* buffer) { 
        return buffer->have_valid();
    }

    u32 buffer_len(ParserStateBuffer* buffer) { 
        return buffer->len();
    }

    ParserState * buffer_get_mut_state(ParserStateBuffer* buffer, u32 index) { 
        return &buffer->get_mut_state(index);
    }

    ParserResultBuffers * recognize(unsigned char * buffer, unsigned byte_length, unsigned production_id){

        ParserResultBuffers temp = {nullptr, nullptr};

        switch(production_id){
            ${recognizer_functions.filter(f => f.RENDER && grammar.productions[f.id].IS_ENTRY)
                .map((fn, i) => {

                    const name = getProductionFunctionNameSk(grammar.productions[fn.id]);

                    return `case ${i} : temp = HYDROCARBON::recognize(buffer, byte_length, ${fn.id}, &${name});`;
                }).join("\n" + " ".repeat(16))}
        }

        return new ParserResultBuffers(temp);
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
    ${hydrocarbon_import_path ?
            `import { 
    ParserFactoryBeta as ParserFactory
} from "${hydrocarbon_import_path}"` : ""};
    
    const 
        wasm_recognizer = ${wasm_data_segment},
    
        reduce_functions = ${renderJavaScriptReduceFunctionLookupArray(grammar)};
    
    ${export_expression_preamble} ParserFactory
        (reduce_functions, wasm_recognizer, undefined, ${createEntryList(grammar)});`;
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
export async function generateScriptParser(
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    hydrocarbon_import_path: string = "@candlelib/hydrocarbon",
    export_expression_preamble: string = "export default",
    INCLUDE_TYPES: boolean = false
): Promise<string> {

    const renderFunction = (INCLUDE_TYPES ? skRenderAsTypeScript : skRenderAsJavaScript);

    const
        sym_map = new Map(),

        token_lookup_functions = extractAndReplaceTokenMapRefs(createSymbolScanFunctionNew({
            grammar: grammar,
            helper: meta
        }).map(renderFunction).join("\n\n"), sym_map),

        grammar_functions = createGrammarFunctionArray(meta, recognizer_functions),

        functions_string = extractAndReplaceTokenMapRefs(grammar_functions.map(renderFunction).join("\n\n"), sym_map);

    return `
    ${hydrocarbon_import_path ? `import { 
        ParserFactoryBeta as ParserFactory, 
        fillByteBufferWithUTF8FromString,
        ParserCore
    } from "${hydrocarbon_import_path}"` : ""};

    const recognizer_initializer = (()=>{
        
        const {
            add_reduce,
            add_skip,
            compare,
            token_production,
            is_output_enabled,
            consume,
            recognize,
            init_table,
            set_production,
            ParserStateIterator
        } = ParserCore;
    

        ${renderFunction(createTokenLUSK(sym_map))};
        ${renderFunction(createSequenceArraySk(grammar))};
        ${renderFunction(createActiveTokenSK(grammar))};
        ${token_lookup_functions}
        ${functions_string} 

        function recognize_primary( string, production){

            //create the input data buffer. 
            const temp_buffer = new Uint8Array(string.length * 4);
            
            const actual_length = fillByteBufferWithUTF8FromString(string, temp_buffer, temp_buffer.length);

            const resolved_buffer = new Uint8Array(temp_buffer.buffer, 0, actual_length);

            switch(production){
                ${recognizer_functions.filter(f => f.RENDER && grammar.productions[f.id].IS_ENTRY)
            .map((fn, i) => {
                const name = getProductionFunctionNameSk(grammar.productions[fn.id]);
                return `case ${i} : return recognize(resolved_buffer, actual_length, ${fn.id}, ${name});`;
            }).join("\n" + " ".repeat(16))}
            }
    
            return {invalid: {}, valid:{}};
        }

        return {
            init_table: ()=> {
                const table = new Uint8Array(${jump8bit_table_byte_size});
                init_table(table);
                return table;
            },
            recognize: recognize_primary,
            create_iterator: data => new ParserStateIterator(data)
        };
    });

    const reduce_functions = ${renderJavaScriptReduceFunctionLookupArray(grammar)};

    ${export_expression_preamble} ParserFactory${INCLUDE_TYPES ? `<any, ${createEntryList(grammar)}>` : ""}
        (reduce_functions, undefined, recognizer_initializer, ${createEntryList(grammar)});`;
}
function createGrammarFunctionArray(meta: Helper, recognizer_functions: RDProductionFunction[]) {
    const

        { const: constants_a, fn: const_functions_a } = meta.render_constants(), grammar_functions = [renderPreScanFunction(), ...constants_a, ...const_functions_a];

    for (const { entry, goto, reduce } of recognizer_functions)
        grammar_functions.push(...[entry, goto, reduce].filter(i => i));
    return grammar_functions;
}

function extractAndReplaceTokenMapRefs(token_lookup_functions: string, sym_map: Map<any, any>) {
    return token_lookup_functions.replace(/symbollookup(\_\d+)+/g, (a, b, c) => {
        if (!sym_map.has(a)) {
            sym_map.set(a, sym_map.size);
        }
        return sym_map.get(a);
    });
}



function createActiveTokenSK(grammar: HCG3Grammar): SKNode {
    return <SKExpression>sk`
            fn isTokenActive:bool(token_id:u32, row:u32) {

                [mut] index : u32 = (row ${grammar.meta.token_row_size > 1 ? "* " + grammar.meta.token_row_size : ""}) + (token_id >> ${token_lu_bit_size_offset});

                [mut] shift : u32 = 1 << (${token_lu_bit_size - 1} & (token_id - 1));
            
                return : (token_lookup[index] & shift) > 0;
            }
        `;
}

function createTokenLUSK(sym_map: Map<any, any>): SKNode {
    return <SKExpression>sk`[mut] token_lookup: array_u${token_lu_bit_size} = array_u${token_lu_bit_size}(${[...sym_map.keys()].flatMap(s => s.split("_").slice(1)).join(",")});`;
}

function createSequenceArraySk(grammar: HCG3Grammar): SKNode {
    return <SKNode>sk`[static new] token_sequence_lookup : array_u8 = a(${grammar.sequence_string.split("").map(s => s.charCodeAt(0)).join(",")})`;
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

    return generateScriptParser(grammar, recognizer_functions, meta, hydrocarbon_import_path, export_expression_preamble, true);
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
export async function writeJSBasedParserScriptFile(
    file_path: string,
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    hydrocarbon_import_path: string = "@candlelib/hydrocarbon",
    fn_parser_generator = generateScriptParser
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