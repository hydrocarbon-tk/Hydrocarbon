/**
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * Contact: acweathersby.codes@gmail.com
 */

import {
    addCLIConfig, processCLIConfig
} from "@candlelib/paraffin";
import { default as URI, default as URL } from "@candlelib/uri";
import { createBuildPack } from "../build/build.js";
import { compileGrammarFromURI } from "../grammar/compile.js";
import { createCompilableCode } from "../grammar/passes/process_compiled_code.js";
import { renderToJavaScript } from '../render/render.js';


await URL.server();

const cli_log = console.log;

async function CheckForSDK(args): Promise<boolean> {

    const cp = (await import("child_process")).default;

    let HAVE_VERSION = false;

    //Checking for emcc installation
    try {
        const emcc_version = cp.spawnSync("emcc", ["--version"], {}).stdout.toString("utf8");

        const version_number = emcc_version.match(/\d+\.\d+\.\d+/g)[0]?.split(".").map(s => parseInt(s));

        if (version_number[0] < 2)
            cli_log(`emcc version ${version_number.join(".")} too old`);
        else {
            cli_log("Found compatible version of EMSDK");
            HAVE_VERSION = true;
        }

    } catch (e) {
        //Check local install
        const emsdk_env_path = URI.resolveRelative("../../emsdk/emsdk_env.sh", URI.getEXEURL(import.meta));


        try {
            if (await emsdk_env_path.fetchText()) {
                cli_log("Local EMSDK installation found");
                HAVE_VERSION = true;
            }
        } catch (e) {
            cli_log("Could not find EMSDK installation");
        }
    }

    if (!HAVE_VERSION) {
        const readline = (await import("readline")).default;

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((res) => {
            rl.question("Would you like install a local version of emsdk for @candlelib/hydrocarbon? [y/n]\n", (reply: string) => {

                rl.close();
                if ("yes".includes(reply.toLowerCase())) {
                    cli_log("Installing emsdk");

                    const install_script_path = URI.resolveRelative("../../../scripts/install.sh", URI.getEXEURL(import.meta));
                    const install_script_cwd = URI.resolveRelative("../../../", URI.getEXEURL(import.meta));

                    cp.execFileSync(install_script_path + "", {
                        cwd: install_script_cwd.dir,
                        stdio: "inherit"
                    });

                    res(true);
                } else {
                    cli_log("No changes have been made");
                    res(false);
                }
            });
        });
    }

    return HAVE_VERSION;
};

addCLIConfig("check-emsdk", {
    key: "check-emsdk",
    help_brief: `
    Usage: check-emsdk
    
    Checks for an installation EMSDK and emcc. If the installation cannot be located, then it will prompt
    to download and install the package for use by Hydrocarbon.
`
}).callback = CheckForSDK;


const out_dir = addCLIConfig("compile", {
    key: "out_path",
    REQUIRES_VALUE: true,
    help_brief: "Directory to write compiled parser files. Defaults to CWD",
});

const type = addCLIConfig("compile", {
    key: "type",
    REQUIRES_VALUE: true,
    accepted_values: ["c++", "js", "ts", "rust"],
    help_brief:
        `
Target output language of the parser.
Must be one of: 
    c++ : C++ Dir with Header & Source Folders
    rust : Rust Cargo Directory
    js : Single File JavaScript  
    ts : Single File TypeScript`,
});

const recognizer = addCLIConfig("compile", {
    key: "recognizer",
    REQUIRES_VALUE: true,
    accepted_values: ["js", "wasm"],
    help_brief:
        `
Language in which to encode the recognizer. This only applies if the output targets
TypeScript or JavaScript.

Must be one of: 
    js   : JavaScript
    wasm : WebAssembly`,
});

const namespace = addCLIConfig("compile", {
    key: "namespace",
    REQUIRES_VALUE: true,
    help_brief:
        `
A unique name to give to the parser's namespace. Should only contain characters in 
the set described by this regex: [a-zA-Z\_][a-zA-Z\_]*. This will also serve as the 
folder name for C++ and RUST output which will be placed within the output file path.
Defaults to "parser" `,
});


const number_of_workers = addCLIConfig("compile", {
    key: "threads",
    accepted_values: [Number],
    REQUIRES_VALUE: true,
    help_brief: `Number of worker threads to use during compilation. Defaults to 1`,
});

