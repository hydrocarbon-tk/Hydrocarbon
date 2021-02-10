import { Grammar } from "../types/grammar.js";
import { HybridCompilerOptions } from "../types/compiler_options.js";
import { action32bit_array_byte_size_default, error8bit_array_byte_size_default } from "../runtime/parser_memory_old.js";

export const renderParserScript = (
    grammar: Grammar,
    options: HybridCompilerOptions,
    wasm_data?: Uint8Array,
    js_data?: string,
    BUILD_LOCAL: boolean = false,
    action32bit_array_byte_size = action32bit_array_byte_size_default,
    error8bit_array_byte_size = error8bit_array_byte_size_default
) => {

    let data_block = "";

    if (wasm_data) {

        let compressed_data = null;

        const line_length = 200;
        const data_lines = [];

        compressed_data = [...wasm_data].map(i => ("00" + i.toString(16)).slice(-2)).join("");

        for (let i = 0; i < compressed_data.length; i += line_length) {
            const max_line = Math.min(compressed_data.length - i, line_length);
            data_lines.push(compressed_data.slice(i, i + max_line));
        }

        const data = (BUILD_LOCAL || options.combine_recognizer_and_completer)
            ? `${data_lines.map(d => `"${d}"`).join("\n+")}`
            : "";

        data_block = `${data}`;
    } else
        data_block = `${js_data}`;


    return `${BUILD_LOCAL ? "" :
        `import {ParserFactory} from "${options.memory_loader_url}";`} 

const data = ${data_block};

const fns = [(e,sym)=>sym[sym.length-1], \n${[...grammar.meta.reduce_functions.keys()].map((b, i) => {
            if (b.includes("return")) {
                return b.replace("return", "(env, sym, pos)=>(").slice(0, -1) + ")" + `/*${i}*/`;
            } else {
                return `(env, sym)=>new (class{constructor(env, sym, pos){${b}}})(env, sym)` + `/*${i}*/`;
            }
        }).join("\n,")
        }]; 

const parser_factory = ParserFactory(fns, ${wasm_data ? "data" : "undefined"}, ${wasm_data ? "undefined" : "data"});

${BUILD_LOCAL ? `return parser_factory.parser` : `export { fns as parser_functions, data as parser_data, parser_factory };`} `;
};