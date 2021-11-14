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
import { stdout } from 'process';
import { resolveResourceFile } from '../grammar/compile.js';
import { GrammarObject } from '../types/grammar_nodes.js';
import { ReverseStateLookupMap, StateData } from '../types/ir_state_data.js';
import { renderByteCodeSheet } from './html.js';

await URI.server();

addCLIConfig("root", {
    key: "root",
    help_brief:
        `
2021 Hydrocarbon Analysis Toolkit

Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Toolkit
`
});

const out_dir = addCLIConfig<URI | "stdout">("disassemble", {
    key: "o",
    default: URI.getCWDURL(),
    accepted_values: ["stdout", URI],
    REQUIRES_VALUE: true,
    help_arg_name: "Output Directory Path",
    help_brief: `
    Directory within which files will be created/overwritten. Defaults to CWD. 
    If the directory path is not terminated with a forward slash '/', then the 
    last path part is taken to mean the filename of the output. Otherwise,
    the filename of the source grammar file will be used.

    All output files will have the extension "*.hcgr".

     `,
});

addCLIConfig<URI | "stdin">("disassemble", {
    key: "disassemble",
    help_arg_name: "Path to *.hcs",
    REQUIRES_VALUE: true,
    accepted_values: ["stdin", URI],
    help_brief: `
    Create a Bytecode sheet from a Hydrocarbon States file (*.hcs)
`
}).callback = (async (arg) => {

    const logger = Logger.createLogger("Disassembler").activate();

    let USE_STDOUT = out_dir.value == "stdout",
        output_file = new URI,
        states_path = new URI;

    if (arg === "stdin") {
        await new Promise((ok, fail) => {
            process.stdin.resume();
            process.stdin.setEncoding('utf8');

            let data = [];
            process.stdin.on('data', function (chunk) {

                data.push(chunk);

            });
            process.stdin.on('end', async function () {

                arg = URI.resolveRelative(data.join(""));

                ok(0);
            });

            process.stdin.on("error", function (e) {
                logger.error(e);
                fail(1);
            });
        });
    }

    if (USE_STDOUT)
        logger.deactivate();

    states_path = URI.resolveRelative(arg);

    if (!(await states_path.DOES_THIS_EXIST()) || states_path.ext !== "hcs")

        throw new Error(`${arg} does not exists or is not a Hydrocarbon States file`);

    const states: {
        bytecode_path: string;
        grammar_resource_path: string,
        states: {
            [name: string]: StateData;
        };
    } = <any>await states_path.fetchJSON();

    let binary: Uint32Array = null;

    let grammar: GrammarObject = null;



    if ("bytecode_path" in states) {

        const binary_path = URI.resolveRelative(states.bytecode_path, states_path);

        if (!(await binary_path.DOES_THIS_EXIST()) || binary_path.ext !== "hcb")
            throw new Error(`Parser binary cannot be found: ${binary_path + ""} does not exists`);

        binary = new Uint32Array(await binary_path.fetchBuffer());
    }

    if ("grammar_resource_path" in states) {
        const grammar_path = URI.resolveRelative(states.grammar_resource_path, states_path);

        if (!(await grammar_path.DOES_THIS_EXIST()) || grammar_path.ext !== "hcgr") {

            logger.warn(`Grammar Resource file ${grammar_path + ""} is not found or is not a Hydrocarbon Grammar Resource file.
                Details will be diminished.`);

        } else {

            grammar = <GrammarObject>await grammar_path.fetchJSON();

            grammar = await resolveResourceFile(grammar);
        }
    }

    const states_lookup: ReverseStateLookupMap =
        new Map(Object.entries(states.states).map(([k, v]) => {
            return [v.pointer & 0xFFFFFF, v];
        }));

    const sheet = renderByteCodeSheet(binary, states_lookup, grammar);

    if (USE_STDOUT) {
        stdout.write(sheet);
    } else {
        let out_path = URI.resolveRelative(out_dir.value);

        if (!out_path.filename) {
            out_path = URI.resolveRelative(`./${states_path.filename}.html`, out_path);
        }

        if (!out_path.ext || out_path.ext != "html") {
            out_path = URI.resolveRelative(`./${out_path.filename}.html`, out_path);
        }

        await writeFile(out_path + "", sheet);
    }

});



