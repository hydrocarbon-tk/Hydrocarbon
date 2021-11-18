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
import { renderTypeScriptParserData } from './render';

const disable_opt = addCLIConfig<boolean>("compile", "parse", {
    key: "O0",
    default: false,
    REQUIRES_VALUE: false,
    help_brief: `Disable optimizations`,
});

const target = addCLIConfig<"rust" | "go" | "ts">("compile", "parse", {
    key: "t",
    default: "ts",
    accepted_values: ["rust", "go", "ts"],
    REQUIRES_VALUE: true,
    help_arg_name: "Target Language",
    help_brief: "Target language to write parser in. Defaults to TypeScript",
});

const asytrip = addCLIConfig("compile", "parse", {
    key: "asytrip",
    REQUIRES_VALUE: false,
    help_brief: "Compile ASYTrip",
});

const parse_loglevel = addCLIConfig("compile", "parse", args.log_level_properties);

addCLIConfig<URI | string>("compile", "parse", {
    key: "parse",
    help_arg_name: "HCG file path",
    REQUIRES_VALUE: true,
    accepted_values: ["stdin", URI],
    help_brief: `

    Compile a Hydrocarbon parser system for a target language
`
}).callback = (async arg => {
    await URI.server();

    const logger = Logger.createLogger("HCToolkit").activate(parse_loglevel.value);

    const dir = new URI(tmpdir() + "/");

    const resource_path = <URI>URI.resolveRelative("./tmp.hcgr", dir);
    const states_path = <URI>URI.resolveRelative("./tmp.hcs", dir);
    const binary_path = <URI>URI.resolveRelative("./tmp.hcb", dir);

    const grammar_handle = spawn("hc.grammar", ["compile", "--o", resource_path + "", arg + ""], {
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
            const bc_handle = spawn("hc.bytecode",
                ["compile", !disable_opt.value ? "" : "--O0", "--o", dir + "", resource_path + ""]
                , {
                    stdio: ['inherit', "inherit", "inherit"]
                });
            bc_handle.addListener("close", () => {
                complete(true);
            });

        }), new Promise(complete => {
            if (asytrip.value) {
                const at_handle = spawn("hc.asytrip", ["compile", "--o", dir + "", "--t", target.value, resource_path + ""], {
                    stdio: ['inherit', "inherit", "inherit"]
                });
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
                const ast_temp_path = <URI>URI.resolveRelative("./tmp-ast.ts", dir);
                const ast_path = URI.resolveRelative("./ast.ts");
                const data_path = URI.resolveRelative("./parser_data.ts");

                await Promise.all([
                    await writeFile(ast_path + "", auto_gen_disclaimer_and_license + (await ast_temp_path.fetchText())),
                    await writeFile(data_path + "", auto_gen_disclaimer_and_license + parser_data),
                ]);

                logger.log(`Created \n   ${ast_path}\n   ${data_path}  `);

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

addCLIConfig<URI | string>("tools", "disassemble", {
    key: "disassemble",
    help_arg_name: "HCG file path",
    REQUIRES_VALUE: true,
    accepted_values: ["stdin", URI],
    help_brief: `
    Create a disassembly sheet from a Grammar file
`
}).callback = async function () { };

addCLIConfig<URI | string>("tools", "fuzz", {
    key: "fuzz",
    help_arg_name: "HCG file path",
    REQUIRES_VALUE: true,
    accepted_values: ["stdin", URI],
    help_brief: `

    Created a randomized fuzz string from the input grammar.
`
}).callback = async function () { };

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