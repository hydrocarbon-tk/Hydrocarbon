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
import { GrammarObject } from '@hctoolkit/common';
import { resolveResourceGrammarCLI } from '@hctoolkit/grammar';
import { writeFile } from 'fs/promises';
import { cpus } from 'os';
import { compileBuildPack } from './index.js';

await URI.server();

addCLIConfig("root", {
    key: "root",
    help_brief:
        `
2021 Hydrocarbon Parser Compiler Toolkit

Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Toolkit
`
});

const out_dir = addCLIConfig<URI | "stdout">("compile", {
    key: "o",
    default: URI.getCWDURL(),
    accepted_values: [URI],
    REQUIRES_VALUE: true,
    help_arg_name: "Output Directory Path",
    help_brief: `
    Directory within which files will be created/overwritten. Defaults to CWD`,
});

const optimizations = addCLIConfig<boolean>("compile", {
    key: "O0",
    REQUIRES_VALUE: false,
    help_brief: `Disable optimizations`,
});

const threads = addCLIConfig<number>("compile", {
    key: "t",
    default: cpus.length - 1,
    accepted_values: [Number],
    REQUIRES_VALUE: true,
    help_arg_name: "Worker Thread Count",
    help_brief: `Number of worker threads to use during compilation. Defaults to the number of available cores minus 1`,
});

addCLIConfig<URI | "stdin">("compile", {
    key: "compile",
    help_arg_name: "Path to *.hcgr",
    REQUIRES_VALUE: true,
    accepted_values: ["stdin", URI],
    help_brief: `
    Compile Hydrocarbon parser bytecode (.hcb) and companion Hydrocarbon ir states (.hcs) from a Hydrocarbon grammar resource file (.hcgr)
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

    var grammar: GrammarObject = await resolveResourceGrammarCLI(arg, logger);

    const build_pack = await compileBuildPack(grammar, threads.value, optimizations.value);

    const output_dir = URI.resolveRelative(out_dir.value);

    if (output_dir) {

        const name = output_dir.filename || (new URI(grammar.URI)).filename || "parser";

        const binary_path = URI.resolveRelative(`./${name}.hcb`, output_dir);

        const states_path = URI.resolveRelative(`./${name}.hcs`, output_dir);

        await writeFile(binary_path + "", build_pack.state_buffer, { encoding: 'binary' });

        await writeFile(states_path + "", JSON.stringify({
            bytecode_path: binary_path + "",
            grammar_resource_path: USE_STDOUT ? "" : grammar.resource_path || "",
            states: Object.fromEntries([...build_pack.states_map].map(([k, v]) => {
                return [k, {
                    name: k,
                    block_offset: v.block_offset,
                    pointer: v.pointer,
                    string: v.string,
                }];
            }))
        }), { encoding: 'utf8' });

        process.stdout.write(states_path + "");
    }
});

processCLIConfig();

