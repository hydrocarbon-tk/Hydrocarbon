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
import { addCLIConfig, processCLIConfig, args } from '@candlelib/paraffin';
import URI from '@candlelib/uri';
import { getEntryPointers, GrammarObject, ReverseStateLookupMap } from '@hctoolkit/common';
import { resolveResourceGrammarCLI } from '@hctoolkit/grammar';
import { spawn, spawnSync } from 'child_process';
import { writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { renderTypeScriptParserData } from './render';

const target = addCLIConfig<"rust" | "go" | "ts">("parse", {
    key: "t",
    default: "ts",
    accepted_values: ["rust", "go", "ts"],
    REQUIRES_VALUE: true,
    help_arg_name: "Target Language",
    help_brief: "Target language to write parser in. Defaults to TypeScript",
});

const asytrip = addCLIConfig("parse", {
    key: "asytrip",
    REQUIRES_VALUE: false,
    help_brief: "Compile ASYTrip",
});

const parse_loglevel = addCLIConfig("parse", args.log_level_properties);

addCLIConfig<URI | string>("parse", {
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

    spawnSync("hc.grammar", ["compile", "--o", resource_path + "", arg + ""], {
        stdio: ['inherit', "inherit", "inherit"]
    });

    let grammar: GrammarObject | null = null;

    await Promise.all([
        new Promise(complete => {
            const bc_handle = spawn("hc.bytecode", ["compile", "--o", dir + "", resource_path + ""], {
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

        const states = <any>await states_path.fetchJSON();

        const states_lookup: ReverseStateLookupMap =
            <any>new Map(Object.entries(states.states).map(([k, v]) => {
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

                const parser_data = renderTypeScriptParserData(grammar, binary, entry_pointers);
                const ast_temp_path = <URI>URI.resolveRelative("./tmp-ast.ts", dir);
                const ast_path = URI.resolveRelative("./ast.ts");
                const data_path = URI.resolveRelative("./parser_data.ts");

                await Promise.all([
                    await writeFile(ast_path + "", await ast_temp_path.fetchText()),
                    await writeFile(data_path + "", parser_data),
                ]);

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

processCLIConfig();