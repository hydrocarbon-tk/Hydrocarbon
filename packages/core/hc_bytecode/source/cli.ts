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
import { cpus, tmpdir } from 'os';
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

const out_dir = addCLIConfig<URI | "stdout" | "">("compile", {
    key: "o",
    default: URI.getCWDURL(),
    accepted_values: ["", "stdout", URI],
    REQUIRES_VALUE: true,
    help_arg_name: "Output Directory Path",
    help_brief: `
    Directory within which files will be created/overwritten. Defaults to CWD`,
});

const disable_opt = addCLIConfig<boolean>("compile", {
    key: "O0",
    default: false,
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
    REQUIRES_VALUE: false,
    accepted_values: ["stdin", URI],
    help_brief: `
    Compile Hydrocarbon parser bytecode (.hcb) and companion Hydrocarbon ir states (.hcs) from a Hydrocarbon grammar resource file (.hcgr)
`
}).callback = (async (arg) => {

    const logger = Logger.createLogger("Bytecode").activate();

    let USE_STDOUT = true,
        out_dir_str: string = tmpdir() + "/",
        output_file = new URI,
        input_file = new URI;

    if (out_dir.value !== "stdout") {
        USE_STDOUT = false;
        out_dir_str = out_dir.value + "";
        output_file = <URI>URI.resolveRelative(out_dir_str);
    }

    var grammar: GrammarObject = await resolveResourceGrammarCLI(arg || "", logger);

    const build_pack = await compileBuildPack(grammar, threads.value, !disable_opt.value);

    const output_dir = URI.resolveRelative(out_dir_str);

    if (output_dir) {

        if (output_dir + "" == "stdout") {
            output_dir;
        }

        let file_name = [
            "unnamed",
            new URI(grammar.URI).filename,
            new URI(grammar.resource_path).filename,
            input_file.filename,
            output_file.filename,
        ].filter(a => !!a).pop();

        const binary_path = URI.resolveRelative(`./${file_name}.hcb`, output_dir);

        const states_path = URI.resolveRelative(`./${file_name}.hcs`, output_dir);

        await writeFile(binary_path + "", build_pack.state_buffer, { encoding: 'binary' });

        await writeFile(states_path + "", JSON.stringify({
            bytecode_path: binary_path + "",
            grammar_resource_path: grammar.resource_path || "",
            states: Object.fromEntries([...build_pack.states_map].map(([k, v]) => {
                return [k, {
                    name: k,
                    block_offset: v.block_offset,
                    pointer: v.pointer,
                    string: v.string,
                }];
            }))
        }), { encoding: 'utf8' });

        logger.log(`Created: \n    Bytecode Binary: ${binary_path} \n    States Information: ${states_path} `);

        if (USE_STDOUT)
            process.stdout.write(states_path + "");
    } else {
        logger.warn("Unable to output build data");
    }

});

processCLIConfig();

