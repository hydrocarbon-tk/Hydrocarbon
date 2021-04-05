/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import spark from "@candlefw/spark";
import URL from "@candlefw/url";
import fs from "fs";
import { renderSkribbleRecognizer } from "../render/skribble_recognizer_template.js";
import { fillByteBufferWithUTF8FromString } from "../runtime/parser_loader.js";
import { initializeUTFLookupTable } from "../runtime/parser_memory_new.js";
import { skRenderAsJavaScript } from "../skribble/skribble.js";
import { HybridCompilerOptions } from "../types/compiler_options";
import { Grammar } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { ParserEnvironment } from "../types/parser_environment.js";
import { constructCompilerRunner, Helper } from "./helper.js";
import { WorkerRunner } from "./workers/worker_runner.js";




const AS = null, JS = null, SC = null;
const
    fsp = fs.promises,
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
    },
    action32bit_array_byte_size = 0,
    error8bit_array_byte_size = 10 * 4098 * 4,
    AsyncFunction: FunctionConstructor = <any>(async function () { }).constructor;

async function createWebAssemblyRecognizer(code: SC, options: HybridCompilerOptions): Promise<Uint8Array> {
    /*
    await asc.ready;
    
    const
        AssemblyScript = `
    type BooleanTokenCheck = (l:Lexer)=>boolean;
    type TokenCheck = (l:Lexer)=>boolean;
    ${Object.assign(new AS, code).renderCode()}
    export {main};`,
        { binary, text, stdout, stderr }
            = asc.compileString(AssemblyScript, {
                runtime: "full",
                optimize: options.optimize,
                converge: false,
                optimizeLevel: 3,
                noExportMemory: false,
                sharedMemory: false,
                maximumMemory: 100,
                importMemory: true,
                memoryBase:
                    action32bit_array_byte_size
                    + error8bit_array_byte_size
                    + jump16bit_table_byte_size
            });

    const
        errors = stderr.toString(),
        messages = stdout.toString();

    if (errors.length > 0) throw new EvalError(errors);
    if (messages.length > 0) console.log(messages);

    return binary;
    */
}

async function createRustRecognizer() {

}

function createJSRecognizer(code: SC): string {
    return `(()=>{
        ${Object.assign(new JS, code).renderCode()}
        return {
            recognizer,
            init_data,
            init_table,
            delete_data,
            get_fork_information,
            get_next_command_block
        };
    })`;
}

function createTSRecognizer(code: SC): string {
    return `(()=>{

        ${Object.assign(new AS, code).renderCode()}

        return {
            recognizer,
            init_data,
            init_table,
            delete_data,
            get_fork_information,
            get_next_command_block
        };
    })`;
}

export async function compile(grammar: Grammar, env: GrammarParserEnvironment, options: HybridCompilerOptions):
    Promise<void | ((str: string, env: ParserEnvironment) => any)> {

    const
        active_options: HybridCompilerOptions = Object.assign({}, default_options, options),
        runner: Helper = constructCompilerRunner(active_options.add_annotations, active_options.debug),
        mt_code_compiler = new WorkerRunner(grammar, env, runner, active_options.number_of_workers);

    active_options.combine_recognizer_and_completer = Boolean(active_options.no_file_output || active_options.combine_recognizer_and_completer);

    for (const updates of mt_code_compiler.run()) {
        await spark.sleep(1);
    }

    const
        recognizer_code = renderSkribbleRecognizer(
            grammar,
            runner,
            mt_code_compiler.functions
        ),
        output_dir = URL.resolveRelative(options.output_dir);

    if (!active_options.no_file_output) try {
        //Ensure output directories exist
        await fsp.mkdir(output_dir + "", { recursive: true });
    } catch (e) {
        throw e;
    }
    /*
    const

        wasm_recognizer = ["wasm", "WebAssembly"].includes(active_options.recognizer_type.toLocaleLowerCase())
            ? await createWebAssemblyRecognizer(recognizer_code, active_options)
            : undefined,
        javascript_recognizer = ["js", "JavaScript"].includes(active_options.recognizer_type.toLocaleLowerCase())

            ? createJSRecognizer(recognizer_code, active_options)
            : undefined;
    */

    switch ((active_options.completer_type + "" || "").toLowerCase()) {
        case "js":
        case "javascript":
        case "typescript":
        case "ts":
            {

                const { const: constants_a, fn: const_functions_a } = runner.render_constants();

                recognizer_code.statements.push(...constants_a, ...const_functions_a);

                for (const { entry, goto, reduce } of mt_code_compiler.functions)
                    recognizer_code.statements.push(...[entry, goto, reduce].filter(i => i));

                const str = skRenderAsJavaScript(recognizer_code);

                console.log(str);

                const fn = new Function(str + "\n return {sequence_lookup, lookup_table, run, dispatch, init_data, recognizer}")();

                const { dispatch, lookup_table, run, sequence_lookup, init_data, recognizer } = fn;

                initializeUTFLookupTable(lookup_table);

                const data = init_data(500, 500, 512);

                const { input, rules, debug, error } = data;

                const byte_length = fillByteBufferWithUTF8FromString("test", input, 500);

                const result = recognizer(data, byte_length, 0);

                result;



            }
    }
}
