#! /bin/sh

":" //# comment; exec /usr/bin/env node --experimental-modules "$0" "$@"

/* IMPORTS *******************/

//CandleFW stuffs
import * as hc from "../hydrocarbon.mjs";
import whind from "@candlefw/whind";

import runner from "./compiler_worker.mjs"

//Third Party stuff
import * as commander from "commander";
import * as terser from "terser";

//Node stuffs
import path from "path";
import fs from "fs";
import readline from "readline";
import util from "util";

//Regex to match Protocol and/or Drive letter from module url
const
    fn_regex = /(file\:\/\/)(\/)*([A-Z]\:)*/g,
    Lexer_Path = path.join("/",
        import.meta.url.replace(fn_regex, ""), "../../../node_modules/@candlefw/whind/build/whind.js"),
    LEXER_SCRIPT = `${fs.readFileSync(Lexer_Path)} const lexer = whind.default;`,
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
        console.error(err);
        throw new Error(`Unable to open the grammar file ${grammar_path}`);

    }

    if (states_path) {
        try {
            states_string = await fsp.readFile(states_path, "utf8");
        } catch (err) {
            console.error(err);
            throw new Error(`Unable to open the states file ${states_path}`);
        }
    }

    const env = await loadEnvironment(env_path);

    return { grammar_string, env, states_string };
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

async function writeFile(name, data = "", dir = process.env.PWD) {

    try {
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);

        let file = await fsp.writeFile(path.join(dir, name), data, { encoding: "utf8", flags: "w+" })
        console.log(ADD_COLOR(`The file ${name} has been successfully written to ${dir}.`, COLOR_SUCCESS), "\n");
    } catch (err) {
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

async function compileLRStates(grammar, env_path, name, unattended) {
    return await runner(grammar, env_path, name, unattended);
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

            if (input == "parse") {


                try {
                    let parse;
                    if (env.options && env.options.integrate)
                        parse = parser(data.join("\n"));
                    else
                        parse = parser(whind(data.join("\n"), true), env);

                    console.log(util.inspect(parse, false, null, true))
                } catch (e) {
                    console.error(e);
                }

                data = [];
            } else {
                data.push(input);
                console.clear();
                console.log(data.join("\n"))
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

            if (states_string) {
                states = parseLRJSONStates(states_string);
            } else {
                states = await compileLRStates(grammar, env);
                if (!!cmd.output_states) {
                    states_output = stringifyLRStates(states);
                    writeFile(`${name}.hcs`, states_output, output_directory);
                }
            }

            if (!states.COMPILED) {
                (console.error(`Failed to compile grammar ${grammar.name}. Exiting`), undefined);
                process.exit(1)
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
    .option("-u, --unattended", "Do not wait for user input. Exit to console when compilation is complete. Quit on any error.")
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
            unattended = !!cmd.unattended,
            COMPRESS = !!cmd.compress;
        try {

            const { grammar_string, states_string, env } = await loadFiles(grammar_path, env_path, states_path, unattended);

            const grammar = parseGrammar(grammar_string, env)

            let states = null;

            if (states_string) {
                states = parseLRJSONStates(states_string, unattended);
            } else {

                states = await compileLRStates(grammar, env_path, name, unattended);

                if (!!cmd.statesout) {
                    const states_output = stringifyLRStates(states);
                    await writeFile(`${name}.hcs`, states_output, output_directory);
                }
            }

            if (!states.COMPILED) {
                console.log(states);
                (console.error(`Failed to compile grammar ${grammar.name}. Exiting`), undefined);
                process.exit(1)
            }


            const script_string = buildLRCompilerScript(states, grammar, env);


            const script = createScript(name, script_string, type, env, COMPRESS);

            console.log(ADD_COLOR(`The ${name} parser has been successfully compiled!`, COLOR_SUCCESS), "\n");

            if (!!cmd.noout) {
                console.log(ADD_COLOR("No Output. Skipping file saving", COLOR_ERROR), "\n");
            } else
                await write(name, script, output_directory, type);


            if(!unattended){
                
                console.log(`Use ${ADD_COLOR(" ctrl ", COLOR_KEYBOARD)}+${ADD_COLOR(" c ", COLOR_KEYBOARD)} to return to console.`)

                if (!!cmd.mount) {
                    if (!(await mount(name, script, env)))
                        {};
                } 
            }

            process.exit();

        } catch (e) {
            console.error(e);
        }

    });

program.parse(process.argv);