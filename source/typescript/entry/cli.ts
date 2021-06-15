#!/usr/bin/env node
/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    addCLIConfig, processCLIConfig
} from "@candlelib/paraffin";
import URI from "@candlelib/uri";
import URL from "@candlelib/uri";
import { buildRecognizer } from "../build/build.js";
import { compileGrammarFromURI } from "../grammar/compile.js";
import { createAddHocParser } from "../render/create_add_hoc_parser.js";
import { generateWebAssemblyParser, writeParserScriptFile } from "../render/render.js";

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
    Usage: compile <path_to_source_grammar>
    
    Compile new parser from an hydrocarbon grammar source file (.hcg)
`
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

    const { meta, recognizer_functions } = await buildRecognizer(grammar, threads);

    switch (type.value) {
        default:
            await writeParserScriptFile(output + "", grammar, recognizer_functions, meta);

    }
});


addCLIConfig("create-staged", {
    key: "create-staged",
    help_brief: `
    Usage: create-staged
    
    Create a new HCG parser and place in @candlelib/hydrocarbon/build/staged folder
`
}).callback = (async (args) => {
    const
        hcg_grammar_file = URI.resolveRelative("./source/grammars/hcg-3-alpha/hcg.hcg");

    const compiled_grammar = await compileGrammarFromURI(hcg_grammar_file);
    const bootstrapped_compiled_grammar = await compileGrammarFromURI(hcg_grammar_file);
    const {
        recognizer_functions: bootstrapped_recognizer_functions,
        meta: bootstrapped_meta,
    } = await buildRecognizer(bootstrapped_compiled_grammar, 1);

    let SUCCESS = await writeParserScriptFile(
        URI.resolveRelative("./build/staged/hcg3_parser.staged.ts") + "",
        bootstrapped_compiled_grammar, bootstrapped_recognizer_functions, bootstrapped_meta,
        "../runtime/parser_loader_next.js",
        generateWebAssemblyParser
    );
});

processCLIConfig();