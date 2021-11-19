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

import { Logger } from '@candlelib/log';
import { addCLIConfig, args, processCLIConfig } from '@candlelib/paraffin';
import URI from '@candlelib/uri';
import { ExportableStates, getEntryPointers, GrammarObject, ReverseStateLookupMap } from '@hctoolkit/common';
import { resolveResourceGrammarCLI } from '@hctoolkit/grammar';
import { spawn } from 'child_process';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { renderTypeScriptParserData } from './render.js';

const grammar_path = URI.resolveRelative("./grammar/build/cli.js", <URI>URI.resolveRelative("@hctoolkit/grammar")) + "";
const bytecode_path = URI.resolveRelative("./bytecode/bin/index.js", <URI>URI.resolveRelative("@hctoolkit/bytecode")) + "";
const asytrip_path = URI.resolveRelative("./asytrip/bin/index.js", <URI>URI.resolveRelative("@hctoolkit/asytrip")) + "";
const tools_path = URI.resolveRelative("./tools/bin/index.js", <URI>URI.resolveRelative("@hctoolkit/tools")) + "";


const disable_opt = addCLIConfig<boolean>("compile", "parser", {
    key: "O0",
    default: false,
    REQUIRES_VALUE: false,
    help_brief: `Disable optimizations`,
});

const target = addCLIConfig<"rust" | "go" | "ts">("compile", "parser", {
    key: "t",
    default: "ts",
    accepted_values: ["rust", "go", "ts"],
    REQUIRES_VALUE: true,
    help_arg_name: "Target Language",
    help_brief: "Target language to write parser in. Defaults to TypeScript",
});

const asytrip = addCLIConfig("compile", "parser", {
    key: "asytrip",
    REQUIRES_VALUE: false,
    help_brief: "Compile ASYTrip",
});

const parse_loglevel = addCLIConfig("compile", "parser", args.log_level_properties);

addCLIConfig<URI | string>("compile", "parser", {
    key: "parser",
    help_arg_name: "HCG file path",
    REQUIRES_VALUE: true,
    accepted_values: ["stdin", URI],
    help_brief: `

    Compile a Hydrocarbon parser system for a target language
`
}).callback = (async (arg) => {
    await URI.server();

    const logger = Logger.createLogger("HCToolkit").activate(parse_loglevel.value);

    const dir = new URI(tmpdir() + "/");

    const resource_path = <URI>URI.resolveRelative("./tmp.hcgr", dir);
    const states_path = <URI>URI.resolveRelative("./tmp.hcs", dir);
    const binary_path = <URI>URI.resolveRelative("./tmp.hcb", dir);

    const grammar_handle = spawn("node", [grammar_path + "", "compile", "--o", resource_path + "", arg + ""], {
        stdio: ['inherit', "inherit", "inherit"]
    });

    await new Promise((res, rej) => grammar_handle.addListener("close", v => {
        if (v != 0) {
            rej(new Error("Unable to process grammar"));
        }
        res(true);
    }));

    let grammar: GrammarObject | null = null;

    await Promise.all([
        new Promise(complete => {
            const bc_handle = spawn("node",
                [bytecode_path + "", "compile", !disable_opt.value ? "" : "--O0", "--o", dir + "", resource_path + ""],
                { stdio: ['inherit', "inherit", "inherit"] });
            bc_handle.addListener("close", () => {
                complete(true);
            });

        }), new Promise(complete => {
            if (asytrip.value) {
                const at_handle = spawn("node",
                    [asytrip_path + "", "compile", "--o", dir + "", "--t", target.value, resource_path + ""],
                    { stdio: ['inherit', "inherit", "inherit"] });
                at_handle.addListener("close", () => {
                    complete(true);
                });
            } else complete(true);
        }),
        new Promise(async complete => {

            grammar = await resolveResourceGrammarCLI(resource_path, logger);

            complete(true);
        })
    ]);

    if (grammar) {

        const states = <ExportableStates>await states_path.fetchJSON();

        const states_lookup: ReverseStateLookupMap =
            new Map(Object.entries(states.states).map(([k, v]) => {
                return [v.pointer & 0xFFFFFF, v];
            }));


        const entry_pointers = getEntryPointers(<GrammarObject>grammar, new Map([
            ...states_lookup.entries()
        ].map(([, b]) => {
            return [b.name, b.pointer];
        })));

        //compile the source file

        const binary = new Uint32Array(await binary_path.fetchBuffer());

        switch (target.value) {
            case "ts": {

                const parser_data = renderTypeScriptParserData(grammar, binary, entry_pointers, states);

                const data_path = URI.resolveRelative("./parser_data.ts");
                const file_writes = [await writeFile(data_path + "", auto_gen_disclaimer_and_license + parser_data)];

                if (asytrip.value) {
                    const ast_temp_path = <URI>URI.resolveRelative("./tmp-ast.ts", dir);
                    const ast_path = URI.resolveRelative("./ast.ts");
                    file_writes.push(await writeFile(ast_path + "", auto_gen_disclaimer_and_license + (await ast_temp_path.fetchText())));
                    logger.log(`Created \n   ${ast_path}\n   ${data_path}  `);
                } else logger.log(`Created \n  ${data_path}  `);

                await Promise.all(file_writes);

            } break;
            case "go":
                break;
            case "rust":
                break;
        }

        logger.debug();

        logger.debug("Complete");
    }
});

