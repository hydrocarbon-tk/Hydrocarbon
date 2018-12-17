#!/usr/bin/env node --experimental-modules

/* IMPORTS *******************/

//CandleFW stuffs
import * as hc from "./hydrocarbon.mjs";
import whind from "@candlefw/whind";

//Third Party stuffs
import * as commander from "commander";
import * as terser from "terser";

//Node stuffs
import path from "path";
import fs from "fs";
import readline from "readline";

const fsp = fs.promises;

/* ****************** HC STUFF *********************/

function write(name, parser_file, options, MOUNT = false) {
    let filename = name;
    let dir = path.resolve(options.dir);
    let data = parser_file;

    

    switch (options.type) {
        case "mjs":
            data = `${data}; export default parser;`;
            filename += ".mjs";
            break;
        case "cjs":
            data = `${data}; module.exports = parser;`;
            filename += "_cjs.js";
            break;
        default:
        case "js":
            data = `${data}; const ${name} = parser;`;
            filename += ".js";
            break;
    }

    //compress data if necessary
    if(true || options.compress)
    	data = terser.default.minify(data);

    console.log(`Writing file to ${path.join(dir, filename)}`);

    if (!fs.existsSync(dir))
	    fs.mkdirSync(dir);
	
    fsp.writeFile(path.join(dir, filename), data, { encoding: "utf8", flags:"w+"})
        .then(res => {
            console.log("File has been successfully written!");
        }).catch(err => {
            console.error(err);
        }).then(()=>{
            if(MOUNT)
                mount(name, parser_file);
        });
}

function build(name, grammar_text, env) {
    let grammar = hc.grammarParser(grammar_text, env);
    let table = hc.LALRTable(grammar, env);
    let output = hc.LRParserCompiler(table, env);

    console.log(`The ${name} parser has been successfully compiled!`);

    return output;
}

function mount(name, input) {
    const parser = ((Function(input + "; return parser"))());

    const r1 = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log(`Type in some text to see how the ${name} parser performs on that input (type 'exit' to end this step):`);

    r1.on('line', (input) => {
        if (input == "exit") {
            r1.close();
            return;
        }


        try {
            console.dir(parser(whind(input), {}));
        } catch (e) {
            console.error(e);
        }
        r1.prompt();
    });

    r1.prompt();
}

/* ************* PROGRAM ************************/

const program = commander.default;

program
    .version("0.0.1")
    .parse(process.argv);

program
    .command("mount <hydro_carbon_compiled_file>")
    .description("Mounts a given file into the NodeJS context")
    .action(() => {

    });

program
    .command("compile <hydrocarbon_grammar_file>")
    .description("Compiles a JavaScript parser from a HydroCarbon grammar file and an optional ENV.js file")
    .option("-o, --output <path>", "Optional output location. Defaults to CWD.")
    .option("-e, --env <path>", "Optional JavaScript file containing parsing environment information.")
    .option("-m, --mount", "Mounts the compiled parser in the current NodeJS context and allows interactive parsing of user input.")
    .option("-n, --name <output_name>", "The name to give to the output file. Defaults to the name of the grammar file.")
    .option("-t, --type <type>", `Type of file to output.
	The type can be:
		"mjs" - (*.mjs) A module file for use with the modern ES2016 module syntax.
		"cjs" - (*_cjs.js) A CommonJS module for use with NodeJS and other consumers of CommonJS.
		"js"  - (*.js) [Default] A regular JavaScript file. 
				The parser will be available as a global value. 
				The name of the global object will be same as the output file name. 
`)
    .action((hc_grammar, cmd) => {
        let grammar_path = path.resolve(hc_grammar);
        let name = cmd.output_name ? cmd.output_name : path.basename(grammar_path, path.extname(grammar_path));
        let type = cmd.type ? cmd.type : "js";
        let output_directory = cmd.output ? path.resolve(cmd.output) : process.cwd;
        let options = { type, dir: output_directory }

        const MOUNT = !!cmd.mount;
        //attempt to read the file
        fsp.readFile(grammar_path, "utf8")
            .then((result) => {

                let grammar = result;
                let env = {};

                //check for optional env file
                if (cmd.env) {
                    let env_path = path.resolve(cmd.env);

                    fsp.readFile(env_path, "utf8")
                        .then((result) => {
                            let env = {};
                            try {
                                env = (Function(result + "; return env;"))();
                            } catch (e) {
                                console.error(e);
                                console.log("Continuing without environment");
                            }
                            return env;
                        }).catch(err => {
                            console.error(`Unable to open the environment file ${env_path}`, err);
                            console.log("Continuing without environment");
                            return {};
                        }).then(env => {
                            let parser = build(name, grammar, env);

                            write(name, parser, options, MOUNT);
                        });
                } else {
                    let parser = build(name, grammar, env);

                    write(name, parser, options, MOUNT);

                }
            })
            .catch(err => {
                console.error(err);
                throw new Error(`Unable to open the grammar file ${grammar_path}`);
            });
    });

program.parse(process.argv);