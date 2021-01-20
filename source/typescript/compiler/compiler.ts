import spark from "@candlefw/spark";
import URL from "@candlefw/url";
import Lexer from "@candlefw/wind";
import asc from "assemblyscript/cli/asc";
import fs from "fs";

import { renderParserScript } from "../render/js_parser_template.js";
import { renderParserScript as renderJSScript } from "../render/js_parser_template_for_js.js";
import { renderAssemblyScriptRecognizer } from "../render/recognizer_template.js";

import { action32bit_array_byte_size_default, buildParserMemoryBuffer, jump16bit_table_byte_size, loadWASM } from "../runtime/parser_memory.js";

import { HybridCompilerOptions } from "../types/compiler_options";
import { Grammar } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { ParserEnvironment } from "../types/parser_environment.js";

import { AS, CPP, JS } from "../utilities/skribble.js";
import { constructCompilerRunner, Helper } from "./helper.js";
import { WorkerRunner } from "./workers/worker_runner.js";


const fsp = fs.promises;

const default_options: HybridCompilerOptions = {
    type: "js",
    number_of_workers: 2,
    add_annotations: false,
    action_array_byte_size: 1024,
    error_array_byte_size: 512,
    memory_loader_url: "@candlefw/hydrocarbon",
    alternate_parse_entries: [],
    completer_output_dir: "./parser",
    recognizer_output_dir: "./wasm",
    combine_recognizer_and_completer: false,
    no_file_output: false,
    optimize: true,
    create_function: false,
    debug: false,
};

const AsyncFunction: FunctionConstructor = <any>(async function () { }).constructor;

export async function compile(grammar: Grammar, env: GrammarParserEnvironment, options: HybridCompilerOptions):
    Promise<void | ((str: string, env: ParserEnvironment) => any)> {

    await asc.ready;

    const
        active_options: HybridCompilerOptions = Object.assign({}, default_options, options),
        runner: Helper = constructCompilerRunner(active_options.add_annotations, active_options.debug),
        mt_code_compiler = new WorkerRunner(grammar, env, runner, active_options.number_of_workers),
        action32bit_array_byte_size = action32bit_array_byte_size_default,
        error8bit_array_byte_size = 10 * 4098 * 4;

    active_options.combine_recognizer_and_completer = Boolean(active_options.no_file_output || active_options.combine_recognizer_and_completer);

    for (const updates of mt_code_compiler.run()) {
        // console.dir({ updates });
        await spark.sleep(1);
    }

    const rc = renderAssemblyScriptRecognizer(grammar, runner, mt_code_compiler.functions, action32bit_array_byte_size, error8bit_array_byte_size),

        recognizer_dir = URL.resolveRelative(options.recognizer_output_dir),
        completer_dir = URL.resolveRelative(options.completer_output_dir),
        recognizer_wat_file = URL.resolveRelative("./recognizer.wat", recognizer_dir),
        recognizer_binary_file = URL.resolveRelative("./recognizer.wasm", recognizer_dir),
        recognizer_ts_file = URL.resolveRelative("./recognizer.ts", completer_dir),
        recognizer_js_file = URL.resolveRelative("./recognizer.js", completer_dir),
        recognizer_cpp_file = URL.resolveRelative("./recognizer.h", completer_dir),
        recognizer_rust_file = URL.resolveRelative("./recognizer.rs", completer_dir),
        recognizer_go_file = URL.resolveRelative("./recognizer.go", completer_dir),
        parser_file = URL.resolveRelative("./parser.js", completer_dir);


    if (!active_options.no_file_output) try {
        //Insure output directories exist
        await fsp.mkdir(recognizer_dir + "", { recursive: true });
        await fsp.mkdir(completer_dir + "", { recursive: true });
    } catch (e) {
        throw e;
    }

    switch ((active_options.type + "" || "").toLowerCase()) {

        case "wasm":
        case "webassembly":

            const
                recognizer_script_ts = `
        type BooleanTokenCheck = (l:Lexer)=>boolean;
        type TokenCheck = (l:Lexer)=>boolean;
        ${Object.assign(new AS, rc).renderCode()}
        export {main};`,
                { binary, text, stdout, stderr } = asc.compileString(recognizer_script_ts, {
                    runtime: "full",
                    optimize: active_options.optimize,
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
                }),
                errors = stderr.toString(),
                messages = stdout.toString();

            if (errors.length > 0) throw new EvalError(errors);
            if (messages.length > 0) console.log(messages);

            const parser_script = renderParserScript(grammar, active_options, binary);

            if (!active_options.no_file_output) {
                try {
                    if (!active_options.combine_recognizer_and_completer) {
                        await fsp.writeFile(recognizer_binary_file + "", binary);
                        await fsp.writeFile(recognizer_wat_file + "", text);
                    }

                    await fsp.writeFile(parser_file + "", parser_script);

                } catch (e) {
                    throw e;
                }
            }

            if (active_options.no_file_output || active_options.create_function)

                return (new Function(
                    "buildParserMemoryBuffer",
                    "Lexer",
                    "loadWASM",
                    `${renderParserScript(grammar, active_options, binary, true)}`
                ))(
                    buildParserMemoryBuffer,
                    Lexer,
                    loadWASM
                );
            return;
        case "js":
        case "javascript":
        default: {

            const recognizer_script_js = `
    ((store_data, debug_stack)=>{
        const data_view = new DataView(store_data);
        function load(offset){
            return data_view.getUint16(offset, true);
        };
        function store(offset, val){
            data_view.setUint32(offset, val, true);
        };
        ${Object.assign(new JS, rc).renderCode()}
        return main;
    }) `;


            if (!active_options.no_file_output) {
                const parser_script =
                    renderJSScript(
                        grammar,
                        active_options,
                        recognizer_script_js,
                        false,
                        action32bit_array_byte_size,
                        error8bit_array_byte_size
                    );
                try {

                    const recognizer_file = URL.resolveRelative("./recognizer.js", recognizer_dir);

                    if (!active_options.combine_recognizer_and_completer) {
                        await fsp.writeFile(recognizer_file + "", recognizer_script_js);
                    }

                    await fsp.writeFile(parser_file + "", parser_script);

                } catch (e) {
                    throw e;
                }
            }
            if (active_options.no_file_output || active_options.create_function) {
                const parser_script =
                    renderJSScript(
                        grammar,
                        active_options,
                        recognizer_script_js,
                        true,
                        action32bit_array_byte_size,
                        error8bit_array_byte_size
                    );
                return await (new AsyncFunction(
                    "buildParserMemoryBuffer",
                    "URL",
                    "Lexer",
                    parser_script
                ))(
                    buildParserMemoryBuffer,
                    URL,
                    Lexer
                );
            }
            return;
        }
    }

    return;
}