addCLIConfig<URI | "stdin">("railroad", {
    key: "railroad",
    help_arg_name: "Path to *.hcgr",
    REQUIRES_VALUE: true,
    accepted_values: ["stdin", URI],
    help_brief: `
    Create a Bytecode sheet from a Hydrocarbon Grammar Resource file (*.hcgr)
`
}).callback = (async (arg) => {

    const logger = Logger.createLogger("Disassembler").activate();

    let USE_STDOUT = out_dir.value == "stdout",
        output_file = new URI,
        states_path = new URI;

    if (arg === "stdin") {
        await new Promise((ok, fail) => {
            process.stdin.resume();
            process.stdin.setEncoding('utf8');

            let data = [];
            process.stdin.on('data', function (chunk) {

                data.push(chunk);

            });
            process.stdin.on('end', async function () {

                arg = URI.resolveRelative(data.join(""));

                ok(0);
            });

            process.stdin.on("error", function (e) {
                logger.error(e);
                fail(1);
            });
        });
    }

    if (USE_STDOUT)
        logger.deactivate();

    states_path = URI.resolveRelative(arg);

    if (!(await states_path.DOES_THIS_EXIST()) || states_path.ext !== "hcs")

        throw new Error(`${arg} does not exists or is not a Hydrocarbon States file`);

    const states: {
        bytecode_path: string;
        grammar_resource_path: string,
        states: {
            [name: string]: StateData;
        };
    } = <any>await states_path.fetchJSON();

    let binary: Uint32Array = null;

    let grammar: GrammarObject = null;



    if ("bytecode_path" in states) {

        const binary_path = URI.resolveRelative(states.bytecode_path, states_path);

        if (!(await binary_path.DOES_THIS_EXIST()) || binary_path.ext !== "hcb")
            throw new Error(`Parser binary cannot be found: ${binary_path + ""} does not exists`);

        binary = new Uint32Array(await binary_path.fetchBuffer());
    }

    if ("grammar_resource_path" in states) {
        const grammar_path = URI.resolveRelative(states.grammar_resource_path, states_path);

        if (!(await grammar_path.DOES_THIS_EXIST()) || grammar_path.ext !== "hcgr") {

            logger.warn(`Grammar Resource file ${grammar_path + ""} is not found or is not a Hydrocarbon Grammar Resource file.
                Details will be diminished.`);

        } else {

            grammar = <GrammarObject>await grammar_path.fetchJSON();

            grammar = await resolveResourceFile(grammar);
        }
    }

    const states_lookup: ReverseStateLookupMap =
        new Map(Object.entries(states.states).map(([k, v]) => {
            return [v.pointer & 0xFFFFFF, v];
        }));

    const sheet = renderByteCodeSheet(binary, states_lookup, grammar);

    if (USE_STDOUT) {
        stdout.write(sheet);
    } else {
        let out_path = URI.resolveRelative(out_dir.value);

        if (!out_path.filename) {
            out_path = URI.resolveRelative(`./${states_path.filename}.html`, out_path);
        }

        if (!out_path.ext || out_path.ext != "html") {
            out_path = URI.resolveRelative(`./${out_path.filename}.html`, out_path);
        }

        await writeFile(out_path + "", sheet);
    }
});

addCLIConfig<URI | "stdin">("fuzz", {
    key: "railroad",
    help_arg_name: "Path to *.hcgr",
    REQUIRES_VALUE: true,
    accepted_values: ["stdin", URI],
    help_brief: `
    Create a Bytecode sheet from a Hydrocarbon Grammar Resource file  (*.hcgr)
`
}).callback = (async (arg) => {

    const logger = Logger.createLogger("Disassembler").activate();

    let USE_STDOUT = out_dir.value == "stdout",
        output_file = new URI,
        states_path = new URI;

    if (arg === "stdin") {
        await new Promise((ok, fail) => {
            process.stdin.resume();
            process.stdin.setEncoding('utf8');

            let data = [];
            process.stdin.on('data', function (chunk) {

                data.push(chunk);

            });
            process.stdin.on('end', async function () {

                arg = URI.resolveRelative(data.join(""));

                ok(0);
            });

            process.stdin.on("error", function (e) {
                logger.error(e);
                fail(1);
            });
        });
    }

    if (USE_STDOUT)
        logger.deactivate();

    states_path = URI.resolveRelative(arg);

    if (!(await states_path.DOES_THIS_EXIST()) || states_path.ext !== "hcs")

        throw new Error(`${arg} does not exists or is not a Hydrocarbon States file`);

    const states: {
        bytecode_path: string;
        grammar_resource_path: string,
        states: {
            [name: string]: StateData;
        };
    } = <any>await states_path.fetchJSON();

    let binary: Uint32Array = null;

    let grammar: GrammarObject = null;



    if ("bytecode_path" in states) {

        const binary_path = URI.resolveRelative(states.bytecode_path, states_path);

        if (!(await binary_path.DOES_THIS_EXIST()) || binary_path.ext !== "hcb")
            throw new Error(`Parser binary cannot be found: ${binary_path + ""} does not exists`);

        binary = new Uint32Array(await binary_path.fetchBuffer());
    }

    if ("grammar_resource_path" in states) {
        const grammar_path = URI.resolveRelative(states.grammar_resource_path, states_path);

        if (!(await grammar_path.DOES_THIS_EXIST()) || grammar_path.ext !== "hcgr") {

            logger.warn(`Grammar Resource file ${grammar_path + ""} is not found or is not a Hydrocarbon Grammar Resource file.
                Details will be diminished.`);

        } else {

            grammar = <GrammarObject>await grammar_path.fetchJSON();

            grammar = await resolveResourceFile(grammar);
        }
    }

    const states_lookup: ReverseStateLookupMap =
        new Map(Object.entries(states.states).map(([k, v]) => {
            return [v.pointer & 0xFFFFFF, v];
        }));

    const sheet = renderByteCodeSheet(binary, states_lookup, grammar);

    if (USE_STDOUT) {
        stdout.write(sheet);
    } else {
        let out_path = URI.resolveRelative(out_dir.value);

        if (!out_path.filename) {
            out_path = URI.resolveRelative(`./${states_path.filename}.html`, out_path);
        }

        if (!out_path.ext || out_path.ext != "html") {
            out_path = URI.resolveRelative(`./${out_path.filename}.html`, out_path);
        }

        await writeFile(out_path + "", sheet);
    }
});

processCLIConfig();