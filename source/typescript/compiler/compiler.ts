import spark from "@candlefw/spark";
import URL from "@candlefw/url";
import Lexer from "@candlefw/wind";
import asc, { CompilerOptions } from "assemblyscript/cli/asc";
import fs from "fs";

import { renderParserScript } from "../render/js_parser_template_for_js.js";
import { renderAssemblyScriptRecognizer } from "../render/recognizer_template.js";

import { action32bit_array_byte_size_default, buildParserMemoryBuffer, jump16bit_table_byte_size, loadWASM } from "../runtime/parser_memory.js";

import { HybridCompilerOptions } from "../types/compiler_options";
import { Grammar } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { ParserEnvironment } from "../types/parser_environment.js";

import { AS, JS, SC } from "../utilities/skribble.js";
import { constructCompilerRunner, Helper } from "./helper.js";
import { WorkerRunner } from "./workers/worker_runner.js";


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
    action32bit_array_byte_size = action32bit_array_byte_size_default,
    error8bit_array_byte_size = 10 * 4098 * 4,
    AsyncFunction: FunctionConstructor = <any>(async function () { }).constructor;

async function createWebAssemblyRecognizer(code: SC, options: CompilerOptions): Promise<Uint8Array> {

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
}

function createJSRecognizer(code: SC, options: CompilerOptions): string {
    return `
    ((store_data, debug_stack)=>{
        const data_view = new DataView(store_data);
        function load(offset){
            return data_view.getUint16(offset, true);
        };
        function store(offset, val){
            data_view.setUint32(offset, val, true);
        };
        ${Object.assign(new JS, code).renderCode()}
        return main;
    }) `;
}

function createTSRecognizer() {

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

    const recognizer_code = renderAssemblyScriptRecognizer(grammar, runner, mt_code_compiler.functions, action32bit_array_byte_size, error8bit_array_byte_size),
        output_dir = URL.resolveRelative(options.output_dir);

    if (!active_options.no_file_output) try {
        //Insure output directories exist
        await fsp.mkdir(output_dir + "", { recursive: true });
    } catch (e) {
        throw e;
    }

    const

        wasm_recognizer = ["wasm", "WebAssembly"].includes(active_options.recognizer_type.toLocaleLowerCase())
            ? await createWebAssemblyRecognizer(recognizer_code, active_options)
            : undefined,

        javascript_recognizer = ["js", "JavaScript"].includes(active_options.recognizer_type.toLocaleLowerCase())
            ? createJSRecognizer(recognizer_code, active_options)
            : undefined;

    switch ((active_options.completer_type + "" || "").toLowerCase()) {
        case "js":
        case "javascript":
        case "typescript":
        case "ts":

            if (!active_options.no_file_output) {
                const parser_script =
                    renderParserScript(
                        grammar,
                        active_options,
                        wasm_recognizer,
                        javascript_recognizer,
                        false,
                        action32bit_array_byte_size,
                        error8bit_array_byte_size
                    );
                try {
                    await fsp.writeFile(URL.resolveRelative(`./${options.name || "parser"}.js`, output_dir) + "", parser_script);
                } catch (e) {
                    throw e;
                }
            }

            if (active_options.no_file_output || active_options.create_function) {
                const parser_script =
                    renderParserScript(
                        grammar,
                        active_options,
                        wasm_recognizer,
                        javascript_recognizer,
                        true,
                        action32bit_array_byte_size,
                        error8bit_array_byte_size
                    );
                return await (new AsyncFunction(
                    "buildParserMemoryBuffer",
                    "Lexer",
                    "loadWASM",
                    parser_script
                ))(
                    buildParserMemoryBuffer,
                    Lexer,
                    loadWASM
                );
            }
            return;
    }
}
