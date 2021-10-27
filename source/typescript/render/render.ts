/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Logger } from '@candlelib/log';
import { writeFile } from "fs/promises";
import { createGoTypes } from '../grammar/passes/asytrip/asytrip_to_go.js';
import { createTsTypes } from '../grammar/passes/asytrip/asytrip_to_ts.js';
import { ASYTRIPContext } from '../grammar/passes/asytrip/types.js';
import { sk, skRenderAsJavaScript } from "../skribble/skribble.js";
import { SKExpression, SKNode } from "../skribble/types/node.js";
import { GrammarObject } from "../types/grammar_nodes.js";
import { StateMap } from '../types/ir_state_data.js';
import { token_lu_bit_size, token_lu_bit_size_offset } from "../utilities/code_generating.js";
export interface BuildPack {
    grammar: GrammarObject;
    state_buffer: Uint32Array;
    states_map: StateMap;
}

const render_logger = Logger.get("MAIN").createLogger("RENDER");

export function renderToCPP(
    { grammar, state_buffer, states_map }: BuildPack,
) {

}


export function renderToRust(
    { grammar, state_buffer, states_map }: BuildPack,
) {

}

export async function renderToGo(
    { grammar, state_buffer, states_map }: BuildPack,
    asytrip_context: ASYTRIPContext
) {
    const entry_pointers = grammar.productions.filter(p => p.IS_ENTRY)
        .map(p => ({ name: p.name, pointer: states_map.get(p.name).pointer }));

    let array_row_size = 80;

    await writeFile("./source/hc_golang_sandbox/data.go",
        `package main

var instructions = []uint32  {
    ${Array.from(state_buffer).map(v => (v >>> 0) + "")
            .reduce((r, v, i) => {
                if (r.length == 0) return [v + ""];
                else if (r[r.length - 1].length >= array_row_size)
                    r.push(v);
                else
                    r[r.length - 1] += "," + v;
                return r;
            }, []).map(d => d + ",").join("\n")}
}`);

    await writeFile("./source/hc_golang_sandbox/ast.go",
        `package main

${createGoTypes(grammar, asytrip_context)}`);
}

export async function renderToTypeScript(
    { grammar, state_buffer, states_map }: BuildPack,
    asytrip_context: ASYTRIPContext
) {
    const entry_pointers = grammar.productions.filter(p => p.IS_ENTRY)
        .map(p => ({ name: p.name, pointer: states_map.get(p.name).pointer }));

    let array_row_size = 80;

    await writeFile("./test8/data.ts",
        `
export const instructions = new Uint32Array([    
    ${Array.from(state_buffer).map(v => (v >>> 0) + "")
            .reduce((r, v, i) => {
                if (r.length == 0) return [v + ""];
                else if (r[r.length - 1].length >= array_row_size)
                    r.push(v);
                else
                    r[r.length - 1] += "," + v;
                return r;
            }, []).map(d => d + ",").join("\n")}
])`);

    await writeFile("./test8/ast.ts", createTsTypes(grammar, asytrip_context));

    console.log({ entry_pointers });
}

export function renderToJavaScript(
    { grammar, state_buffer, sym_map, states_map }: BuildPack,
    ADD_TYPE_ANNOTATIONS: boolean = false
) {
    render_logger.log("Rendering JS File");

    const ATA = ADD_TYPE_ANNOTATIONS;
    const entry_pointers = grammar.productions.filter(p => p.IS_ENTRY).map(p => ({ name: p.entry_name, pointer: states_map.get(p.name).pointer }));
    //Attempt to parse input
    const token_lookup_functions = "";

    const array_row_size = 75;
    const script = `
import {
    ParserFrameworkNew as ParserFramework,
    KernelParserCore2,
    fillByteBufferWithUTF8FromString
} from "@candlelib/hydrocarbon";


const {
    token_production,
    init_table,
    KernelStateIterator,
    run,
    compare
} = KernelParserCore2;

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

        const temp_buffer = new Uint8Array((string.length+1) * 4);

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

${/**/
        ATA
            ?
            `
const reduce_functions = ${renderJavaScriptReduceFunctionLookupArray(grammar)};

export default <ParserFramework>ParserFramework(
    reduce_functions,
    {
${entry_pointers.map(({ name }, i) => `        ${name}:${i}`).join(",\n")},
    },
    js_parser_pack,

);
            `
            :
            `
const reduce_functions = ${renderJavaScriptReduceFunctionLookupArray(grammar)};

export default ParserFramework(
    reduce_functions,
    {
${entry_pointers.map(({ name }, i) => `        ${name}:${i}`).join(",\n")},
    },
    js_parser_pack,

);`
        }

`.replace(/_A_([\w\_\d]+)_A_/g,
            (name, sub: string, ...args) => {
                const { pointer } = states_map.get("tok_" + sub);
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