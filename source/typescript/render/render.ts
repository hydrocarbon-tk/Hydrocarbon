/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Helper } from "../build/helper.js";
import { sk } from "../skribble/skribble.js";
import { SKExpression, SKNode } from "../skribble/types/node.js";
import { GrammarObject } from "../types/grammar_nodes.js";
import { RDProductionFunction } from "../types/rd_production_function.js";
import { buildPreScanFunction, token_lu_bit_size, token_lu_bit_size_offset } from "../utilities/code_generating.js";


function createGrammarFunctionArray(meta: Helper, recognizer_functions: RDProductionFunction[]) {
    const

        { const: constants_a, fn: const_functions_a } = meta.render_constants(), grammar_functions = [buildPreScanFunction(), ...constants_a, ...const_functions_a];

    for (const { entry, goto, reduce } of recognizer_functions)
        grammar_functions.push(...[entry, goto, reduce].filter(i => i));
    return grammar_functions;
}

export function extractAndReplaceTokenMapRefs(token_lookup_functions: string, sym_map: Map<any, any>) {
    return token_lookup_functions.replace(/symbollookup\_((\d+\_?)+)/g, (a, b, c) => {
        if (!sym_map.has(b)) {
            sym_map.set(b, sym_map.size);
        }
        return sym_map.get(b);
    });
}



export function createActiveTokenSK(grammar: GrammarObject): SKNode {
    return <SKExpression>sk`
            fn isTokenActive:bool(token_id:u32, row:u32) {

                [mut] index : u32 = (row ${grammar.meta.token_row_size > 1 ? "* " + grammar.meta.token_row_size : ""}) + (token_id >> ${token_lu_bit_size_offset});

                [mut] shift : u32 = 1 << (${token_lu_bit_size - 1} & (token_id));
            
                return : (token_lookup[index] & shift) != 0;
            }
        `;
}

function createTokenLUSK(sym_map: Map<any, any>): SKNode {
    return <SKExpression>sk`[mut] token_lookup: array_u${token_lu_bit_size} = array_u${token_lu_bit_size}(${[...sym_map.keys()].flatMap(s => s.split("_").slice(1)).join(",")});`;
}

function createSequenceArraySk(grammar: GrammarObject): SKNode {
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
    grammar: GrammarObject,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    hydrocarbon_import_path: string = "@candlelib/hydrocarbon",
    export_expression_preamble: string = "export default"
): Promise<string> {

    return generateScriptParser(grammar, recognizer_functions, meta, hydrocarbon_import_path, export_expression_preamble, true);
}

function createEntryList(grammar: GrammarObject) {
    return "{" + grammar.productions.filter(p => p.IS_ENTRY).map((p, i) => p.name.replace(/\:\:/, "_") + ":" + i).join(",") + "}";
}

export function renderJavaScriptReduceFunctionLookupArray(grammar: GrammarObject): string {
    const reduce_functions_str = [...grammar.reduce_functions.keys()].map((b, i) =>
        b + `/*${i}*/`
    ).join(",\n");

    return `[(_,s)=>s[s.length-1], ${reduce_functions_str}]`;
}

export function renderCPPReduceFunctionLookupArray(grammar: GrammarObject): string {
    const reduce_functions_str = [...grammar.reduce_functions.keys()].map((b, i) => b).join(",\n");

    return `{[](HYDROCARBON::ASTRef * stack, int len){return stack[len-1];}, ${reduce_functions_str}}`;
}