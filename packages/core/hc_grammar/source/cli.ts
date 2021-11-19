/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Logger } from '@candlelib/log';
import {
    addCLIConfig, fsp, processCLIConfig
} from "@candlelib/paraffin";
import URI from '@candlelib/uri';
import { tmpdir } from 'os';
import { compileResourceFile } from "./compile/resource_grammar.js";
import { loadGrammarFromFile } from './passes/load.js';
await URI.server();

addCLIConfig("root", {
    key: "root",
    help_brief:
        `
2021 Hydrocarbon Grammar Toolkit

Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Toolkit
`
});

const out_dir = addCLIConfig<URI | "stdout">("compile", {
    default: URI.getCWDURL(),
    accepted_values: ["stdout", URI],
    key: "o",
    REQUIRES_VALUE: true,
    help_brief: `
    Directory to write a Hydrocarbon grammar resource file (.hcgr).  Defaults to 
    The current working directory. 

    If the directory path is not terminated with a forward slash '/', then the 
    last path part is taken to mean the filename of the output. Otherwise,
    the filename of the source grammar file will be used.

    All output files will have the extension "*.hcgr".`,
});

const stdin = addCLIConfig<URI | string>("compile", {
    default: URI.getCWDURL(),
    key: "stdin",
    REQUIRES_VALUE: false,
    help_brief: "Receive input from stdin instead of a file.",
});


addCLIConfig<URI | string>("compile", {
    key: "compile",
    help_arg_name: "HCG file path",
    REQUIRES_VALUE: true,
    accepted_values: ["stdin", URI],
    help_brief: `

    Compile a Hydrocarbon grammar resource file (.hcgr) from a Hydrocarbon grammar file (.hcg)
`
}).callback = (async (arg) => {

    const logger = Logger.createLogger("Grammar").activate();

    const
        input_file = URI.resolveRelative(arg);


    if (!input_file || !(await input_file.DOES_THIS_EXIST())) {

        throw new Error(`${arg} does not exists`);

    } else {
        let grammar = await loadGrammarFromFile(input_file);

        if (grammar) {

            grammar = await compileResourceFile(grammar);

            logger.log(`Reading grammar file from ${input_file}`);

            let filename = input_file.filename;

            if (out_dir.value.filename)
                filename = out_dir.value.filename;

            let path = "";

            if (out_dir.value === "stdout") {
                path = new URI(tmpdir()) + "/";
            } else {
                path = out_dir.value.dir + "/";
            }

            const output_path = URI.resolveRelative(`./${filename}.hcgr`, path);

            grammar.resource_path = output_path + "";

            await fsp.writeFile(output_path + "", JSON.stringify(grammar, undefined, 2), { encoding: "utf8" });

            if (out_dir.value === "stdout") {

                logger.log(`Writing resource file to stdout`);

                process.stdout.write(JSON.stringify(grammar, undefined, 2));


                return 0;

            } else {

                logger.log(`Resource file successfully written to ${output_path}`);

                return 0;
            }

        }
    }
});

processCLIConfig();