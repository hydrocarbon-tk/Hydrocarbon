/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { getPackageJsonObject } from "@candlelib/paraffin";
import URI from "@candlelib/uri";
import { Helper } from "../build/helper.js";
import { skRenderAsCPP, skRenderAsJavaScript } from "../skribble/skribble.js";
import { HCG3Grammar } from "../types/grammar_nodes.js";
import { ParserGenerator } from "../types/ParserGenerator.js";
import { RDProductionFunction } from "../types/rd_production_function.js";
import { getProductionFunctionNameSk } from "../utilities/code_generating.js";
import { createExternFunctions, renderSkribbleRecognizer } from "./skribble_recognizer_template.js";

export function buildJSParserStrings(
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper
): {
    recognizer_script: string,
    completer_script: string;
} {
    const recognizer_code = compileRecognizerSource(meta, grammar, recognizer_functions);

    const recognizer_script = skRenderAsJavaScript(recognizer_code);

    const completer_script = renderJavaScriptReduceFunctionLookupArray(grammar);

    return {
        recognizer_script, completer_script
    };
}

export function buildCPPRecognizerSource(
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper
): string {
    const recognizer_code = compileRecognizerSource(meta, grammar, recognizer_functions);

    let recognizer_source = skRenderAsCPP(recognizer_code);

    //Adding forward declaration to get things to cooperate
    const { fn: const_functions_a } = meta.render_constants();

    return `
/*Begin Forward Declarations*/\n
class Lexer;
class ParserData;
class ParserDataBuffer;
${const_functions_a.map(fn => {
        const name = skRenderAsCPP(fn.name);
        const type = skRenderAsCPP(fn.return_type);
        const args = fn.parameters.map(p => skRenderAsCPP(p.primitive_type));
        return `${type} ${name}(${args});`;
    }).join("\n")}

${recognizer_functions.map(fn => {
        const name = getProductionFunctionNameSk(grammar.productions[fn.id], grammar);
        const declarations = [`int ${name}(Lexer&, ParserData&, ParserDataBuffer&, unsigned int, unsigned int, unsigned int);`];
        if (fn.goto)
            declarations.push(`int ${name}_goto(Lexer&, ParserData&, ParserDataBuffer&, unsigned int, unsigned int, unsigned int);`);
        if (fn.reduce)
            declarations.push(`int ${name}_reduce(Lexer&, ParserData&, ParserDataBuffer&, unsigned int, unsigned int, unsigned int);`);
        return declarations.join("\n");
    }).join("\n")}
${""}
/*End Forward Declarations*/

${recognizer_source}`;
}

export async function generateWebAssemblyParser(
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    hydrocarbon_import_path: string = "@candlelib/hydrocarbon",
    export_expression_preamble: string = "export default"
): Promise<string> {

    const child_process = (await import("child_process")).default;

    const fs = (await import("fs")).default;

    const { tmpdir } = await import("os");

    const fsp = fs.promises;


    const
        recognizer_source = buildCPPRecognizerSource(grammar, recognizer_functions, meta),

        completer_script = renderJavaScriptReduceFunctionLookupArray(grammar),

        { package_dir } = await getPackageJsonObject(URI.getEXEURL(import.meta)),
        dir = URI.resolveRelative("./hcg_temp", tmpdir() + "/temp"),
        cpp_file = URI.resolveRelative("./temp.cpp", dir),
        wasm_file = URI.resolveRelative("./temp.wasm", dir),
        script_file = URI.resolveRelative("./scripts/build.sh", package_dir);

    await fsp.mkdir(dir + "", { recursive: true });

    await fsp.writeFile(cpp_file + '', recognizer_source);

    child_process.execFileSync(script_file + "", [cpp_file + "", wasm_file + ""], {
        shell: false,
        cwd: package_dir,
    });

    const wasm_data = new Buffer(await wasm_file.fetchBuffer());

    const line_length = 200;
    const data_lines = [];
    let compressed_data = null;
    compressed_data = [...wasm_data].map(i => ("00" + i.toString(16)).slice(-2)).join("");

    for (let i = 0; i < compressed_data.length; i += line_length) {
        const max_line = Math.min(compressed_data.length - i, line_length);
        data_lines.push(compressed_data.slice(i, i + max_line));
    }

    const data = `${data_lines.map(d => `"${d}"`).join("\n+")}`;

    return `
    ${hydrocarbon_import_path ? `import { ParserFactoryNext as ParserFactory } from "${hydrocarbon_import_path}"` : ""};
    
    const wasm_recognizer = ${data};
    
    const reduce_functions = ${completer_script};
    
    ${export_expression_preamble} ParserFactory(reduce_functions, wasm_recognizer);
    `;
}
/**
 * Constructs a parser string based on grammar and it's build artifacts.
 * 
 * 
 * @param grammar 
 * @param recognizer_functions 
 * @param meta 
 * @param hydrocarbon_import_path - Optional: Adds an import line for Hydrocarbon~ParserFactory
 *  to the top of script. The <hydrocarbon_import_path> will be used to assign the correct
 *  import path from 
 * @returns 
 */
