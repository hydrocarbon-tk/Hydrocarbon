/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import {
    addCLIConfig, processCLIConfig
} from "@candlelib/paraffin";
import { default as URI, default as URL } from "@candlelib/uri";
import { buildRecognizer } from "../build/build.js";
import { compileGrammarFromURI } from "../grammar/compile.js";
import { generateJSParser, generateWebAssemblyParser, writeParserScriptFile } from "../render/render.js";

await URL.server();

async function CheckForSDK(args): Promise<boolean> {

    const cp = (await import("child_process")).default;

    let HAVE_VERSION = false;

    //Checking for emcc installation
    try {
        const emcc_version = cp.spawnSync("emcc", ["--version"], {}).stdout.toString("utf8");

        const version_number = emcc_version.match(/\d+\.\d+\.\d+/g)[0]?.split(".").map(s => parseInt(s));


        if (version_number[0] < 2)
            console.log(`emcc version ${version_number.join(".")} too old`);
        else {
            console.log("Found compatible version of EMSDK");
            HAVE_VERSION = true;
        }

    } catch (e) {
        //Check local install
        const emsdk_env_path = URI.resolveRelative("../../../emsdk/emsdk_env.sh", URI.getEXEURL(import.meta));

        try {
            if (await emsdk_env_path.fetchText()) {
                console.log("Local installation found");
                HAVE_VERSION = true;
            }
        } catch (e) {
            console.log("Could not find EMSDK installation");
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
                    console.log("Installing emsdk");

                    const install_script_path = URI.resolveRelative("../../../../scripts/install.sh", URI.getEXEURL(import.meta));
                    const install_script_cwd = URI.resolveRelative("../../../../", URI.getEXEURL(import.meta));

                    cp.execFileSync(install_script_path + "", {
                        cwd: install_script_cwd.dir,
                        stdio: "inherit"
                    });

                    res(true);
                } else {
                    console.log("No changes have been made");
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
    accepted_values: ["c++", "js", "ts"],
    help_brief:
        `
Target output language of the parser.
Must be one of: 
    c++ 
    js : JavaScript  
    ts : TypeScript`,
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

const annotated = addCLIConfig("compile", {
    key: "annotated",
    REQUIRES_VALUE: false,
    help_brief:
        `
Include annotation strings within the recognizer code for manual debugging. Applies
only to JavaScript/TypeScript based recognizers.`,
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
                console.log("Could not locate EMSDK installation. Aborting");
                process.exit();
            }


        console.log(`Compiling grammar`);

        const
            threads = parseInt(number_of_workers.value ?? "1"),
            grammar = await compileGrammarFromURI(file_path);

        console.log("Completed grammar compilation");

        console.log(`Starting recognizer compilation with ${number_of_workers.value || 1} threads`);



        const { meta, recognizer_functions } = await buildRecognizer(grammar, threads, !!annotated.value);

        console.log("Completed recognizer compilation");

        if (type.value == "c++") {

            if (!output_path.filename)
                output_path.path = output_path.path + "/" + file_path.filename + ".cpp";
            console.log("Writing cpp source file");
            console.log("Compilation to C++ not yet implemented");
        } else {

            if (!output_path.filename)
                output_path.path = output_path.dir + file_path.filename + (type.value == "ts" ? ".ts" : ".js");

            console.log("Building parser script");

            const generator = (recognizer.value == "wasm")
                ? generateWebAssemblyParser
                : (recognizer.value == "ts")
                    ? generateJSParser
                    : generateJSParser;


            await writeParserScriptFile(
                output_path + "",
                grammar,
                recognizer_functions,
                meta,
                "@candlelib/hydrocarbon",
                generator
            );

            console.log(`Parser Script Built and written to ${output_path + ""}`);
        }
    } catch (e) {
        console.log(e);
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