const browse = addCLIConfig<boolean>("tools", "disassemble", {
    key: "browse",
    REQUIRES_VALUE: false,
    help_brief: "Open the bytecode sheet in the default browser.",
});


addCLIConfig<URI>("tools", "disassemble", {
    key: "disassemble",
    help_arg_name: "HCG file path",
    REQUIRES_VALUE: true,
    accepted_values: [URI],
    help_brief: `
    Create a bytecode disassembly sheet from a grammar
`
}).callback = async function (arg) {
    const gram_file = <URI>URI.resolveRelative(arg);
    const brwsflag = !!browse.value ? "--browse" : "";

    if (await gram_file.DOES_THIS_EXIST() && gram_file.ext == "hcg") {

        const grammar = spawn(
            "node", [grammar_path + "", "compile", "--o", "stdout", gram_file + ""],
            { stdio: ["inherit", "pipe", "inherit"] }
        );

        const bytecode = spawn(
            "node", [bytecode_path + "", "compile", "--O0", "--o", "stdout"],
            { stdio: ["pipe", "pipe", "inherit"] }
        );

        grammar.stdout.pipe(bytecode.stdin, { end: true });

        const disassemble = spawn(
            "node", [tools_path + "", "disassemble", brwsflag, "stdin"],
            { stdio: ["pipe", "pipe", "inherit"] }
        );

        bytecode.stdout.pipe(disassemble.stdin, { end: true });

        disassemble.stdout.pipe(process.stdout, { end: true });
    }
};

addCLIConfig<URI>("tools", "fuzz", {
    key: "fuzz",
    help_arg_name: "HCG file path",
    REQUIRES_VALUE: true,
    accepted_values: [URI],
    help_brief: `

    Create a randomized fuzz string from a grammar
`
}).callback = async function (arg) {

    const gram_file = <URI>URI.resolveRelative(arg);

    if (await gram_file.DOES_THIS_EXIST() && gram_file.ext == "hcg") {

        const grammar = spawn(
            "node", [grammar_path + "", "compile", "--o", "stdout", gram_file + ""],
            { stdio: ["inherit", "pipe", "inherit"] }
        );

        const fuzz = spawn(
            "node", [tools_path + "", "fuzz", "stdin"],
            { stdio: ["pipe", "pipe", "inherit"] }
        );

        grammar.stdout.pipe(fuzz.stdin, { end: true });

        fuzz.stdout.pipe(process.stdout, { end: true });
    }
};

processCLIConfig("hc");

const auto_gen_disclaimer_and_license =
    `
/* **** DO NOT MODIFY **** DO NOT MODIFY **** DO NOT MODIFY ****
 * 
 * This code has been automatically generated by Hydrocarbon Toolkit
 * 
 * ###################################################################
 * 
 * Copyright 2021 Anthony C. Weathersby
 * 
 * Permission is hereby granted, free of charge, to any person obtaining 
 * a copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included 
 * in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS 
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
 * IN THE SOFTWARE.
 */

`;