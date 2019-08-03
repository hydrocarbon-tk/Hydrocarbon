# CandleFW Hydrocarbon


Parses HC Grammars.

HC grammar - based on BNS syntax
 
View template.hgc for info on the syntax.


# usage

## Compile

### ``compile <hydrocarbon_grammar_file>``

Compiles a JavaScript parser from a HydroCarbon grammar file, an optional HCGStates file, and an optional ENV.js file.

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
	Mounts the compiled parser in the current NodeJS context and allows interactive parsing of user input.

#### Grammar Name
`[-n | --name] <output_name>`, 
	The name to give to the output file. Defaults to the name of the grammar file.

#### Skip Output
`[-d | --noout]`  
	Skip writing to file.

#### Compress
`[-c |--compress ]`
	Minify output file.

#### Unattended Compilation
`[-u |--unattended]`  
	Do not wait for user input. Exit to console when compilation is complete. Quits on any error.

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
