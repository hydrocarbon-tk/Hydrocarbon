#!/usr/bin/env node
/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    addCLIConfig, processCLIConfig
} from "@candlelib/paraffin";
import URL from "@candlelib/uri";
import { compileRecognizer, writeParserScriptFile } from "../build/compiler.js";
import { compileGrammarFromURI } from "../grammar/compile.js";

await URL.server();

const out_dir = addCLIConfig("compile", {
    key: "output_directory",
    REQUIRES_VALUE: true,
    help_brief: "Directory to write compiled parser files. Defaults to CWD",
});

const type = addCLIConfig("compile", {
    key: "type",
    REQUIRES_VALUE: true,
    help_brief:
        `
Language in which to render the output parser
May be one of: 
    wasm 
    c++  
    js | javascript  
    ts | typescripts 
    as | assemblyscript`,
});

const number_of_workers = addCLIConfig("compile", {
    key: "threads",
    REQUIRES_VALUE: true,
    help_brief: `Number of worker threads to use during compilation. Defaults to 1`,
});

addCLIConfig("compile", {
    key: "compile",
    help_brief: `
    Usage: compile <path_to_source_grammar>`
}).callback = (async (args) => {

    const path = args.trailing_arguments.pop();
    const file_path = URL.resolveRelative(path);
    const output = URL.resolveRelative(out_dir.value || "./");


    if (file_path.ext !== "hcg")
        throw new Error("Expected source file to be a hydrocarbon grammar file (.hcg)");

    if (!output.filename)
        output.path = output.path + "/" + file_path.filename + ".js";

    const threads = parseInt(number_of_workers.value ?? "1");

    const grammar = await compileGrammarFromURI(file_path);

    const { meta, recognizer_functions } = await compileRecognizer(grammar, threads);

    switch (type.value) {
        default:
            await writeParserScriptFile(output + "", grammar, recognizer_functions, meta);

    }
});

processCLIConfig();