import { Grammar } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { HybridMultiThreadRunner } from "./hybrid_mt_runner.js";
import fs from "fs";
import spark from "@candlefw/spark";
import URL from "@candlefw/url";
import { printJumpTable } from "./assemblyscript/hybrid_lexer.js";
import asc from "assemblyscript/cli/asc.js";
const fsp = fs.promises;

export async function compileHybrid(grammar: Grammar, env: GrammarParserEnvironment) {

    const mt_runner = new HybridMultiThreadRunner(grammar, env, true);

    for (const updates of mt_runner.run())
        await spark.sleep(1);

    await asc.ready;

    console.log("Compiling AssemblyScript code into WASM");

    const { binary, text, stdout, stderr } = asc.compileString(mt_runner.parser, { optimize: 0, maximumMemory: 512 });
    const messages = stdout.toString();
    const errors = stderr.toString();
    const completer = URL.resolveRelative("./temp/build/recognizer.wasm");
    const completer_wat = URL.resolveRelative("./temp/build/recognizer.wat");
    const temp_source = URL.resolveRelative("./temp/source/");
    const rust_file = URL.resolveRelative("./temp/source/parser.ts");
    const module_file = URL.resolveRelative("./temp/parser.js");
    const jump_table_file = URL.resolveRelative("./temp/jump_table.js");
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

