/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { createBuildPack } from '../build/build.js';
import { compileGrammarFromString } from '../grammar/compile.js';
import { complete } from '../runtime/completer/complete.js';
import { instruction_pointer_mask } from '../runtime/kernel_next.js';
import { ASYTRIPContext } from '../types/asytrip.js';
import { BuildPack } from "../types/build_pack";
import { GrammarObject } from '../types/grammar_nodes';


/**
 * Constructs a JavaScript based parser from a grammar string or build pack.
 * @param build_pack
 * @returns
 */


export async function createAddHocParser<T = any>(
    build_pack: BuildPack | string | Promise<BuildPack | string>,
    asytrip_context?: ASYTRIPContext,
    js_context?: any

): Promise<{
    parse: (input: string, production_selector: number) => any,
    rlu,
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

    const { grammar, state_buffer, states_map } = resolved_build_pack;
    const entry_pointers = grammar.productions.filter(p => p.IS_ENTRY).map(p => ({ name: p.name, pointer: states_map.get(p.name).pointer }));
    const reverse_state_lookup = new Map([...states_map.entries()].map(([key, val]) => [instruction_pointer_mask & val.pointer, val.string]));
    //Attempt to parse input

    const input_string = `

    const rfn0 = (_,s)=>s[s.length-1];;

    ${[...js_context.reduce_functions.keys()].map((f, i) => `const rfn${i + 1}=${f};`).join("\n    ")}

    const functions = [${js_context.body_maps.map(b => `rfn${b}`)}];

     return { functions };
    `.replace(/_A_([\w\_\d]+)_A_/g,
        (name, sub: string, ...args) => {
            const { pointer } = states_map.get("tok_" + sub);
            return pointer + "";
        });

    let { functions: fns } = (Function(input_string))();

    console.log({
        pt: entry_pointers[0].pointer
    });

    return {
        parse: (string: string, entry_pointer: number) => {
            return complete(
                string,
                entry_pointers[0].pointer,
                state_buffer,
                fns
            );
        },
        rlu: reverse_state_lookup,
        grammar
    };
}