/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { HCGParser } from "@candlelib/hydrocarbon/build/types/types/parser";
import spark from "@candlelib/spark";
import fs from "fs";
import { createExternFunctions, renderSkribbleRecognizer } from "../render/skribble_recognizer_template.js";
import { ParserFactory } from "../runtime/parser_loader_alpha.js";
import { skRenderAsJavaScript, skRenderAsCPP } from "../skribble/skribble.js";
import { HybridCompilerOptions } from "../types/compiler_options";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { HCG3Grammar } from "../types/grammar_nodes.js";
import { RDProductionFunction } from "../types/rd_production_function.js";
import { getProductionFunctionNameSk } from "../utilities/code_generating.js";
import { constructCompilerRunner, Helper } from "./helper.js";
import { WorkerRunner } from "./workers/worker_runner.js";
const fsp = fs.promises;

export async function compile(grammar: HCG3Grammar, env: GrammarParserEnvironment, options: HybridCompilerOptions):
    Promise<{
        grammar_functions: RDProductionFunction[],
        runner: Helper;
    }> {

    const
        active_options: HybridCompilerOptions = Object.assign({}, {}, options),
        runner: Helper = constructCompilerRunner(active_options.add_annotations, active_options.debug),
        mt_code_compiler = new WorkerRunner(grammar, runner, active_options.number_of_workers);

    active_options.combine_recognizer_and_completer = Boolean(active_options.no_file_output || active_options.combine_recognizer_and_completer);

    for (const updates of mt_code_compiler.run())
        await spark.sleep(1);

    return {
        grammar_functions: mt_code_compiler.functions,
        runner
    };
}

export async function compileRecognizer(
    grammar: HCG3Grammar,
    number_of_workers: number = 1,
    ADD_ANNOTATIONS: boolean = false
):
    Promise<{
        recognizer_functions: RDProductionFunction[],
        meta: Helper;
    }> {

    const
        runner: Helper = constructCompilerRunner(ADD_ANNOTATIONS, false),

        mt_code_compiler = new WorkerRunner(grammar, runner, number_of_workers);

    for (const updates of mt_code_compiler.run())
        await spark.sleep(1);

    return {
        recognizer_functions: mt_code_compiler.functions,
        meta: runner
    };
}

export async function writeJSParserToFile(
    file_path: string,
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper,
    hydrocarbon_import_path: string = "@candlelib/hydrocarbon"
): Promise<boolean> {

    if (!file_path)
        return false;

    const { completer_script, recognizer_script } = buildJSParserStrings(
        grammar, recognizer_functions, meta
    );
    const file = `
    import { ParserFactoryNew as ParserFactory } from "${hydrocarbon_import_path}";

    const recognizer_initializer = (()=>{
        ${recognizer_script};
        sequence_lookup = [${grammar.sequence_string.split("").map(s => s.charCodeAt(0)).join(",")}];

        return {
            get_next_command_block, 
            sequence_lookup, 
            lookup_table, 
            run, 
            dispatch, 
            init_table,
            init_data, 
            delete_data:_=>_,
            recognizer,
            get_fork_information
        };
    });

    const reduce_functions = ${completer_script};

    export default ParserFactory(reduce_functions, undefined, recognizer_initializer);
    `;

    try {
        await fsp.writeFile(file_path, file);
        return true;
    } catch (e) {
        throw e;
    }
    return false;
}

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

export function buildCPPRecognizerSourceString(
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    meta: Helper
): {
    recognizer_source: string;
} {
    const recognizer_code = compileRecognizerSource(meta, grammar, recognizer_functions);

    let recognizer_source = skRenderAsCPP(recognizer_code);

    //Adding forward declaration to get things to cooperate
    const { fn: const_functions_a } = meta.render_constants();
    recognizer_source =
        `/*Begin Forward Declarations*/\n
class Lexer;
class ParserData;\n
${const_functions_a.map(fn => {
            const name = skRenderAsCPP(fn.name);
            const type = skRenderAsCPP(fn.return_type);
            const args = fn.parameters.map(p => skRenderAsCPP(p.primitive_type));
            return `${type} ${name}(${args});`;
        }).join("\n")}

${recognizer_functions.filter(f => f.RENDER).map(fn => {
            const name = getProductionFunctionNameSk(grammar[fn.id], grammar);
            return `int ${name}(Lexer&, ParserData&, unsigned int, unsigned int, int);`;
        }).join("\n")}
${""}
/*End Forward Declarations*/\n\n` + recognizer_source;

    return {
        recognizer_source
    };
}


/**
 * Constructs a JavaScript based parser from a grammar, and optionally recognizer and completer strings. 
 * If the recognizer or completer string is empty, then these strings will be compiled before the parser
 * function is created.
 * @param grammar 
 * @param recognizer_script 
 * @param completer_script 
 * @returns 
 */
export async function createAddHocParser<T = any>(
    grammar: HCG3Grammar,
    recognizer_script: string = "",
    completer_script: string = ""
): Promise<HCGParser<T>> {

    if (!recognizer_script || !completer_script) {
        const { meta, recognizer_functions } = await compileRecognizer(grammar, 2);
        ({ recognizer_script, completer_script } = buildJSParserStrings(grammar, recognizer_functions, meta));
    }

    const parser_string = `
    const recognizer_initializer = (()=>{
        ${recognizer_script};
        sequence_lookup = [${grammar.sequence_string.split("").map(s => s.charCodeAt(0)).join(",")}];

        return {
            get_next_command_block, 
            sequence_lookup, 
            lookup_table, 
            run, 
            dispatch, 
            init_table,
            init_data, 
            delete_data:_=>_,
            recognizer,
            get_fork_information
        };
    });

    const reduce_functions = ${completer_script};

    return ParserFactory(reduce_functions, undefined, recognizer_initializer);
    `;


    return new Function("ParserFactory", parser_string)(ParserFactory).parser;
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

export function renderRecognizerAsJavasScript(
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    runner: Helper
) {

    const recognizer_code = compileRecognizerSource(runner, grammar, recognizer_functions);

    return skRenderAsJavaScript(recognizer_code);
};



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

