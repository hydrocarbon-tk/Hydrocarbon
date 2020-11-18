import { Grammar } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { HybridMultiThreadRunner } from "./hybrid_mt_runner.js";
import fs from "fs";
import spark from "@candlefw/spark";
import URL from "@candlefw/url";
import asc from "assemblyscript/cli/asc";
import { renderAssemblyScriptRecognizer } from "./script_generating/hybrid_assemblyscript_recognizer_template.js";
import { renderParserScript } from "./script_generating/hybrid_js_parser_template.js";
import { CompiledHybridOptions } from "./CompiledHybridOptions";
const fsp = fs.promises;


const default_options: CompiledHybridOptions = {
    add_annotations: false,
    action_array_byte_size: 1024,
    error_array_byte_size: 512,
    memory_loader_url: "@candlefw/hydrocarbon",
    alternate_parse_entries: [],
    ts_output_dir: "./parser",
    wasm_output_dir: "./wasm"
};

export async function compileHybrid(grammar: Grammar, env: GrammarParserEnvironment, options: CompiledHybridOptions) {

    const used_options: CompiledHybridOptions = Object.assign({}, default_options, options);

    await asc.ready;

    const mt_runner = new HybridMultiThreadRunner(grammar, env, used_options.add_annotations);

    for (const updates of mt_runner.run())
        await spark.sleep(1);

    //Build scripts 
    const
        recognizer_script = renderAssemblyScriptRecognizer(grammar, mt_runner.runner, mt_runner.rd_functions, mt_runner.completed_lr_states),
        parser_script = renderParserScript(grammar);

    console.log("Compiling AssemblyScript code into WASM");

    const { binary, text, stdout, stderr } = asc.compileString(recognizer_script, {
        runtime: "full",
        optimize: true,
        converge: true,
        optimizeLevel: 3,
        noExportMemory: false,
        sharedMemory: false,
        maximumMemory: 100,
        importMemory: true,
        memoryBase: 4579328
    }),

        errors = stderr.toString(),
        messages = stdout.toString(),

        wasm_dir = URL.resolveRelative(options.wasm_output_dir),
        ts_dir = URL.resolveRelative(options.ts_output_dir),
        recognizer_wat_file = URL.resolveRelative("./recognizer.wat", wasm_dir),
        recognizer_binary_file = URL.resolveRelative("./recognizer.wasm", wasm_dir),
        recognizer_ts_file = URL.resolveRelative("./recognizer.ts", ts_dir),
        parser_file = URL.resolveRelative("./parser.js", ts_dir);

    if (errors.length > 0)
        throw new EvalError(errors);

    if (messages.length > 0)
        console.log(messages);

    try {
        await fsp.mkdir(wasm_dir + "", { recursive: true });
        await fsp.mkdir(ts_dir + "", { recursive: true });

        //Create the temp directory
        await fsp.writeFile(recognizer_ts_file + "", recognizer_script);
        await fsp.writeFile(recognizer_binary_file + "", binary);
        await fsp.writeFile(recognizer_wat_file + "", text);
        await fsp.writeFile(parser_file + "", parser_script);

        //run the wasm-pack locally
        console.log("Completed WASM Compilation");
    } catch (e) {
        throw e;
    }
}

