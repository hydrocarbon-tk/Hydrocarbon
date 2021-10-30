/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { ParserEnvironment } from '@candlelib/hydrocarbon';
import { createBuildPack } from '../build/build.js';
import { compileGrammarFromString } from '../grammar/compile.js';
import { init_table, instruction_pointer_mask, KernelState, KernelStateIterator, run } from '../runtime/kernel_next.js';
import { ParserFramework } from '../runtime/parser_framework_new.js';
import { fillByteBufferWithUTF8FromString } from '../runtime/utf8.js';
import { skRenderAsJavaScript } from '../skribble/skribble.js';
import { GrammarObject } from '../types/grammar_nodes';
import {
    BuildPack, createActiveTokenSK, renderJavaScriptReduceFunctionLookupArray
} from './render.js';


/**
 * Constructs a JavaScript based parser from a grammar string or build pack.
 * @param build_pack
 * @returns
 */


export async function createAddHocParser<T = any>(
    build_pack: BuildPack | string | Promise<BuildPack | string>,

): Promise<{
    parse: (input: string, env: ParserEnvironment, production_selector: number) => T[],
    reverse_state_lookup,
    grammar: GrammarObject;
}> {

    let resolved_build_pack: BuildPack = null;

    const test_pack = await build_pack;

    if (typeof test_pack == "string") {
        const { grammar } = await compileGrammarFromString(test_pack);

        resolved_build_pack = await createBuildPack(grammar);
    } else {
        resolved_build_pack = test_pack;
    }

    const { grammar, state_buffer, sym_map, states_map } = resolved_build_pack;
    const entry_pointers = grammar.productions.filter(p => p.IS_ENTRY).map(p => ({ name: p.name, pointer: states_map.get(p.name).pointer }));
    const reverse_state_lookup = new Map([...states_map.entries()].map(([key, val]) => [instruction_pointer_mask & val.pointer, val.string]));
    //Attempt to parse input

    const input_string = `
   
    const functions = ${renderJavaScriptReduceFunctionLookupArray(grammar)};

     return { functions };
    `.replace(/_A_([\w\_\d]+)_A_/g,
        (name, sub: string, ...args) => {
            const { pointer } = states_map.get("tok_" + sub);
            return pointer + "";
        });

    let { scan: tk_scan, functions: fns } = (Function(
        "states_buffer",
        input_string)

    )(
        state_buffer
    );

    console.log({
        pt: entry_pointers[0].pointer
    });

    const { parse } = await ParserFramework<T, { null: 0; }, "null">(fns, undefined, {

        init_table: () => {
            const table = new Uint8Array(382976);
            init_table(table);
            return table;
        },
        create_iterator: (data: KernelState) => {
            return new KernelStateIterator(data);
        },
        recognize: (string: string, entry_pointer: number) => {

            const temp_buffer = new Uint8Array((string.length + 1) * 4);

            const actual_length = fillByteBufferWithUTF8FromString(string, temp_buffer, temp_buffer.length);

            const input_buffer = new Uint8Array(temp_buffer.buffer, 0, actual_length);

            return run(
                state_buffer,
                input_buffer,
                input_buffer.length,
                entry_pointers[0].pointer,
                true
            );
        }
    });

    return { parse, rlu: reverse_state_lookup, grammar };
}

