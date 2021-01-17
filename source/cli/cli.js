#!/usr/bin/env node


/* IMPORTS *******************/


//CandleFW stuffs
import wind from "@candlefw/wind";
import URL from "@candlefw/url";
import * as hc from "../../build/library/hydrocarbon.js";

import runner from "./compiler_runner.js";

//Third Party stuff
import * as commander from "commander";

//Node stuffs
import path from "path";
import fs from "fs";
import readline from "readline";
import { compileHybrid } from "../../build/library/hybrid/hybrid_compiler.js";

//Regex to match Protocol and/or Drive letter from module url
const
    fn_regex = /(file\:\/\/)(\/)*([A-Z]\:)*/g,
    fsp = fs.promises,


    /* ** BASH COLORS ****/
    COLOR_ERROR = `\x1b[41m`,
    COLOR_KEYBOARD = `\x1b[38;5;15m\x1b[48;5;246m`,
    COLOR_SUCCESS = `\x1b[38;5;254m\x1b[48;5;30m`,
    COLOR_RESET = `\x1b[0m`,
    ADD_COLOR = (str, color) => color + str + COLOR_RESET;

/* ****************** HC STUFF *********************/

async function loadEnvironment(env_path = "") {
    let env = { functions: {} };

    //check for optional env file
    if (env_path)
        env = (await import("file://" + env_path)).default; // TODO: Why is file:// a thing !?!

    return env;
}

/* ******************* FILE HANDLING ***************************/

async function loadFiles(grammar_path, env_path = "", states_path = "", quiet = false) {

    let grammar_string = "",
        states_string = "";

    try {
        grammar_string = await fsp.readFile(grammar_path, "utf8");
    } catch (err) {
        throw new Error(`Unable to open the grammar file ${grammar_path} ${err}`);

    }

    if (states_path) {
        try {
            states_string = await fsp.readFile(states_path, "utf8");
        } catch (err) {
            throw new Error(`Unable to open the states file ${states_path} ${err}`);
        }
    }

    const env = await loadEnvironment(env_path);

    return { grammar_string, env, states_string };
}

async function writeFile(name, ext, data = "", dir = process.env.PWD, type) {

    try {
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);

        //Save existing file as a backup file if it exists
        try {
            const data = await fsp.readFile(path.join(dir, name));
            let increment = 0;

            while (1) {
                try {
                    try {
                        while (await fsp.readFile(path.join(dir, name + ".hcgb_" + increment))) { increment++; }
                    } catch (e) { }

                    let a = await fsp.writeFile(path.join(dir, name + ".hcgb_" + increment), data, { encoding: "utf8", flags: "wx" });

                    break;
                } catch (e) {
                    console.error(e);
                    increment++;
                }
            }

        } catch (e) { }

        let file = "";

        if (type == "cpp") {
            //Split C++ string into header and definition

            const [header, definition] = data.split("/--Split--/");

            await fsp.writeFile(path.join(dir, name + ".h"), header, { encoding: "utf8", flags: "w+" });
            await fsp.writeFile(path.join(dir, name + ".cpp"), `#include "./${name}.h" \n ${definition}`, { encoding: "utf8", flags: "w+" });

            //Copy C++ files into same directory
            const tokenizer = await fsp.readFile(path.join("/",
                import.meta.url.replace(fn_regex, ""), "../cpp/tokenizer.h"), "utf8");
            const parser = await fsp.readFile(path.join("/",
                import.meta.url.replace(fn_regex, ""), "../cpp/parser.h"), "utf8");
            const parser_cpp = await fsp.readFile(path.join("/",
                import.meta.url.replace(fn_regex, ""), "../cpp/parser.cpp"), "utf8");
            const parse_buffer = await fsp.readFile(path.join("/",
                import.meta.url.replace(fn_regex, ""), "../cpp/parse_buffer.h"), "utf8");
            const node_utils = await fsp.readFile(path.join("/",
                import.meta.url.replace(fn_regex, ""), "../cpp/node_utils.h"), "utf8");
            const error_codes = await fsp.readFile(path.join("/",
                import.meta.url.replace(fn_regex, ""), "../cpp/parse_error_codes.h"), "utf8");
            await fsp.writeFile(path.join(dir, "tokenizer.h"), tokenizer, { encoding: "utf8", flags: "w+" });
            await fsp.writeFile(path.join(dir, "parse_buffer.h"), parse_buffer, { encoding: "utf8", flags: "w+" });
            await fsp.writeFile(path.join(dir, "parser.cpp"), parser_cpp, { encoding: "utf8", flags: "w+" });
            await fsp.writeFile(path.join(dir, "parser.h"), parser, { encoding: "utf8", flags: "w+" });
            await fsp.writeFile(path.join(dir, "node_utils.h"), node_utils, { encoding: "utf8", flags: "w+" });
            await fsp.writeFile(path.join(dir, "parse_error_codes.h"), error_codes, { encoding: "utf8", flags: "w+" });
        } else {
            file = await fsp.writeFile(path.join(dir, name + ext), data, { encoding: "utf8", flags: "w+" });
        }

        console.log(ADD_COLOR(`The file ${name} has been successfully written to ${dir}.`, COLOR_SUCCESS), "\n");
    } catch (err) {
        console.log(ADD_COLOR(`Filed to write ${name} to {${dir}}`, COLOR_ERROR), "\n");
        console.error(err);
    }
}

