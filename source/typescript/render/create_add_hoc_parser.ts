/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { ParserEnvironment } from '@candlelib/hydrocarbon';
import { createBuildPack } from '../build/build.js';
import { compileGrammarFromString } from '../grammar/compile.js';
import { compare, init_table, KernelStateIterator, run, token_production } from '../runtime/kernel_new.js';
import { ParserFramework } from '../runtime/parser_framework.js';
import { skRenderAsJavaScript } from '../skribble/skribble.js';
import { GrammarObject } from '../types/grammar_nodes';
import { getSymbolScannerFunctions, token_lu_bit_size } from '../utilities/code_generating.js';
import {
    BuildPack, createActiveTokenSK,
    extractAndReplaceTokenMapRefs, renderJavaScriptReduceFunctionLookupArray
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
        const grammar = await compileGrammarFromString(test_pack);

        resolved_build_pack = await createBuildPack(grammar);
    } else {
        resolved_build_pack = test_pack;
    }

    const { grammar, state_buffer, sym_map, states_map } = resolved_build_pack;

    const token_sequence_lookup = new Uint8Array(grammar.sequence_string.split("").map(s => s.charCodeAt(0)));

    const entry_pointers = grammar.productions.filter(p => p.IS_ENTRY).map(p => ({ name: p.name, pointer: states_map.get(p.name).pointer }));

    const reverse_state_lookup = new Map([...states_map.entries()].map(([key, val]) => [0xFFFF & val.pointer, val.string]));
    //Attempt to parse input

    const token_lookup_functions = extractAndReplaceTokenMapRefs(getSymbolScannerFunctions(grammar)
        .map(skRenderAsJavaScript)
        .join("\n\n"), sym_map);

    const token_lookup_array = new ({
        8: Uint8Array,
        16: Uint8Array,
        32: Uint32Array
    }[token_lu_bit_size])([...sym_map.keys()].flatMap(s => s.split("_")));

    const input_string = `${skRenderAsJavaScript(createActiveTokenSK(grammar))}
    ${token_lookup_functions}
    const functions = ${renderJavaScriptReduceFunctionLookupArray(grammar)};
     return { scan, functions };
    `.replace(/_A_([\w\_\d]+)_A_/g,
        (name, sub: string, ...args) => {
            const { pointer } = states_map.get(sub);
            return pointer + "";
        });
    let { scan: tk_scan, functions: fns } = (Function(
        "token_lookup",
        "token_sequence_lookup",
        "compare",
        "token_production",
        "states_buffer",
        input_string)

    )(
        token_lookup_array,
        token_sequence_lookup,
        compare,
        token_production,
        state_buffer
    );

    const { parse } = await ParserFramework<T, { null: 0; }, "null">(fns, undefined, {

        init_table: () => {
            const table = new Uint8Array(382976);
            init_table(table);
            return table;
        },
        create_iterator: (data: any) => {
            return new KernelStateIterator(data);
        },
        recognize: (string: string, entry_pointer: number) => {

            const input_buffer = new Uint8Array(string.split("").map(c => c.charCodeAt(0)));

            return run(
                state_buffer,
                input_buffer,
                input_buffer.length,
                entry_pointers[0].pointer,
                tk_scan,
                true
            );
        }
    });

    return { parse, rlu: reverse_state_lookup, grammar };
}

