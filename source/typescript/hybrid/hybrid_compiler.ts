import loader from "@assemblyscript/loader";
import spark from "@candlefw/spark";
import URL from "@candlefw/url";
import Lexer from "@candlefw/wind";
import asc from "assemblyscript/cli/asc";
import fs from "fs";

import { ParserEnvironment } from "../../../build/types/hydrocarbon.js";
import { Grammar } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { HybridCompilerOptions } from "./types/CompiledHybridOptions";
import { HybridMultiThreadRunner } from "./hybrid_mt_runner.js";
import { action32bit_array_byte_size_default, buildParserMemoryBuffer, jump16bit_table_byte_size } from "./parser_memory.js";
import { renderAssemblyScriptRecognizer } from "./script_generating/hybrid_recognizer_template.js";
import { renderParserScript } from "./script_generating/hybrid_js_parser_template.js";
import { renderParserScript as renderJSScript } from "./script_generating/hybrid_js_parser_template_for_js.js";
import { CompilerRunner, constructCompilerRunner } from "./types/CompilerRunner.js";
import { AS, CPP, JS } from "./utilities/skribble.js";
const fsp = fs.promises;

const default_options: HybridCompilerOptions = {
    type: "js",
    number_of_workers: 2,
    add_annotations: false,
    action_array_byte_size: 1024,
    error_array_byte_size: 512,
    memory_loader_url: "@candlefw/hydrocarbon",
    alternate_parse_entries: [],
    ts_output_dir: "./parser",
    wasm_output_dir: "./wasm",
    combine_wasm_with_js: false,
    no_file_output: false,
    optimize: true,
    create_function: false,
    debug: false,
};

const AsyncFunction: FunctionConstructor = <any>(async function () { }).constructor;

export async function compileHybrid(grammar: Grammar, env: GrammarParserEnvironment, options: HybridCompilerOptions):
    Promise<void | ((str: string, env: ParserEnvironment) => any)> {

    await asc.ready;

    const
        used_options: HybridCompilerOptions = Object.assign({}, default_options, options),
        runner: CompilerRunner = constructCompilerRunner(used_options.add_annotations, used_options.debug),
        mt_code_compiler = new HybridMultiThreadRunner(grammar, env, runner, used_options.number_of_workers),
        action32bit_array_byte_size = action32bit_array_byte_size_default,
        error8bit_array_byte_size = 10 * 4098 * 4; //  error8bit_array_byte_size_default;

    used_options.combine_wasm_with_js = Boolean(used_options.no_file_output || used_options.combine_wasm_with_js);

    for (const updates of mt_code_compiler.run()) {
        // console.dir({ updates });
        await spark.sleep(1);
    }

    const rc = renderAssemblyScriptRecognizer(grammar, runner, mt_code_compiler.functions, action32bit_array_byte_size, error8bit_array_byte_size),

        wasm_dir = URL.resolveRelative(options.wasm_output_dir),
        ts_dir = URL.resolveRelative(options.ts_output_dir),
        recognizer_wat_file = URL.resolveRelative("./recognizer.wat", wasm_dir),
        recognizer_binary_file = URL.resolveRelative("./recognizer.wasm", wasm_dir),
        recognizer_ts_file = URL.resolveRelative("./recognizer.ts", ts_dir),
        recognizer_js_file = URL.resolveRelative("./recognizer.js", ts_dir),
        recognizer_cpp_file = URL.resolveRelative("./recognizer.h", ts_dir),
        recognizer_rust_file = URL.resolveRelative("./recognizer.rs", ts_dir),
        recognizer_go_file = URL.resolveRelative("./recognizer.rs", ts_dir),
        parser_file = URL.resolveRelative("./parser.js", ts_dir),
        recognizer_script_ts = `
        type BooleanTokenCheck = (l:Lexer)=>boolean;
        type TokenCheck = (l:Lexer)=>boolean;
        ${Object.assign(new AS, rc).renderCode()}
        export {main};`,
        recognizer_script_js = `
        ((store_data)=>{
            const data_view = new DataView(store_data);
            function load(offset){
                return data_view.getUint16(offset, true);
            };
            function store(offset, val){
                data_view.setUint32(offset, val, true);
            };
            ${Object.assign(new JS, rc).renderCode()}
            return main;
        })
        `,
        recognizer_script_cpp = `
        ${Object.assign(new CPP, rc).renderCode()}
        `;

    if (!used_options.no_file_output) try {
        //Insure output directories exist

        await fsp.mkdir(wasm_dir + "", { recursive: true });
        await fsp.mkdir(ts_dir + "", { recursive: true });

        // Output recognizer file for review before attempting to compile
        // to binary
        await fsp.writeFile(recognizer_ts_file + "", recognizer_script_ts);
        await fsp.writeFile(recognizer_js_file + "", recognizer_script_js);
        await fsp.writeFile(recognizer_cpp_file + "", recognizer_script_cpp);
    } catch (e) {
        throw e;
    }

    if (!used_options.no_file_output) {
        const
            { binary, text, stdout, stderr } = asc.compileString(recognizer_script_ts, {
                runtime: "full",
                optimize: used_options.optimize,
                converge: false,
                optimizeLevel: 3,
                noExportMemory: false,
                sharedMemory: false,
                maximumMemory: 100,
                importMemory: true,
                memoryBase: action32bit_array_byte_size + error8bit_array_byte_size + jump16bit_table_byte_size
            }),
            errors = stderr.toString(),
            messages = stdout.toString();

        if (errors.length > 0) throw new EvalError(errors);
        if (messages.length > 0) console.log(messages);

        const parser_script = renderParserScript(grammar, used_options, binary);

        try {
            if (!used_options.combine_wasm_with_js) {
                await fsp.writeFile(recognizer_binary_file + "", binary);
                await fsp.writeFile(recognizer_wat_file + "", text);

            }

            await fsp.writeFile(parser_file + "", parser_script);

        } catch (e) {
            throw e;
        }

        if (used_options.no_file_output || used_options.create_function)


            return await (new AsyncFunction(
                "loader",
                "buildParserMemoryBuffer",
                "URL",
                "Lexer",
                `${renderParserScript(grammar, used_options, binary, true)}`
            ))(
                loader,
                buildParserMemoryBuffer,
                URL,
                Lexer
            );

        return;

    }

    if (used_options.no_file_output || used_options.create_function) {
        const script = `${renderJSScript(grammar, used_options, recognizer_script_js, true, action32bit_array_byte_size,
            error8bit_array_byte_size)}`;

        await fsp.writeFile(recognizer_js_file + "", script);
        await fsp.writeFile(recognizer_ts_file + "", recognizer_script_ts);
        //    / return script;
        return await (new AsyncFunction(
            "loader",
            "buildParserMemoryBuffer",
            "URL",
            "Lexer",
            script
        ))(
            loader,
            buildParserMemoryBuffer,
            URL,
            Lexer
        );
    }
    return;
}

