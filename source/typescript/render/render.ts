/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Logger } from '@candlelib/log';
import URI from '@candlelib/uri';
import { writeFile } from "fs/promises";
import { createCPPTypes } from '../asytrip/asytrip_to_cpp.js';
import { createGoTypes } from '../asytrip/asytrip_to_go.js';
import { createRustTypes } from '../asytrip/asytrip_to_rust.js';
import { createTsTypes } from '../asytrip/asytrip_to_ts.js';
import { render_grammar } from '../grammar/passes/common.js';
import { ASYTRIPContext } from '../types/asytrip.js';
import { BuildPack } from '../types/build_pack';
import { formatArray } from '../utilities/format_array.js';

const render_logger = Logger.get("MAIN").createLogger("RENDER");

export async function renderToCPP(
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

${createCPPTypes(grammar, asytrip_context)}`);
}


export async function renderToRust(
    { grammar, state_buffer, states_map }: BuildPack,
    asytrip_context: ASYTRIPContext,
    path: URI
) {
    const entry_pointers = grammar.productions.filter(p => p.IS_ENTRY)
        .map(p => ({ production: p, name: p.name, pointer: states_map.get(p.name).pointer }));

    let array_row_size = 80;

    const ast_path = URI.resolveRelative("./ast.rs", path) + "";
    const data_path = URI.resolveRelative("./data.rs", path) + "";

    await writeFile(data_path,
        `
${entry_pointers.map(p => {
            return `
/**
Bytecode pointer for the [${p.name}](${grammar.URI + ""}) production parser.

\`\`\`
${render_grammar(p.production)}

${p.production.pos.blameDiagram(" ", grammar.URI + "")}
\`\`\`
*/
pub const EntryPoint_${p.name[0].toUpperCase() + p.name.slice(1)}:u32=${p.pointer};`;
        }).join("\n")}

       
pub static Bytecode: [u32; ${state_buffer.length}] = [
    ${formatArray(state_buffer, array_row_size)}
];`)
        ;

    await writeFile(ast_path,
        `

${createRustTypes(grammar, asytrip_context)}`);

    //Run rustfmt on the source files

    const cp = await import("child_process");

    cp.spawn("rustfmt", [ast_path, data_path]);
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