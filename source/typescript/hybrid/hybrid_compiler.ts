import { Grammar } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { HybridMultiThreadRunner } from "./hybrid_mt_runner.js";
import fs from "fs";
import spark from "@candlefw/spark";
import URL from "@candlefw/url";
import asc from "assemblyscript/cli/asc";
import { renderAssemblyScriptRecognizer } from "./script_generating/hybrid_assemblyscript_recognizer_template.js";
import { renderParserScript } from "./script_generating/hybrid_js_parser_template.js";
const fsp = fs.promises;


interface CompiledHybridOptions {
    action_array_byte_size: number,
    error_array_byte_size: number,
    add_annotations: boolean;
    output_dir: string;

    /**
     * Allows alternate parse of sub-productions
     */
    alternate_parse_entries: boolean;
}

export async function compileHybrid(grammar: Grammar, env: GrammarParserEnvironment) {

    await asc.ready;

    const mt_runner = new HybridMultiThreadRunner(grammar, env, true);

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
        optimizeLevel: 3,
        noExportMemory: false,
        sharedMemory: false,
        maximumMemory: 100,
        importMemory: true,
        memoryBase: 4579328
    });

    const errors = stderr.toString();
    const messages = stdout.toString();

    if (errors.length > 0) {
        throw new EvalError(errors);
    }
    if (messages.length > 0) {
        console.log(messages);
    }

    const root_dir = URL.resolveRelative("./temp/");
    const recognizer_wat_file = URL.resolveRelative("./recognizer.wat", root_dir);
    const recognizer_binary_file = URL.resolveRelative("./recognizer.wasm", root_dir);
    const recognizer_ts_file = URL.resolveRelative("./recognizer.ts", root_dir);
    const parser_file = URL.resolveRelative("./parser.js", root_dir);

    try {

        //Create the temp directory
        await fsp.writeFile(recognizer_ts_file + "", recognizer_script);
        await fsp.writeFile(recognizer_binary_file + "", binary);
        await fsp.writeFile(recognizer_wat_file + "", text);
        await fsp.writeFile(parser_file + "", parser_script);

        //run the wasm-pack locally
        console.log("Completed WASM Compilation");
    } catch (e) {
        console.log(e);
    }

    return () => { };
}

