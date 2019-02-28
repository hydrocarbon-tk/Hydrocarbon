export function StandAloneParserCompiler(compiler_script, lexer_script, env) {

    if (!env.options || !env.options.integrate || !lexer_script)
        return compiler_script;

    //Get requirements
    const in_function = (typeof env.onInput == "function") ? env.onInput.toString().replace(/(anonymous)?[\n\t]*/g, "") : `e=>e`;
    const out_function = (typeof env.onOutput == "function") ? env.onOutput.toString().replace(/(anonymous)?[\n\t]*/g, "") : `e=>e`;
    const setup_function = (typeof env.setup == "function") ? env.setup.toString().replace(/(anonymous)?[\n\t]*/g, "") : `()=>{}`;

    const output =
`const parser = ((()=>{
${compiler_script}
${lexer_script}
const _in = ${in_function};
const _out = ${out_function};
const setup = ${setup_function};

const HAVE_PROCESS = typeof(process) !== "undefined";
const HAVE_REQUIRE = typeof(require) !== "undefined";

function parse(input){
	let env = {};
	if(HAVE_PROCESS)
		env.process = process
	setup(env);
	let lex = lexer(_in(input, env));
	return _out(parser(lex),env);
}

if(HAVE_PROCESS && HAVE_REQUIRE){
	let input = process.argv[2]
	const path = require("path");
	const fs = require("fs");
	const input_file_path = path.resolve(input);
	console.log(input_file_path)

	fs.readFile(input_file_path, "utf8", (err, str)=>{
		if(err)
			throw err;

		return parse(str);
	})

}

return parse})())
`;

    return output;
}
