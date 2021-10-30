/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Logger } from '@candlelib/log';
import URI from '@candlelib/uri';
import { writeFile } from "fs/promises";
import { createGoTypes } from '../asytrip/asytrip_to_go.js';
import { createTsTypes } from '../asytrip/asytrip_to_ts.js';
import { ASYTRIPContext } from '../asytrip/types.js';
import { GrammarObject } from "../types/grammar_nodes.js";
import { StateMap } from '../types/ir_state_data.js';
import { formatArray } from '../utilities/format_array.js';
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
    asytrip_context: ASYTRIPContext,
    path: URI
) {
    const entry_pointers = grammar.productions.filter(p => p.IS_ENTRY)
        .map(p => ({ name: p.name, pointer: states_map.get(p.name).pointer }));

    let array_row_size = 80;

    await writeFile(URI.resolveRelative("./data.go", path) + "",
        `package main

var instructions = []uint32  {
    ${formatArray(state_buffer, array_row_size)}
}`);

    await writeFile(URI.resolveRelative("./ast.go", path) + "",
        `package main

${createGoTypes(grammar, asytrip_context)}`);
}

export async function renderToTypeScript(
    { grammar, state_buffer, states_map }: BuildPack,
    asytrip_context: ASYTRIPContext,
    path: URI
) {
    const entry_pointers = grammar.productions.filter(p => p.IS_ENTRY)
        .map(p => ({ name: p.name, pointer: states_map.get(p.name).pointer }));

    let array_row_size = 80;

    await writeFile(URI.resolveRelative("./data.ts", path) + "",
        `
export const instructions = new Uint32Array([    
    ${formatArray(state_buffer, array_row_size)}
])`);

    await writeFile(URI.resolveRelative("./ast.ts", path) + "", createTsTypes(grammar, asytrip_context));

    console.log({ entry_pointers });
}

export function renderJavaScriptReduceFunctionLookupArray(grammar: GrammarObject): string {
    const reduce_functions_str = [...grammar.reduce_functions.keys()].map((b, i) =>
        b + `/*${i}*/`
    ).join(",\n");

    return `[(_,s)=>s[s.length-1], ${reduce_functions_str}]`;
}