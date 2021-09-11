/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Logger } from '../runtime/logger.js';
import { sk, skRenderAsJavaScript, skRenderAsRust } from "../skribble/skribble.js";
import { SKExpression, SKNode } from "../skribble/types/node.js";
import { GrammarObject } from "../types/grammar_nodes.js";
import { StateMap } from '../types/ir_state_data.js';
import { getSymbolScannerFunctions, token_lu_bit_size, token_lu_bit_size_offset } from "../utilities/code_generating.js";
import * as cpp from "./cpp_render.js";
import * as rust from "./rust_render.js";
export interface BuildPack {
    grammar: GrammarObject;
    state_buffer: Uint32Array;
    sym_map: Map<string, number>;
    states_map: StateMap;
}

const render_logger = Logger.get("MAIN").createLogger("RENDER");

export function renderToCPP(
    { grammar, state_buffer, sym_map, states_map }: BuildPack,
) {

}


export function renderToRust(
    { grammar, state_buffer, sym_map, states_map }: BuildPack,
) {
    const rendered_structs = rust.buildCompilableStructs(grammar);
    const main_enum_list = rust.createRustEnumList(grammar);
    const array_row_size = 75;

    const entry_pointers = grammar.productions.filter(p => p.IS_ENTRY).map(p => ({ name: p.entry_name, pointer: states_map.get(p.name).pointer }));
    //Attempt to parse input
    const token_lookup_functions = extractAndReplaceTokenMapRefs(getSymbolScannerFunctions(grammar)

        .map(skRenderAsRust)

        .join("\n\n"), sym_map);


    const rust_file = `
use candlelib_hydrocarbon::framework::*;
use super::spec_parser::*;

const token_sequence_lookup: [u8:${grammar.sequence_string.length}] = [
${/**/
        grammar.sequence_string
            .split("")
            .map(s => s.charCodeAt(0))
            .reduce((r, v, i) => {
                if (r.length == 0) return [v + ""];
                else if (r[r.length - 1].length >= array_row_size)
                    r.push(v);
                else
                    r[r.length - 1] += "," + v;
                return r;
            }, []).join(",\n")
        }
];

const token_lookup: [${{ 8: "u8", 16: "u16", 32: "u32" }[token_lu_bit_size]};${0}] =[
${/**/
        ([...sym_map.keys()]
            .flatMap(s => s.split("_"))
            .reduce((r, v, i) => {
                if (r.length == 0) return [v + ""];
                else if (r[r.length - 1].length >= array_row_size)
                    r.push(v);
                else
                    r[r.length - 1] += "," + v;
                return r;
            }, []).join(",\n"))
        }
];

const states_buffer: [u32;${state_buffer.length}] = [
${ /**/
        Array.from(state_buffer).map(v => (v >>> 0) + "")
            .reduce((r, v, i) => {
                if (r.length == 0) return [v + ""];
                else if (r[r.length - 1].length >= array_row_size)
                    r.push(v);
                else
                    r[r.length - 1] += "," + v;
                return r;
            }, []).join(",\n")
        }
];

fn isTokenActive(token_id: i32, row: u32) -> bool {
    let index = ((row * 6) + (token_id >> 4) as u32) as usize;
    let shift: u16 = 1 << (15 & (token_id));
    return (token_lookup[index] & shift) > 0;
}

${token_lookup_functions}

${rendered_structs.map(s => `#[derive(Debug)]\n${s}`).join("\n\n")}

pub type NodeRef = ASTRef<TypeEnum>;
pub type BoxedNodeRef = Box<ASTRef<TypeEnum>>;

${rust.renderRustFunctionLUArray(grammar)};

#[derive(Debug)]
${main_enum_list}

pub enum EntryPoint {
${entry_pointers.map(({ name }, i) => `        ${name}`).join(",\n")},
}

pub fn parse(string_data: &[u8], entry_point:EntryPoint) -> OptionedBoxedASTRef<TypeEnum> {

    let entry_pointer:u32 = 0;

    match entry_point as u32 {
        ${entry_pointers.map(({ name, pointer }, i) =>
    /**/`${name} ${i == 0 ? "| _ " : ""} => { entry_pointer = ${pointer};} `).join("\n\n            ")}
    }

    let state_buffer_ref = states_buffer[..];

    run(
        entry_pointer,
        string_data,
        state_buffer_ref, 
        scan,
        reduce_functions
    )
}
`.replace(/_A_([\w\_\d]+)_A_/g,
            (name, sub: string, ...args) => {
                const { pointer } = states_map.get(sub);
                return pointer + "";
            });

    return rust_file;
}

export function renderToJavaScript(
    { grammar, state_buffer, sym_map, states_map }: BuildPack,
) {
    render_logger.log("Rendering JS File");
    const entry_pointers = grammar.productions.filter(p => p.IS_ENTRY).map(p => ({ name: p.entry_name, pointer: states_map.get(p.name).pointer }));
    //Attempt to parse input
    const token_lookup_functions = extractAndReplaceTokenMapRefs(getSymbolScannerFunctions(grammar)
        .map(skRenderAsJavaScript)
        .join("\n\n"), sym_map);

    const array_row_size = 75;
    const script = `
import {
    ParserFramework,
    KernelParserCore,
    fillByteBufferWithUTF8FromString
} from "@candlelib/hydrocarbon";


const {
    token_production,
    init_table,
    KernelStateIterator,
    run,
    compare
} = KernelParserCore;

const token_sequence_lookup = new Uint8Array([
${/**/
        grammar.sequence_string
            .split("")
            .map(s => s.charCodeAt(0))
            .reduce((r, v, i) => {
                if (r.length == 0) return [v + ""];
                else if (r[r.length - 1].length >= array_row_size)
                    r.push(v);
                else
                    r[r.length - 1] += "," + v;
                return r;
            }, []).join(",\n")
        }
])

const token_lookup = new ${
        /**/
        { 8: "Uint8Array", 16: "Uint8Array", 32: "Uint32Array" }[token_lu_bit_size]
        }([
${/**/
        ([...sym_map.keys()]
            .flatMap(s => s.split("_"))
            .reduce((r, v, i) => {
                if (r.length == 0) return [v + ""];
                else if (r[r.length - 1].length >= array_row_size)
                    r.push(v);
                else
                    r[r.length - 1] += "," + v;
                return r;
            }, []).join(",\n"))
        }
]);

const states_buffer = new Uint32Array([
${ /**/
        Array.from(state_buffer).map(v => (v >>> 0) + "")
            .reduce((r, v, i) => {
                if (r.length == 0) return [v + ""];
                else if (r[r.length - 1].length >= array_row_size)
                    r.push(v);
                else
                    r[r.length - 1] += "," + v;
                return r;
            }, []).join(",\n")
        }
]);

${skRenderAsJavaScript(createActiveTokenSK(grammar))}

${token_lookup_functions}

const js_parser_pack = {

    init_table: () => {
        const table = new Uint8Array(382976);
        init_table(table);
        return table;
    },

    create_iterator: (data) => {
        return new KernelStateIterator(data);
    },

    recognize: (string, entry_index) => {

        const temp_buffer = new Uint8Array(string.length * 4);

        const actual_length = fillByteBufferWithUTF8FromString(string, temp_buffer, temp_buffer.length);

        const input_buffer = new Uint8Array(temp_buffer.buffer, 0, actual_length);

        let entry_pointer = 0;

        switch(entry_index){

            ${entry_pointers.map(({ pointer }, i) =>
/**/`case ${i}: ${i == 0 ? "default: " : ""} entry_pointer = ${pointer}; break;`).join("\n\n            ")}
        }
        
        return run(
            states_buffer,
            input_buffer,
            input_buffer.length,
            entry_pointer,
            scan,
            false
        );
    }
};

const reduce_functions = ${renderJavaScriptReduceFunctionLookupArray(grammar)};

export default ParserFramework(
    reduce_functions,
    {
${entry_pointers.map(({ name }, i) => `        ${name}:${i}`).join(",\n")},
    },
    js_parser_pack,

);`.replace(/_A_([\w\_\d]+)_A_/g,
            (name, sub: string, ...args) => {
                const { pointer } = states_map.get(sub);
                return pointer + "";
            });

    render_logger.log("JS File Rendering Complete");

    return script;
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

function createSequenceArraySk(grammar: GrammarObject): SKNode {
    return <SKNode>sk`[static new] token_sequence_lookup : array_u8 = a(${grammar.sequence_string.split("").map(s => s.charCodeAt(0)).join(",")})`;
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