export async function generateJSParser(
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    hydrocarbon_import_path: string = "@candlelib/hydrocarbon",
    export_expression_preamble: string = "export default"
): Promise<string> {

    const { completer_script, recognizer_script } = buildJSParserStrings(
        grammar, recognizer_functions, meta
    );

    return `
    ${hydrocarbon_import_path ? `import { ParserFactoryNext as ParserFactory } from "${hydrocarbon_import_path}"` : ""};
    const recognizer_initializer = (()=>{
        ${recognizer_script};

        return {
            init_data, 
            get_next_command_block,
            init_table,
            get_fork_pointers,
            recognize 
        };
    });

    const reduce_functions = ${completer_script};

    ${export_expression_preamble} ParserFactory(reduce_functions, undefined, recognizer_initializer);
    `;
}

/**
 * 
 * @param file_path - Fully resolved file path for completed parser file.
 * @param grammar - The parser grammar object
 * @param recognizer_functions  - The built recognizer production function artifacts
 * @param meta  - The built recognizer common artifacts
 * @param hydrocarbon_import_path - [Optional] the import path to the hydrocarbon runtime script
 * @param fn_parser_generator - [Optional] A ParserGenerator function
 * @returns 
 */
export async function writeParserScriptFile(
    file_path: string,
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    hydrocarbon_import_path: string = "@candlelib/hydrocarbon",
    fn_parser_generator: ParserGenerator = generateJSParser
): Promise<boolean> {

    const fs = (await import("fs")).default;

    const fsp = fs.promises;

    const file_dir = (new URI(file_path)).dir;

    await fsp.mkdir(file_dir, { recursive: true });

    const parser_string = await fn_parser_generator(grammar, recognizer_functions, meta, hydrocarbon_import_path);

    try {
        await fsp.writeFile(file_path, parser_string);
        return true;
    } catch (e) {
        throw e;
    }
}


function compileRecognizerSource(runner: Helper, grammar: HCG3Grammar, recognizer_functions: RDProductionFunction[]) {
    const { const: constants_a, fn: const_functions_a } = runner.render_constants();

    const recognizer_code = renderSkribbleRecognizer(grammar);

    recognizer_code.statements.push(...constants_a, ...const_functions_a);

    for (const { entry, goto, reduce } of recognizer_functions)
        recognizer_code.statements.push(...[entry, goto, reduce].filter(i => i));

    recognizer_code.statements.push(...createExternFunctions(grammar, runner, recognizer_functions).statements);

    return recognizer_code;
}


export function renderJavaScriptReduceFunctionLookupArray(grammar: HCG3Grammar): string {
    const reduce_functions_str = [...grammar.meta.reduce_functions.keys()].map((b, i) => {
        if (b.includes("return") || true) {
            return b.replace(/^return/, "(env, sym, pos)=>(").slice(0, -1) + ")" + `/*${i}*/`;
        } else {
            return `(env, sym)=>new (class{constructor(env, sym, pos){${b}}})(env, sym)` + `/*${i}*/`;
        }
    }).join("\n,");

    return `[(_,s)=>s[s.length-1], ${reduce_functions_str}]`;
}

