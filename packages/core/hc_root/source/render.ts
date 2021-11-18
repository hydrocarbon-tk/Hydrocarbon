/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Logger } from '@candlelib/log';
import URI from '@candlelib/uri';
import { GrammarProduction, GrammarObject, formatArray, StateData, ExportableStates, scanner_state_mask, state_index_mask, convert_symbol_to_string, convert_symbol_to_friendly_name } from '@hctoolkit/common';
import { writeFile } from "fs/promises";
import { render_grammar } from '@hctoolkit/grammar';

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
    const entry_pointers = getEntryPointers(grammar, states_map);

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

       
pub static BYTECODE: [u32; ${state_buffer.length}] = [
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
    const entry_pointers = getEntryPointers(grammar, states_map);

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

export function renderTypeScriptParserData(
    grammar: GrammarObject,
    bytecode: Uint32Array,
    entry_pointers: {
        production: GrammarProduction;
        name: string;
        pointer: number;
    }[],
    states: ExportableStates,
) {

    let array_row_size = 80;

    const lookups = [];

    for (const name in states.states) {

        const state = states.states[name];

        if (state.pointer & scanner_state_mask)
            continue;

        if (state.active_tokens.length > 0)
            lookups.push(`[${state.pointer & state_index_mask}, [${state.active_tokens}]]`);
    }

    return `
export const TokenLookup = new Map(
    [
        ${[
            ...(grammar.meta?.all_symbols?.by_id.entries() ?? [])
        ].map((
            [id, sym]
        ) => {
            return `[${id}, "${convert_symbol_to_friendly_name(sym).replace(/\"/g, "\\\"")}"]`;
        }).join(",\n")}
    ]
);

export const ExpectedTokenLookup = new Map(
    [${lookups.join(",\n")}]
);
export enum Entrypoint { ${entry_pointers.map(p => {
            return `
/**
Bytecode pointer for the [${p.name}](${grammar.URI + ""}) production parser.
\`\`\`
${render_grammar(p.production)}
\`\`\`
*/
${p.name}=${p.pointer}`;
        }).join(",\n")}
}


export const Bytecode = new Uint32Array([    
    ${formatArray(bytecode, array_row_size)}
])`;

}