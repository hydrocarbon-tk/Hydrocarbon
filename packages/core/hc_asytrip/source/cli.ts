/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Logger } from '@candlelib/log';
import {
    addCLIConfig, processCLIConfig
} from "@candlelib/paraffin";
import URI from '@candlelib/uri';
import { resolveResourceGrammarCLI } from '@hctoolkit/grammar';
import { writeFile } from 'fs/promises';
import { createGoTypes } from './targets/asytrip_to_go.js';
import { createTsTypes } from './targets/asytrip_to_ts.js';
import { createRustTypes } from './targets/asytrip_to_rust.js';
import { createASYTRripContext } from './context/create_asytrip_context.js';

await URI.server();

addCLIConfig("root", {
    key: "root",
    help_brief:
        `
# Hydrocarbon Abstract Syntax Tree Toolkit

`
});

const out_dir = addCLIConfig<URI | "stdout">("compile", {
    key: "o",
    default: URI.getCWDURL(),
    accepted_values: ["stdout", URI],
    REQUIRES_VALUE: true,
    help_arg_name: "Output Path",
    help_brief: `
    Filepath to the output file that will be created/overwritten. 
    May also specify [stdout] to output to terminal buffer.

`,
});

const target = addCLIConfig("compile", {
    key: "t",
    default: "ts",
    accepted_values: ["rust", "go", "ts"],
    REQUIRES_VALUE: true,
    help_arg_name: "Target Language",
    help_brief: "Target language to write the AST in.",
});

addCLIConfig<URI | "stdin">("compile", {
    key: "compile",
    help_arg_name: "Path to *.hcgr",
    REQUIRES_VALUE: false,
    accepted_values: ["stdin", URI],
    help_brief: `

    Compile an ASYtrip AST from a Hydrocarbon grammar resource file (.hcgr)
`
}).callback = (async (arg) => {

    const logger = Logger.createLogger("ASYTrip").activate();

    let USE_STDOUT = true,
        output_file = new URI,
        input_file = new URI;

    if (out_dir.value !== "stdout") {
        USE_STDOUT = false;
        const dir = URI.resolveRelative(out_dir.value);
        if (dir)
            output_file = dir;
    }

    let grammar = await resolveResourceGrammarCLI(arg, logger);

    const asytrip_context = createASYTRripContext(grammar, logger);

    if (asytrip_context)
        try {
            let file_path = "", output_data = "";


            let file_name = [
                "unnamed",
                new URI(grammar.URI).filename,
                new URI(grammar.resource_path).filename,
                input_file.filename,
                output_file.filename,
            ].filter(a => !!a).pop();

            switch (target.value) {

                case "js":
                    file_path = URI.resolveRelative(
                        `./${file_name}-ast.js`, output_file) + "";

                    output_data = createTsTypes(grammar, asytrip_context);
                    break;

                case "ts":
                    file_path = URI.resolveRelative(
                        `./${file_name}-ast.ts`, output_file) + "";

                    output_data = createTsTypes(grammar, asytrip_context);
                    break;

                case "rust":
                    file_path = URI.resolveRelative(
                        `./${file_name}-ast.rust`, output_file) + "";

                    output_data = createRustTypes(grammar, asytrip_context);
                    break;
                case "go":

                    file_path = URI.resolveRelative(
                        `./${file_name}-ast.go`, output_file) + "";

                    output_data = createGoTypes(grammar, asytrip_context);
                    break;

            }

            if (USE_STDOUT) {
                process.stdout.write(output_data);
            } else {

                await writeFile(file_path, output_data);
                logger.log(`Created [${target.value}] AST file at ${file_path}`);
            }

        } catch (e) {

            logger.error("Error encountered while building AST");

            logger.error(e);

            throw new Error("Unable to write AST code");
        }

});

processCLIConfig();