addCLIConfig("compile", {
    key: "compile",
    help_brief: `
    Usage: compile <path_to_source_grammar>
    
    Compile new parser from a hydrocarbon grammar source file (.hcg)
`
}).callback = (async (args) => {
    try {

        const
            path = args.trailing_arguments.pop(),
            file_path = URL.resolveRelative(path),
            output_path = URL.resolveRelative(out_dir.value || "./");

        if (file_path.ext !== "hcg")
            throw new Error("Expected source file to be a hydrocarbon grammar file (.hcg)");

        if (recognizer.value == "wasm")
            if (!await CheckForSDK(args)) {
                cli_log("Could not locate EMSDK installation. Aborting");
                process.exit();
            }

        cli_log(`Compiling grammar`);

        const
            threads = parseInt(number_of_workers.value ?? "1"),
            grammar = await compileGrammarFromURI(file_path);

        if (type.value == "rust" || type.value == "c++")
            // Compile the extended reduce actions function and classes
            // this destroys any code generate for TypeScript or JavaScript outputs
            // hence the if gate.
            createCompilableCode(grammar);

        cli_log("Completed grammar compilation");

        cli_log(`Starting recognizer compilation with ${number_of_workers.value || 1} threads`);

        // Compile recognizer code
        const build_pack = await createBuildPack(grammar, threads);

        cli_log("Completed recognizer compilation");

        switch (type.value) {
            case "c++":
                {
                    // Need to generate source and cargo file, and map this
                    // installation's hc_rust source to the cargo file's dependencies.
                    //
                    cli_log("Writing cpp files");



                    const ns = namespace.value || "parser";

                    const folder = URL.resolveRelative(`./${ns}/`, output_path);

                    //Source files
                    await generateCPPParser(grammar, recognizer_functions, meta, folder + "", ns);

                }
                break;
            case "rust":
                { // Need to generate source and cargo file, and map this
                    // installation's hc_rust source to the cargo file's dependencies.
                    //
                    cli_log("Writing rust files");

                    const ns = namespace.value || "parser";

                    const folder = URL.resolveRelative(`./${ns}/`, output_path);

                    //Source files
                    await generateRustParser(grammar, recognizer_functions, meta, folder + "", ns);

                    const fsp = (await import("fs")).promises;

                    //Cargo file
                    const cargo_path = URL.resolveRelative("./Cargo.toml", folder);
                    const lib_path = URL.resolveRelative("./lib.rs", folder);
                    const hc_depend_path = URL.resolveRelative("../../../source/hc_rust", URI.getEXEURL(import.meta));

                    const cargo_file = `[package]
name = "${ns}"
version = "0.0.1"
edition = "2018"

[lib]
name = "${ns}"
crate-type = ["lib"]
path = "./lib.rs"

[dependencies]
candlelib_hydrocarbon = { path = "${hc_depend_path}" }
`;
                    const lib_file = `#![allow(warnings)]
pub mod parser;
mod spec_parser;
`;

                    await fsp.writeFile(cargo_path + "", cargo_file);
                    await fsp.writeFile(lib_path + "", lib_file);

                    break;
                }
            case "wasm":
                break;
            case "ts":
                break;
            default:
            case "js":

                const fsp = (await import("fs")).promises;

                let file_uri = new URI(output_path);
                if (!file_uri.filename) {
                    file_uri.path += "/parser.js";
                }
                if (!file_uri.ext) {
                    file_uri.path += ".js";
                }

                const script = renderToJavaScript(build_pack);

                await fsp.mkdir(output_path.path + "", { recursive: true });

                cli_log(`Writing file to ${file_uri + ""}`);

                await fsp.writeFile(file_uri + "", script);

                break;

                break;
        }

        cli_log("Process complete");
    } catch (e) {
        cli_log(e);
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
        hcg_grammar_file = URI.resolveRelative("./source/grammars/hcg-3-alpha/hcg.hcg"),
        compiled_grammar = await compileGrammarFromURI(hcg_grammar_file),
        bootstrapped_compiled_grammar = await compileGrammarFromURI(hcg_grammar_file),
        {
            recognizer_functions: bootstrapped_recognizer_functions
        } = await createBuildPack(bootstrapped_compiled_grammar, 1);

    let SUCCESS = await writeJSBasedParserScriptFile(
        URI.resolveRelative("./build/staged/hcg3_parser.staged.ts") + "",
        bootstrapped_compiled_grammar, bootstrapped_recognizer_functions, bootstrapped_meta,
        "../runtime/parser_loader_next.js",
        generateWebAssemblyParser
    );
});
processCLIConfig();
