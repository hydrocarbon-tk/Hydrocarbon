# cfw.Hydrocarbon

## Compile LALR Parsers

Hydrocarbon is a LALR and GLALR parser compiler that uses a self hosted, custom grammar that is inspired by Backus-Naur syntax.

You can review the Hydrocarbon grammar definition in [./source/grammars/hcg](./source/grammars/hcg/hcg.hcg). The definition is split across 5 files starting with **hcg.hcg**.

The primary reason this exists is to provide a flexible parser compiler to handle the parsing demands of the CandleFW libraries Wick, JS, and CSS. It provides a way to rapidly define new syntax and compile grammars of different languages into one meta-parser.

## Compile

### ``compile <hydrocarbon_grammar_file>``

Compiles a JavaScript parser from a HydroCarbon grammar file

#### Output Path
`-o, --output <path>` Optional output location. Defaults to current directory.
--statesout, Output a \*.hcs file.

#### States File
`[-s | --states] <states>`  
	Use a \*.hcs file from a previous compilation instead of a compiling the grammar file.

#### Environment File
`[-e | --env] <path>`  
	Optional JavaScript file containing parsing environment information.

#### Mount
`[-m | --mount]`  
	Mounts the compiled parser in the current NodeJS context and allows interactive parsing of command line input.

#### Grammar Name
`[-n | --name] <output_name>`, 
	The name to give to the output file. Defaults to the name of the grammar file.

#### Skip Output
`[-d | --no-out]`  
	Skip writing to file.

#### Compress
`[-c |--compress ]`
	Minify output file.

#### Unattended Compilation
`[-u |--unattended ]`  
	Do not wait for user input. Exit to console when compilation is complete. Quits on errors.

#### Generated File Type
`[-t |--type] <type> `
        Type of file to output.The type can be:
        "mjs" - ( \* .mjs) A module file
        for use with the modern ES2016 module syntax.
        "cjs" - ( \* .c.js) A CommonJS module
        for use with NodeJS and other consumers of CommonJS.
        "js" - ( \* .js)[Default] A regular JavaScript file that can be embedded in HTML.The parser will be available as a global value.The name of the global object will be same as the output file name.

#### Parser Type
`--parser <parser>` The type of compiler that hydrocarbon will create. Select from `lalr1` and `earling`


# License

[MIT](./LICENSE)

