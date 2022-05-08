/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Logger } from '@candlelib/log';
import URI from '@candlelib/uri';
import {
    ASYTRIPContext,
    BuildPack,
    convert_symbol_to_friendly_name, ExportableStates,
    formatArray,
    GrammarObject,
    GrammarProduction,
    scanner_state_mask,
    state_index_mask
} from '@hctoolkit/common';
import { render_grammar } from '@hctoolkit/grammar';
import { writeFile } from "fs/promises";


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

export function renderRustParserData(
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
            lookups.push(`(${state.pointer & state_index_mask}i32, vec![${state.active_tokens.map(t => t + "i16").join(",")}])`);
    }

    return `
use hctk::lazy_static;
use std::collections::HashMap;

lazy_static! {
pub static ref TokenLookup:HashMap<i16, &'static str> = HashMap::from(
    [
        ${[
            ...(grammar.meta?.all_symbols?.by_id.entries() ?? [])
        ].map((
            [id, sym]
        ) => {
            return `(${id}i16, "${convert_symbol_to_friendly_name(sym).replace(/\\/g, "\\\\").replace(/\"/g, "\\\"")}")`;
        }).join(",\n")}
    ]
);
}

pub const ProductionNames:[&'static str; ${grammar.productions.length}] = [${grammar.productions.map((b, i) => `"${b.name ?? "unknown"}"`).join(",\n")}];
pub const ReduceNames:[&'static str; ${grammar.bodies.length}] = [${grammar.bodies.map((b, i) => `"${b.production?.name ?? "unknown"}[${i}]"`).join(",\n")}];

lazy_static! {
    pub static ref ExpectedTokenLookup: HashMap<i32, Vec<i16>> = HashMap::from(
        [${lookups.join(",\n")}]
    );
}
${entry_pointers.map(p =>
            `
/**
Bytecode pointer for the [${p.name}](${grammar.URI + ""}) production parser.

\`\`\`
${render_grammar(p.production)}
\`\`\`
*/
pub const EntryPoint_${p.name[0].toUpperCase() + p.name.slice(1)}:u32=${p.pointer};`
        ).join("\n")}

pub static BYTECODE: [u32; ${bytecode.length}] = [
    ${formatArray(bytecode, array_row_size)}
];`;

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
            return `[${id}, "${convert_symbol_to_friendly_name(sym).replace(/\\/g, "\\\\").replace(/\"/g, "\\\"")}"]`;
        }).join(",\n")}
    ]
);

export const ProductionNames = [${grammar.productions.map((b, i) => `"${b.name ?? "unknown"}"`).join(",\n")}]
export const ReduceNames = [${grammar.bodies.map((b, i) => `"${b.production?.name ?? "unknown"}[${i}]"`).join(",\n")}]

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

};