/* *************** HCG GRAMMAR DATA *********************/

async function parseGrammar(grammar_string, grammar_path_string) {
    const grammar = await hc.compileGrammars(grammar_string, grammar_path_string);

    return grammar;
}

/* *************** RUNTIME ********************/

function CLI_INSTRUCTIONS(full = false) {
    console.log(`\nType something then hit {${ADD_COLOR(" enter ", COLOR_KEYBOARD)}||${ADD_COLOR(" return ", COLOR_KEYBOARD)}} to see how the parser performs on that input`);
    console.log(`Type 'reload' to update the parser with new file changes.`);
    console.log(`Type 'help' to show help info.`);
}

async function mount(name, input, env, test_data = "", nul, debug_info = "") {

    if (debug_info)
        debug = hc.ImportStates(debug_info);

    let d = await new Promise(res => {
        let parser_data = null;

        if (typeof input !== "string") {
            parser_data = input;
        } else {

            try {
                parser_data = ((Function("return " + input))());
            } catch (e) {
                console.dir(e, { depth: null });
                return res(false);
            }

        }

        //If there is test data, then run the parser on that data and immediately return. 
        if (typeof test_data == "string" && test_data.length > 0) {
            const result = parser(wind(test_data.toString(), false), parser_data, env, debug_info);

            if (result.error)
                console.error({ error: result.error });

            console.dir(result.value, { depth: null });

            res(false);
        } else {
            const r1 = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            console.log(ADD_COLOR("The parser has been mounted in NodeJS", COLOR_SUCCESS));
            CLI_INSTRUCTIONS();

            let data = [];




            r1.on('line', (input) => {

                if (input == "exit") {
                    r1.close();
                    return res(false);
                }

                if (input == "reload") {
                    r1.close();
                    return res(true);
                }

                if (input == "help") {
                    CLI_INSTRUCTIONS(true);
                    r1.prompt();
                    return;
                }

                if (input == " ") {

                    try {
                        let parse;
                        if (env.options && env.options.integrate)
                            parse = parser(data.join("\n"), parser_data, {}, debug_info);
                        else {
                            parse = parser(wind(data.join("\n"), false), parser_data, env, debug_info);

                            if (parse.error) throw parse.error;

                            console.dir(parse.value, { depth: null });
                        }
                    } catch (e) {
                        console.error(e);
                    }

                    data = [];
                } else {
                    data.push(input);
                }


                r1.prompt();
            });

            r1.prompt();
        }
    });

    if (d)
        console.log(ADD_COLOR(`Reloading ${name}`, COLOR_SUCCESS));

    return d;
}


/* ************* PROGRAM ************************/
async function start() {

    await URL.server();

    const program = commander.default;

    program
        .version("0.6.0");

    program
        .command("mount <hydro_carbon_compiled_file>")
        .description("Mounts a HC compiler into the NodeJS context")
        .option("-s, --string <string_data>", "Optional string to pass to the parser. Will exit after printing parser results")
        .option("-e, --env <path>", "Optional JavaScript file containing parsing environment information.")
        .action(async (hc_compiler, cmd) => {

            const
                compiler_path = path.resolve(hc_compiler),
                string = cmd.string,
                env_path = cmd.env ? path.resolve(cmd.env) : "",
                env = await loadEnvironment(env_path),
                compiler = (await import(compiler_path)).default;

            console.log(cmd.string);

            mount("undefined", compiler, env, string);
        });

    program
        .command("compile-hybrid <hydrocarbon_grammar_file>")
        .description("Compiles a hybrid JavaScript and WASM parser from a HydroCarbon grammar file, an optional HCGStates file, and an optional ENV.js file")
        .option("--wasm_dir <wasm_dir>", "Folder path to place wasm and wat files. Defaults to `./wasm/`")
        .option("--ts_dir <ts_dir>", "Folder path to place TypeScript files. Defaults to `./ts/`")
        .option("--loader_path <loader_path>", "Import path for the recognizer memory loader.")
        .option("-o, --optimize", "Optimize output file.")
        .option("-a, --annotations", "Add annotated comments to recognizer.ts.")
        .action(async (hc_grammar, cmd) => {
            const
                grammar_path = path.resolve(hc_grammar),
                wasm_output_dir = cmd.wasm_dir,
                ts_output_dir = cmd.ts_dir,
                loader_path = cmd.loader_path,
                optimize = !!cmd.optimize,
                add_annotations = !!cmd.annotations,
                compiler_options = {
                    wasm_output_dir: wasm_output_dir || "./wasm",
                    ts_output_dir: ts_output_dir || "./ts",
                    memory_loader_url: loader_path || "@candlefw/hydrocarbon",
                    optimize,
                    combine_wasm_with_js: true,
                    create_function: true,
                    add_annotations,
                    number_of_workers: 10
                },

                { grammar_string, env } = await loadFiles(grammar_path, "", "", true),

                grammar_url = new URL(grammar_path),

                grammar = await parseGrammar(grammar_string, grammar_url);

            console.log(grammar.meta);

            //console.log({ grammar_url, grammar: grammar.meta });
            compileHybrid(grammar, env, compiler_options);
        });

    program.parse(process.argv);
}

start();