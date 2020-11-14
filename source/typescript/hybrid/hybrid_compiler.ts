import { Grammar } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { HybridMultiThreadRunner } from "./hybrid_mt_runner.js";
import fs from "fs";
import spark from "@candlefw/spark";
import URL from "@candlefw/url";
import { printJumpTable } from "./assemblyscript/hybrid_lexer.js";
import asc from "assemblyscript/cli/asc";
const fsp = fs.promises;


interface CompiledHybridOptions {
    action_array_byte_size: number,
    error_array_byte_size: number,
    add_annotations: boolean;
}

export async function compileHybrid(grammar: Grammar, env: GrammarParserEnvironment) {


    const mt_runner = new HybridMultiThreadRunner(grammar, env, true);

    for (const updates of mt_runner.run())
        await spark.sleep(1);

    await asc.ready;

    console.log("Compiling AssemblyScript code into WASM");

    const { binary, text, stdout, stderr } = asc.compileString(mt_runner.parser, {
        optimize: 3,
        maximumMemory: 100,
        importMemory: true,
        memoryBase: 4579328,
        noExportMemory: false
    });

    const messages = stdout.toString();
    const errors = stderr.toString();
    const root_dir = URL.resolveRelative("./temp/");
    const completer_wat = URL.resolveRelative("./build/recognizer.wat", root_dir);
    const rust_file = URL.resolveRelative("./source/parser.ts", root_dir);
    const completer = URL.resolveRelative("./recognizer.wasm", root_dir);
    const temp_source = URL.resolveRelative("./source/", root_dir);
    const module_file = URL.resolveRelative("./parser.js", root_dir);
    const jump_table_file = URL.resolveRelative("./hc_parser_buffers.js", root_dir);
    try {

        //Create the temp directory
        await fsp.writeFile(rust_file + "", mt_runner.parser);
        await fsp.writeFile(module_file + "", mt_runner.js_resolver);
        await fsp.writeFile(jump_table_file + "", printJumpTable());
        await fsp.writeFile(completer + "", binary);
        await fsp.writeFile(completer_wat + "", text);
        await fsp.mkdir(temp_source + "", { recursive: true });

        //run the wasm-pack locally
        console.log("Completed WASM Compilation");
    } catch (e) {
        console.log(e);
    }

    return () => { };
}

