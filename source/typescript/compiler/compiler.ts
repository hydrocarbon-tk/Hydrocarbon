/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import spark from "@candlefw/spark";
import fs from "fs";
import { createDispatchTemplate, renderSkribbleRecognizer } from "../render/skribble_recognizer_template.js";
import { fillByteBufferWithUTF8FromString } from "../runtime/parser_loader.js";
import { initializeUTFLookupTableNew } from "../runtime/parser_memory_new.js";
import { skRenderAsJavaScript } from "../skribble/skribble.js";
import { HybridCompilerOptions } from "../types/compiler_options";
import { Grammar } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { ParserEnvironment } from "../types/parser_environment.js";
import { RDProductionFunction } from "../types/rd_production_function.js";
import { constructCompilerRunner, Helper } from "./helper.js";
import { WorkerRunner } from "./workers/worker_runner.js";

const
    default_options: HybridCompilerOptions = {
        name: "parser",
        recognizer_type: "js",
        completer_type: "js",
        number_of_workers: 1,
        add_annotations: false,
        action_array_byte_size: 1024,
        error_array_byte_size: 512,
        alternate_parse_entries: [],
        output_dir: "./",
        combine_recognizer_and_completer: false,
        memory_loader_url: "@candlefw/hydrocarbon",
        no_file_output: false,
        optimize: true,
        create_function: false,
        debug: false,
    };

export async function compile(grammar: Grammar, env: GrammarParserEnvironment, options: HybridCompilerOptions):
    Promise<{
        grammar_functions: RDProductionFunction[],
        runner: Helper;
    }> {

    const
        active_options: HybridCompilerOptions = Object.assign({}, default_options, options),
        runner: Helper = constructCompilerRunner(active_options.add_annotations, active_options.debug),
        mt_code_compiler = new WorkerRunner(grammar, env, runner, active_options.number_of_workers);

    active_options.combine_recognizer_and_completer = Boolean(active_options.no_file_output || active_options.combine_recognizer_and_completer);

    for (const updates of mt_code_compiler.run())
        await spark.sleep(1);

    return {
        grammar_functions: mt_code_compiler.functions,
        runner
    };
}

function compileRecognizerSource(runner: Helper, grammar: Grammar, recognizer_functions: RDProductionFunction[]) {
    const { const: constants_a, fn: const_functions_a } = runner.render_constants();

    const recognizer_code = renderSkribbleRecognizer(grammar);

    recognizer_code.statements.push(...constants_a, ...const_functions_a);

    for (const { entry, goto, reduce } of recognizer_functions)
        recognizer_code.statements.push(...[entry, goto, reduce].filter(i => i));

    recognizer_code.statements.push(...createDispatchTemplate(grammar, runner, recognizer_functions).statements);

    return recognizer_code;
}

export function renderRecognizerAsJavasScript(
    grammar: Grammar,
    recognizer_functions: RDProductionFunction[],
    runner: Helper
) {

    const recognizer_code = compileRecognizerSource(runner, grammar, recognizer_functions);

    return skRenderAsJavaScript(recognizer_code);
};



function renderJavaScriptReduceFunctionLookup(grammar: Grammar) {
    const reduce_functions_str = [...grammar.meta.reduce_functions.keys()].map((b, i) => {
        if (b.includes("return")) {
            return b.replace("return", "(env, sym, pos)=>(").slice(0, -1) + ")" + `/*${i}*/`;
        } else {
            return `(env, sym)=>new (class{constructor(env, sym, pos){${b}}})(env, sym)` + `/*${i}*/`;
        }
    }).join("\n,");

    return `return [(e,sym)=>sym[sym.length-1], ${reduce_functions_str}]`;
}

export function hadHocParse(
    grammar: Grammar,
    recognizer_functions: RDProductionFunction[],
    runner: Helper,
    input_string: string,
    env: ParserEnvironment = {}
) {
    const str = renderRecognizerAsJavasScript(
        grammar,
        recognizer_functions,
        runner
    );

    const fn = new Function(str + "\n return {get_next_command_block, sequence_lookup, lookup_table, run, dispatch, init_data, recognizer,get_fork_information}")();

    const reduce_function_str = renderJavaScriptReduceFunctionLookup(grammar);

    const reduce_functions = new Function(reduce_function_str)();

    const {
        dispatch,
        lookup_table,
        run,
        sequence_lookup,
        init_data,
        recognizer,
        get_fork_information,
        get_next_command_block
    } = fn;

    // Post 

    //----------------------------------------------------------------------------
    // Static Initialization

    initializeUTFLookupTableNew(lookup_table);

    let i = 0;

    for (const code_point of grammar.sequence_string.split("").map(s => s.charCodeAt(0)))
        sequence_lookup[i++] = code_point;

    //----------------------------------------------------------------------------
    // Dynamic Initialization

    const input_size = input_string.length * 4;

    const data = init_data(input_size, input_size, 512);

    const { input, rules, debug, error } = data;

    const byte_length = fillByteBufferWithUTF8FromString(input_string, input, input_size);

    //----------------------------------------------------------------------------
    // Recognizer Pass

    const result = recognizer(data, byte_length, 0);

    //----------------------------------------------------------------------------
    // Recognizer Directed Parsing

    const
        forks = get_fork_information(),
        fns = reduce_functions,
        stack = [];

    if (forks.length == 1) {
        //Normal parse
        const fork = forks[0];
        let limit = 1000000;
        let block = get_next_command_block(fork);
        let short_offset = 0;
        let token_offset = 0;
        let pos = [];
        let high = block[short_offset++];

        if (short_offset > 63) {
            get_next_command_block(fork);
            short_offset = 0;
        }

        while (limit-- > 0) {

            let low = high;

            if (low == 0) break;

            high = block[short_offset++];

            const rule = low & 3;

            switch (rule) {
                case 0: //REDUCE;
                    {
                        let
                            body = (low >> 8) & 0xFF,
                            len = ((low >> 3) & 0x1F);

                        if (low & 4) {
                            body = (body << 8) | len;
                            len = high;
                            short_offset++;
                        }

                        const pos_a = pos[pos.length - len] || { off: 0, tl: 0 };
                        const pos_b = pos[pos.length - 1] || { off: 0, tl: 0 };
                        const e = stack.slice(-len);

                        pos[stack.length - len] = { off: pos_a.off, tl: pos_b.off - pos_a.off + pos_b.tl };
                        stack[stack.length - len] = fns[body](env, e, { off: pos_a.off, tl: pos_b.off - pos_a.off + pos_b.tl });

                        stack.length = stack.length - len + 1;
                        pos.length = pos.length - len + 1;


                    } break;

                case 1: { //SHIFT;
                    let length = (low >>> 3) & 0x1FFF;

                    if (low & 4) {
                        length = ((length << 16) | high);
                        short_offset++;
                    }

                    stack.push(input_string.slice(token_offset, token_offset + length));
                    pos.push({ off: token_offset, tl: length });
                    token_offset += length;
                } break;

                case 2: { //SKIP

                    let length = (low >>> 3) & 0x1FFF;

                    if (low & 4) {
                        length = ((length << 16) | high);
                        short_offset++;
                    }

                    token_offset += length;
                }

                case 3: {
                    //Error
                }
            }


            if (short_offset > 63) {
                get_next_command_block(fork);
                short_offset = 0;
            }
        }
    }

    return stack;
};