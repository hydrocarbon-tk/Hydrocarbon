#!/bin/sh

":" //# comment; exec /usr/bin/env node --max-old-space-size=8192 --experimental-modules "$0" "$@"

/* IMPORTS *******************/

//CandleFW stuffs
import * as hc from "./hydrocarbon.mjs";
import whind from "@candlefw/whind";

import runner from "./compiler_worker.mjs"

//Third Party stuff
import * as commander from "commander";
import * as terser from "terser";

//Node stuffs
import path from "path";
import fs from "fs";
import readline from "readline";

//Regex to match Protocol and/or Drive letter from module url
const fn_regex = /(file\:\/\/)(\/)*([A-Z]\:)*/g

const Lexer_Path = path.join("/",
    import.meta.url.replace(fn_regex, ""), "../../node_modules/@candlefw/whind/build/whind.js");
const LEXER_SCRIPT = `${fs.readFileSync(Lexer_Path)} const lexer = whind.default;`;


/*** BASH COLORS ****/
const COLOR_ERROR = `\x1b[41m`,
    COLOR_KEYBOARD = `\x1b[38;5;15m\x1b[48;5;246m`,
    COLOR_SUCCESS = `\x1b[38;5;254m\x1b[48;5;30m`,
    COLOR_RESET = `\x1b[0m`,
    ADD_COLOR = (str, color) => color + str + COLOR_RESET,
    fsp = fs.promises,
    name = "";

let grammar_string = "";

/* ****************** HC STUFF *********************/
async function loadEnvironment(env_path = "") {
    let env = { functions: {} };

    //check for optional env file
    if (env_path) {
        let ext = env_path.split(".").reverse()[0];

        env = (await import(env_path)).default;
    }


    return env;
}


/******************** FILE HANDLING ***************************/



async function loadFiles(grammar_path, env_path = "", states_path = "") {

    let grammar_string = "", states_string = "";

    try {
        grammar_string = await fsp.readFile(grammar_path, "utf8");
    } catch (err) {
        console.error(err);
        throw new Error(`Unable to open the grammar file ${grammar_path}`);

    }

    if(states_path){
        try {
            states_string = await fsp.readFile(states_path, "utf8");
        } catch (err) {
            console.error(err);
            throw new Error(`Unable to open the states file ${states_path}`);
        }
    }

    const env = await loadEnvironment(env_path);

    return { grammar_string, env, states_string};
}

async function write(name, parser_script, output_directory, type) {
    let filename = name;

    switch (type) {
        case "mjs":
            filename += ".mjs";
            break;
        case "cjs":
            filename += "_cjs.js";
            break;
        default:
        case "js":
            filename += ".js";
            break;
    }

    await writeFile(filename, parser_script, output_directory);
}

async function writeFile(name,  data = "", dir = process.env.PWD) {

    try{
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);

        let file = await fsp.writeFile(path.join(dir, name), data, { encoding: "utf8", flags: "w+" })
         console.log(ADD_COLOR(`The file ${name} has been successfully written to ${dir}.`, COLOR_SUCCESS), "\n");
    }catch(err){
        console.log(ADD_COLOR(`Filed to write ${name} to {${dir}}`, COLOR_ERROR), "\n");
        console.error(err);
    }
}


function createScript(name, parser, type, env, compress = false) {

    if (env.options && env.options.integrate)
        parser = hc.StandAloneParserCompiler(parser, LEXER_SCRIPT, env);

    switch (type) {
        case "mjs":
            parser = `${parser}; export default parser;`;
            break;
        case "cjs":
            parser = `${parser}; module.exports = parser;`;
            break;
        default:
        case "js":
            parser = `${parser}; const ${name} = parser;`;
            break;
    }



    if (compress)
        return terser.default.minify(parser).code;

    return parser;
}

/* *************** HCG GRAMMAR DATA *********************/

function parseGrammar(grammar_string, env) {
    return hc.grammarParser(grammar_string, env);
}

/* *************** LR GRAMMARS ********************/

function stringifyLRStates(states) {
    return hc.ExportStates(states);
}

function parseLRJSONStates(states_string) {
    return hc.ImportStates(states_string);
}

async function compileLRStates(grammar, env, name) {
    return await runner(grammar, env, name);
}

function buildLRCompilerScript(states, parsed_grammar, env) {
    return hc.LRParserCompiler(states, parsed_grammar, env);
}

/* ************* RUNTIME ************************/

function CLI_INSTRUCTIONS(full = false) {
    console.log(`\nType something then hit {${ADD_COLOR(" enter ", COLOR_KEYBOARD)}||${ADD_COLOR(" return ", COLOR_KEYBOARD)}} to see how the ${name} parser performs on that input`)
    console.log(`Type 'reload' to update the parser with new file changes.`)
    console.log(`Type 'help' to show help info.`)
}

async function mount(name, input, env) {

    let d = await new Promise(res => {

        const parser = ((Function(input + "; return parser"))());

        const r1 = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });


        console.log(ADD_COLOR("The parser has been mounted in NodeJS", COLOR_SUCCESS))
        CLI_INSTRUCTIONS();

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

            try {
                if (env.options && env.options.integrate)
                    console.dir(parser(input));
                else
                    console.dir(parser(whind(input, true), env));
            } catch (e) {
                console.error(e);
            }

            r1.prompt();
        });

        r1.prompt();
    });

    if (d)
        console.log(ADD_COLOR(`Reloading ${ name }`, COLOR_SUCCESS));

    return d;
}


