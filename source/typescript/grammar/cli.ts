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
import { GrammarObject } from '../types/grammar_nodes.js';
import { compileResourceFile, resolveResourceFile } from './compile.js';
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

const out_dir = addCLIConfig<URI | string>("compile", {
    default: URI.getCWDURL(),
    accepted_values: ["stdout", URI],
    key: "o",
    REQUIRES_VALUE: true,
    help_brief: "Directory to write a Hydrocarbon grammar resource file (.hcgr). Defaults to CWD",
});

const stdin = addCLIConfig<URI | string>("compile", {
    default: URI.getCWDURL(),
    key: "stdin",
    REQUIRES_VALUE: false,
    help_brief: "Receive input from stdin instead from a file.",
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

    const logger = Logger.createLogger("compiler").activate();

    const
        input_file = URI.resolveRelative(arg);

    if (!(await input_file.DOES_THIS_EXIST())) {

        throw new Error(`${arg} does not exists`);

    } else {
        let grammar = await loadGrammarFromFile(input_file);

        grammar = await compileResourceFile(grammar);

        grammar.resource_path = null;

        if (out_dir.value === "stdout") {

            process.stdout.write(JSON.stringify(grammar, undefined, 2));

            return 0;

        } else {

            const output_path = URI.resolveRelative(`./${input_file.filename}.hcgr`, out_dir.value);

            grammar.resource_path = output_path + "";

            await fsp.writeFile(output_path + "", JSON.stringify(grammar, undefined, 2), { encoding: "utf8" });

            logger.log(`Resource file successfully written to ${output_path}`);

            return 0;
        }
    }
});
addCLIConfig<URI | string>("deserialize", {
    key: "deserialize",
    help_arg_name: "HCG file path",
    REQUIRES_VALUE: true,
    accepted_values: ["stdin", URI],
    help_brief: `

    Deserialize a Hydrocarbon grammar resource file (.hcgr)
`
}).callback = (async (arg) => {

    const logger = Logger.createLogger("compiler").activate();

    if (arg === "stdin") {

        return new Promise((complete, error) => {

            process.stdin.resume();
            process.stdin.setEncoding('utf8');

            let data = [];
            process.stdin.on('data', function (chunk) {

                data.push(chunk);

            });
            process.stdin.on('end', async function () {
                console.log(data);

                let grammar = await resolveResourceFile(JSON.parse(data.join("")));

                console.log(grammar);

                complete();
            });

            process.stdin.on("error", function (e) {
                logger.error(e);
                error(1);
            });
        });

    } else {
        const
            input_file = URI.resolveRelative(arg);

        if (!(await input_file.DOES_THIS_EXIST())) {

            throw new Error(`${arg} does not exists`);

        } else {

            let grammar: GrammarObject = <any>await input_file.fetchJSON();

            grammar = await resolveResourceFile(grammar);

            console.log(grammar);
        }
    }

});

processCLIConfig();