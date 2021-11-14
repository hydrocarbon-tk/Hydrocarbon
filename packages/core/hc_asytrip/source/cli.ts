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
import { writeFile } from 'fs/promises';
import { resolveResourceFile } from '@hc/grammar';
import { GrammarObject } from '@hc/common';
import { createGoTypes } from './asytrip_to_go.js';
import { createTsTypes } from './asytrip_to_js.js';
import { createRustTypes } from './asytrip_to_rust.js';
import { createASYTRripContext } from './create_asytrip_context.js';

await URI.server();

addCLIConfig("root", {
    key: "root",
    help_brief:
        `
2021 Hydrocarbon Abstract Syntax Tree Toolkit

Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Toolkit
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
    REQUIRES_VALUE: true,
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
        output_file = URI.resolveRelative(out_dir.value);
    }

    let grammar: GrammarObject = null;

    if (arg === "stdin") {
        await new Promise((ok, fail) => {
            process.stdin.resume();
            process.stdin.setEncoding('utf8');

            let data = [];
            process.stdin.on('data', function (chunk) {

                data.push(chunk);

            });
            process.stdin.on('end', async function () {

                grammar = JSON.parse(data.join(""));

                ok(0);
            });

            process.stdin.on("error", function (e) {
                logger.error(e);
                fail(1);
            });
        });
    } else {

        input_file = URI.resolveRelative(arg);

        if (!(await input_file.DOES_THIS_EXIST()))

            throw new Error(`${arg} does not exists`);

        grammar = <any>await input_file.fetchJSON();

        if (!("type" in grammar) || grammar.type != "hc-grammar-5")
            throw new Error("Unable to recognize Hydrocarbon Resource File");
    }

    grammar = await resolveResourceFile(grammar);

    const asytrip_context = createASYTRripContext(grammar, logger);

    if (asytrip_context)
        try {
            let file_path = "", output_data = "";

            switch (target.value) {

                case "js":
                    file_path = URI.resolveRelative(
                        `./${input_file.filename}-ast.js`, output_file) + "";

                    output_data = createTsTypes(grammar, asytrip_context);
                    break;

                case "ts":
                    file_path = URI.resolveRelative(
                        `./${input_file.filename}-ast.ts`, output_file) + "";

                    output_data = createTsTypes(grammar, asytrip_context);
                    break;

                case "rust":
                    file_path = URI.resolveRelative(
                        `./${input_file.filename}-ast.rust`, output_file) + "";

                    output_data = createRustTypes(grammar, asytrip_context);
                    break;
                case "go":

                    file_path = URI.resolveRelative(
                        `./${input_file.filename}-ast.go`, output_file) + "";

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