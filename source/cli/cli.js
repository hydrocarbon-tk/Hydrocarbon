#!/usr/bin/env node


/* IMPORTS *******************/


//CandleFW stuffs
import wind from "@candlefw/wind";
import URL from "@candlefw/url";
import * as hc from "../../build/library/hydrocarbon.js";
import { filloutGrammar } from "../../build/library/util/common.js";
import { lrParse as parser } from "../../build/library/lr/runtime/lr_parser.js";


import runner from "./compiler_runner.js";

//Third Party stuff
import * as commander from "commander";
import * as terser from "terser";

//Node stuffs
import path from "path";
import fs from "fs";
import readline from "readline";
import { compileHybrid } from "../../build/library/hybrid/hybrid_compiler.js";

//Regex to match Protocol and/or Drive letter from module url
const
    fn_regex = /(file\:\/\/)(\/)*([A-Z]\:)*/g,
    Lexer_Path = path.join("/",
        import.meta.url.replace(fn_regex, ""), "../../../data/wind"),
    LEXER_SCRIPT = "",//`${fs.readFileSync(Lexer_Path)} const lexer = wind.default;`,
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

async function write(name, parser_script, output_directory = process.env.PWD, type, debug_info, debug_dir) {
    let ext = "";

    switch (type) {
        case "cpp":
            ext = ".h";
            break;
        case "mjs":
            ext = ".js";
            break;
        case "cjs":
            ext = "_cjs";
            break;
        default:
        case "js":
        case "module":
            ext = ".js";
            break;
    }

    if (debug_info)
        await fsp.writeFile(path.join(debug_dir, name + ".debug_info.js"), `export default ${debug_info.replace(/\"(\w+)\"\:/g, "$1:")};`, { encoding: "utf8", flags: "wx" });

    await writeFile(name, ext, parser_script, output_directory, type);
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

function createScript(name, parser, type, env, compress = false) {

    //The name argument must be a legitimate JaveScript Identifier symbol.
    //Replace any . characters in the name string with an underscore. 
    name = name.replace(/\./g, "_");

    if (env.options && env.options.integrate && type !== "cpp")
        parser = hc.StandAloneParserCompiler(parser, LEXER_SCRIPT, env);

    switch (type) {
        case "cpp":
            parser = `${parser}`;
            break;
        case "module":
            parser = `export default ${parser};`;
            break;
        case "cjs":
            parser = `module.exports = ${parser};`;
            break;
        default:
        case "iife":
        case "js":
            parser = `const ${name.replace("-", "_")} = ${parser};`;
            break;
    }

    if (compress && type !== "cpp")
        return terser.default.minify(parser).code;

    return parser;
}

/* *************** HCG GRAMMAR DATA *********************/

async function parseGrammar(grammar_string, grammar_path_string) {
    const grammar = await hc.compileGrammars(grammar_string, grammar_path_string);

    return grammar;
}

/* *************** LR GRAMMARS ********************/

function stringifyLRStates(states) {
    return hc.ExportStates(states);
}

function parseLRJSONStates(states_string) {
    return hc.ImportStates(states_string);
}

async function compileLRStates(grammar, env, env_path, name, unattended) {
    return await runner(grammar, env, env_path, name, false, unattended);
}

async function compileGLRStates(grammar, env, env_path, name, unattended) {
    return await runner(grammar, env, env_path, name, true, unattended);
}

function buildLRCompilerScriptCPP(states, parsed_grammar, env) {
    return hc.LRParserCompilerCPP(states, parsed_grammar, env);
}

function buildLRCompilerScript(states, parsed_grammar, env) {
    return hc.LRParserCompiler(states, parsed_grammar, env);
}

/* *************** EARLEY ********************/

function createEarleyItems(grammar, env) {
    return hc.earleyItems(grammar, env);
};

function createEarleyCompiler(items, grammar, env) {

};

/* *************** RUNTIME ********************/

function CLI_INSTRUCTIONS(full = false) {
    console.log(`\nType something then hit {${ADD_COLOR(" enter ", COLOR_KEYBOARD)}||${ADD_COLOR(" return ", COLOR_KEYBOARD)}} to see how the parser performs on that input`);
    console.log(`Type 'reload' to update the parser with new file changes.`);
    console.log(`Type 'help' to show help info.`);
}

async function mount(name, input, env, test_data = "", nul, debug_info = "") {
    let debug = null;

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
        .version("0.3.4-dev-1");

    program
        .command("table <hydrocarbon_grammar_file>")
        .option("-s, --states <states>", "Use a *.hcs file from a previous compilation instead of a compiling the grammar file.")
        .option("-o, --output <path>", "Optional output location. Defaults to CWD.")
        .option("-os, --output_states", "Output a *.hcs file.")
        .option("-u, --unattended", "Do not wait for user input. Exit to console when compilation is complete. Quit on any error.")
        .description("Parses grammar and outputs a UTF representation of the parse table.")
        .action(async (hc_grammar, cmd) => {
            const
                states_path = cmd.states ? path.resolve(cmd.states) : "",
                env_path = "",
                unattended = !!cmd.unattended,
                output_directory = cmd.output ? path.resolve(cmd.output) : process.cwd(),
                grammar_path = path.resolve(hc_grammar);

            try {
                const { grammar_string, env, states_string } = await loadFiles(grammar_path, "", states_path);

                let states;

                const grammar = parseGrammar(grammar_string, env);

                if (states_string) {
                    states = parseLRJSONStates(states_string);
                } else {
                    states = await compileLRStates(grammar, env, env_path, "", true);

                    if (!!cmd.output_states) {
                        states_output = stringifyLRStates(states);
                        writeFile(`${name}.hcs`, states_output, output_directory);
                    }
                }

                if (!states.COMPILED) {
                    (console.error(`Failed to compile grammar ${grammar.name}. Exiting`), undefined);
                    process.exit(1);
                }

                console.log(hc.renderTable(states, grammar));

                process.exit(0);

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
                    add_annotations
                },

                { grammar_string, env } = await loadFiles(grammar_path, "", "", true),

                grammar_url = new URL(grammar_path),

                grammar = await parseGrammar(grammar_string, grammar_url);

            console.log(grammar.meta);

            //console.log({ grammar_url, grammar: grammar.meta });
            compileHybrid(grammar, env, compiler_options);
        });

    program
        .command("compile-classic <hydrocarbon_grammar_file>")
        .description("Compiles a JavaScript parser from a HydroCarbon grammar file, an optional HCGStates file, and an optional ENV.js file")
        .option("-o, --output <path>", "Optional output location. Defaults to CWD.")
        .option("--statesout", "Output a *.hcs file.")
        .option("-s, --states <states>", "Use a *.hcs file from a previous compilation instead of a compiling the grammar file.")
        .option("-e, --env <path>", "Optional JavaScript file containing parsing environment information.")
        .option("-m, --mount", "Mounts the compiled parser in the current NodeJS context and allows interactive parsing of user input.")
        .option("-n, --name <output_name>", "The name to give to the output file. Defaults to the name of the grammar file.")
        .option("-d, --noout", "Do not write to file.")
        .option("-c, --compress <test_data>", "Minify output file.")
        .option("-x, --data", "Text input to test the parser on.")
        .option("--cpp", "Create C++ output")
        .option("-u, --unattended", "Do not wait for user input. Exit to console when compilation is complete. Quit on any error.")
        .option("-t, --type <type>", `
            Type of file to output.The type can be:
            "module" - ( * .js) A module file
            for use with the modern ES2016 module syntax.
            "cjs" - ( * .c.js) A CommonJS module
            for use with NodeJS and other consumers of CommonJS.
            "iife" - ( * .js)[Default] A regular JavaScript file that can be embedded in HTML.The parser will be available as a global value.The name of the global object will be same as the output file name.
            `)
        .option("--parser <parser>", "The type of compiler that hydrocarbon will create. Select from `lalr1` and `earley`")
        .action(async (hc_grammar, cmd) => {

            //await spark.sleep(1000);

            const
                states_path = cmd.states ? path.resolve(cmd.states) : "",
                grammar_path = path.resolve(hc_grammar),
                env_path = cmd.env ? path.resolve(cmd.env) : "",
                test_data = cmd.test_data ? cmd.test_data + "" : "",
                name = cmd.output_name ? cmd.output_name : path.basename(grammar_path, path.extname(grammar_path)),
                output_directory = cmd.output ? path.resolve(cmd.output) : process.cwd(),
                unattended = !!cmd.unattended,
                parser = cmd.parser || "lalr1",
                COMPRESS = !!cmd.compress;
            let
                type = cmd.type ? cmd.type : "js";

            try {

                const
                    { grammar_string, states_string, env } = await loadFiles(grammar_path, env_path, states_path, unattended),

                    grammar_url = new URL(grammar_path),

                    grammar = await parseGrammar(grammar_string, grammar_url),

                    //Check for existing debug data

                    debug_info_url = (new URL(grammar_url.dir + "/" + grammar_url.filename + ".debug_info.js"));

                let debug_info_data = null, debug_info = null;

                try {
                    if (debug_info_url.fetchText()) {
                        debug_info = (await import(debug_info_url + "")).default;
                        debug_info_data = hc.ImportStates(debug_info);
                    }
                } catch (e) { console.log("No debug info found"); };

                if (!grammar) {
                    console.error(`Failed to compile grammar ${grammar.name}. Exiting`);
                    process.exit(1);
                }

                let states = null, script_string = "";

                filloutGrammar(grammar, env);

                switch (parser) {
                    case "lr":
                    case "lalr":
                    default:

                        if (debug_info_data?.hash == grammar.hash) {

                            states = debug_info_data.states;

                        } else {

                            //throw "Can't continue"
                            states = await compileLRStates(grammar, env, env_path, name, unattended);
                            debug_info = hc.ExportStates(states, grammar);

                            if (!states.COMPILED) {
                                (console.error(`Failed to compile grammar ${grammar.name}. Exiting`), undefined);
                                process.exit(1);
                            }
                        }

                        script_string = buildLRCompilerScript(states, grammar, env);

                        break;
                    case "glr":
                    case "glalr":
                        if (debug_info_data?.hash == grammar.hash) {
                            states = debug_info_data.states;
                        } else {
                            states = await compileGLRStates(grammar, env, env_path, name, unattended);
                            debug_info = hc.ExportStates(states, grammar);

                            if (!states.COMPILED) {
                                (console.error(`Failed to compile grammar ${grammar.name}. Exiting`), undefined);
                                process.exit(1);
                            }

                        }

                        script_string = buildLRCompilerScript(states, grammar, env);

                        break;

                    case "earley":
                        const items = createEarleyItems(grammar, env);
                        createEarleyCompiler(items, grammar, env);
                        break;
                }


                const script = createScript(name, script_string, type, env, COMPRESS);

                console.log(ADD_COLOR(`The ${name} parser has been successfully compiled!`, COLOR_SUCCESS), "\n");

                if (!!cmd.noout) {
                    console.log(ADD_COLOR("No Output. Skipping file saving", COLOR_ERROR), "\n");
                } else
                    await write(name, script, output_directory, type, typeof debug_info == "string" ? debug_info : null, path.dirname(grammar_path));

                if (!unattended)
                    console.log(`Use ${ADD_COLOR(" ctrl ", COLOR_KEYBOARD)}+${ADD_COLOR(" c ", COLOR_KEYBOARD)} to return to console.`);

                if (!!cmd.mount) {
                    if (!(await mount(name, script_string, env, test_data, "", debug_info))) { };
                }


                process.exit();

            } catch (e) {
                console.error(e);
                process.exit();
            }

        });

    program.parse(process.argv);
}

start();