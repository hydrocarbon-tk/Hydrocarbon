#!/usr/bin/env node

//CandleFW stuffs
import URL from "@candlelib/url";
import * as hc from "../../build/library/hydrocarbon.js";

//Third Party stuff
import * as commander from "commander";

//Node stuffs
import path from "path";
import fs from "fs";
import { compile } from "../../build/library/compiler/compiler.js";

//Regex to match Protocol and/or Drive letter from module url
const fsp = fs.promises;

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


/* *************** HCG GRAMMAR DATA *********************/

async function parseGrammar(grammar_string, grammar_path_string) {
    const grammar = await hc.compileGrammars(grammar_string, grammar_path_string);

    return grammar;
}

/* ************* PROGRAM ************************/
async function start() {

    await URL.server();

    const program = commander.default;

    program
        .version("0.6.0");

    program
        .command("compile <hydrocarbon_grammar_file>")
        .description("Compiles a parser from a HydroCarbon grammar file")
        .option("--nom <nom>", "Name to give the parser file. Defaults to 'parser'")
        .option("--output_dir <output_dir>", "Output directory for parser. Defaults to the CWD")
        .option("--completer_type <completer>", "Type of recognizer to create may either be 'ts' or 'js'. Default to 'js'")
        .option("--recognizer_type <recognizer>", "Type of recognizer to create may either be 'wasm' or 'js'. Default to 'js'")
        .option("--workers <workers>", "Number of worker threads used to compiler parser. Defaults to 1")
        .option("--annotations", "Add annotated comments to recognizer. Only applicable when the recognizer is a `js` type.")
        .option("--debug", "Add debugging code to parser. Only applicable when the recognizer is a `js` type.")
        .option("--loader_path <loader_path>", "[INTERNAL USE ONLY]")
        .action(async (hc_grammar, cmd) => {

            const
                name = cmd.nom || "parser",
                loader_path = ["ALTERNATE"].includes(cmd.loader_path)
                    ? "../runtime/parser_memory.js"
                    : "@candlelib/hydrocarbon",
                workers = parseInt(cmd.workers),
                grammar_path = path.resolve(hc_grammar),
                output_dir = cmd.output_dir || "./",
                recognizer = { js: "js", wasm: "wasm" }[cmd.recognizer_type] || "js",
                completer = { js: "js", ts: "ts" }[cmd.completer] || "js",
                ADD_ANNOTATIONS = recognizer == "js" && !!cmd.annotations,
                debug = recognizer == "js" && !!cmd.debug,
                compiler_options = {
                    name,
                    recognizer_type: recognizer,
                    completer_type: completer,
                    output_dir: output_dir,
                    memory_loader_url: loader_path || "@candlelib/hydrocarbon",
                    optimize: true,
                    combine_recognizer_and_completer: true,
                    ADD_ANNOTATIONS,
                    debug,
                    number_of_workers: workers || 1
                };

            const { grammar_string, env } = await loadFiles(grammar_path, "", "", true);

            const grammar_url = new URL(grammar_path);

            const grammar = await parseGrammar(grammar_string, grammar_url);

            compile(grammar, env, compiler_options);
        });

    program.parse(process.argv);
}

start();