/* ************* PROGRAM ************************/

const program = commander.default;

program
    .version("0.0.3")
    .parse(process.argv);

program
    .command("table <hydrocarbon_grammar_file>")
    .option("-s, --states <states>", "Use a *.hcs file from a previous compilation instead of a compiling the grammar file.")
    .option("-o, --output <path>", "Optional output location. Defaults to CWD.")
    .option("-os, --output_states", "Output a *.hcs file.")
    .description("Parses grammar and outputs a UTF representation of the parse table.")
    .action(async (hc_grammar, cmd) => {
        const
            states_path = cmd.states ? path.resolve(cmd.states) : "",
            output_directory = cmd.output ? path.resolve(cmd.output) : process.cwd(),
            grammar_path = path.resolve(hc_grammar);

        try {
            const { grammar_string, env, states_string } = await loadFiles(grammar_path, "", states_path);

            let states;

            const grammar = parseGrammar(grammar_string, env)

            if(states_string){
                states = parseLRJSONStates(states_string);
            }else{
                states = await compileLRStates(grammar, env);
                if(!!cmd.output_states){
                    states_output = stringifyLRStates(states);
                    writeFile(`${name}.hcs`, states_output, output_directory);
                }
            }

            console.log(hc.renderTable(states, grammar));

            console.log(`Use ${ADD_COLOR(" ctrl ", COLOR_KEYBOARD)}+${ADD_COLOR(" c ", COLOR_KEYBOARD)} to return to console,`)

        } catch (err) {
            console.error(err);
            throw new Error(`
            Unable to open the grammar file $ { grammar_path }
            `);
        }
    });

program
    .command("mount <hydro_carbon_compiled_file>")
    .description("Mounts a HC compiler into the NodeJS context")
    .option("-e, --env <path>", "Optional JavaScript file containing parsing environment information.")
    .action(async (hc_compiler, cmd) => {

        const
            compiler_path = path.resolve(hc_compiler),
            env_path = cmd.env ? path.resolve(cmd.env) : "",
            env = await loadEnvironment(env_path),
            compiler = await fsp.readFile(compiler_path, "utf8");

        mount("undefined", compiler, env)


    });

program
    .command("compile <hydrocarbon_grammar_file>")
    .description("Compiles a JavaScript parser from a HydroCarbon grammar file, an optional HCGStates file, and an optional ENV.js file")
    .option("-o, --output <path>", "Optional output location. Defaults to CWD.")
    .option("--statesout", "Output a *.hcs file.")
    .option("-s, --states <states>", "Use a *.hcs file from a previous compilation instead of a compiling the grammar file.")
    .option("-e, --env <path>", "Optional JavaScript file containing parsing environment information.")
    .option("-m, --mount", "Mounts the compiled parser in the current NodeJS context and allows interactive parsing of user input.")
    .option("-n, --name <output_name>", "The name to give to the output file. Defaults to the name of the grammar file.")
    .option("-d, --noout", "Do note write to file.")
    .option("-c, --compress", "Minify output file.")
    .option("-t, --type <type>", `
            Type of file to output.The type can be:
            "mjs" - ( * .mjs) A module file
            for use with the modern ES2016 module syntax.
            "cjs" - ( * .c.js) A CommonJS module
            for use with NodeJS and other consumers of CommonJS.
            "js" - ( * .js)[Default] A regular JavaScript file that can be embedded in HTML.The parser will be available as a global value.The name of the global object will be same as the output file name.
            `)
    .action(async (hc_grammar, cmd) => {
        const
            states_path = cmd.states ? path.resolve(cmd.states) : "",
            grammar_path = path.resolve(hc_grammar),
            env_path = cmd.env ? path.resolve(cmd.env) : "",
            name = cmd.output_name ? cmd.output_name : path.basename(grammar_path, path.extname(grammar_path)),
            type = cmd.type ? cmd.type : "js",
            output_directory = cmd.output ? path.resolve(cmd.output) : process.cwd(),
            COMPRESS = !!cmd.compress;


        try {

            const { grammar_string, states_string, env } = await loadFiles(grammar_path, env_path, states_path);

            const grammar = parseGrammar(grammar_string, env)

            let states = null;
            
            if(states_string){
                states = parseLRJSONStates(states_string);
            }else{

                states = await compileLRStates(grammar, env, name);

                if(!!cmd.statesout){
                    const states_output = stringifyLRStates(states);
                    await writeFile(`${name}.hcs`, states_output, output_directory);
                }
            }
            
            const script_string = buildLRCompilerScript(states, grammar, env);

            const script = createScript(name, script_string, type, env, COMPRESS);

            console.log(ADD_COLOR(`The ${name} parser has been successfully compiled!`, COLOR_SUCCESS), "\n");

            if (!!cmd.noout) {
                console.log(ADD_COLOR("No Output. Skipping file saving", COLOR_ERROR), "\n");
            } else
                await write(name, script, output_directory, type);

            console.log(`Use ${ADD_COLOR(" ctrl ", COLOR_KEYBOARD)}+${ADD_COLOR(" c ", COLOR_KEYBOARD)} to return to console.`)

            if (!!cmd.mount && !(await mount(name, script, env)))
                return;
            else
                return;

        } catch (e) {
            console.error(e);
        }

    });

program.parse(process.argv);
