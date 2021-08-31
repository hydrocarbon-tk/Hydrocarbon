import {
    createActiveTokenSK,
    extractAndReplaceTokenMapRefs,
    renderJavaScriptReduceFunctionLookupArray
} from '../render/render.js';
import { compare } from '../runtime/core_parser.js';
import { KernelStateIterator, run, token_production } from '../runtime/kernel.js';
import { init_table } from '../runtime/lexer.js';
import { ParserFrameWork } from '../runtime/parser_framework.js';
import { skRenderAsJavaScript } from '../skribble/skribble.js';
import { GrammarObject } from "../types/grammar_nodes";
import { StateMap } from "../types/ir_state_data";
import { getSymbolScannerFunctions, token_lu_bit_size } from '../utilities/code_generating.js';

export async function compileRecognizerConstructs(
    grammar: GrammarObject,
    state_buffer: Uint32Array,
    sym_map: Map<string, number>,
    states_map: StateMap,
) {
    const token_sequence_lookup = new Uint8Array(grammar.sequence_string.split("").map(s => s.charCodeAt(0)));
    const entry_pointers = grammar.productions.filter(p => p.IS_ENTRY).map(p => ({ name: p.name, pointer: states_map.get(p.name).pointer }));
    const reverse_state_lookup = new Map([...states_map.entries()].map(([key, val]) => [val.pointer, val.string]));
    //Attempt to parse input
    const token_lookup_functions = extractAndReplaceTokenMapRefs(getSymbolScannerFunctions(grammar)
        .map(skRenderAsJavaScript)
        .join("\n\n"), sym_map);
    const token_lookup_array = new ({ 8: Uint8Array, 16: Uint8Array, 32: Uint32Array }[token_lu_bit_size])([...sym_map.keys()].flatMap(s => s.split("_")));

    let { scan: tk_scan, functions: fns } = (Function(
        "token_lookup",
        "token_sequence_lookup",
        "compare",
        "token_production",
        "state_buffer",

        `${skRenderAsJavaScript(createActiveTokenSK(grammar))}
        const functions = ${renderJavaScriptReduceFunctionLookupArray(grammar)};
         ${token_lookup_functions}
         return { scan, functions };
        `.replace(/_A_([\w\_\d]+)_A_/g,
            (name, sub: string, ...args) => {
                const { pointer } = states_map.get(sub);
                return pointer + "";
            }))
    )(
        token_lookup_array,
        token_sequence_lookup,
        compare,
        token_production,
        state_buffer
    );
    //Go through the build pass
    const input_string = "a b c r";


    const parse = await ParserFrameWork(fns, undefined, () => {
        return {
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
                    entry_pointer,
                    tk_scan,
                    reverse_state_lookup
                );
            }
        };
    });

    const result = parse(input_string, {}, [...entry_pointers.values()][0].pointer);

    console.log({ result });

}
