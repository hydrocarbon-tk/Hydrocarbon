import { Grammar } from "../types/grammar.js";
import { HybridCompilerOptions } from "../types/compiler_options.js";
import { action32bit_array_byte_size_default, error8bit_array_byte_size_default } from "../runtime/parser_memory.js";

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
            ? `data = (str=>{const out = new Uint8Array(str.length>>1); for(let i = 0; i < str.length; i+=2) {out[i>>1] = parseInt(str.slice(i, i+2),16);} return out; })(\n${data_lines.map(d => `"${d}"`).join("\n+")})`
            : "";

        data_block = `const ${data},
{ recognizer } = loadWASM(data, shared_memory);`;


    } else {
        data_block = `const  recognizer = ${js_data}(shared_memory, debug_stack);`;
    }

    return `${BUILD_LOCAL ? "" :
        `import {buildParserMemoryBuffer, loadWASM }  from "${options.memory_loader_url}";        
import Lexer from "@candlefw/wind";`} 

const debug_stack = [];
const { shared_memory, action_array, error_array } = buildParserMemoryBuffer(${wasm_data ? "false" : "true"}, ${action32bit_array_byte_size}, ${error8bit_array_byte_size});

${data_block}

const fns = [(e,sym)=>sym[sym.length-1], \n${[...grammar.meta.reduce_functions.keys()].map((b, i) => {
            if (b.includes("return")) {
                return b.replace("return", "(env, sym, pos)=>(").slice(0, -1) + ")" + `/*${i}*/`;
            } else {
                return `(env, sym)=>new (class{constructor(env, sym, pos){${b}}})(env, sym)` + `/*${i}*/`;
            }
        }).join("\n,")
        }]; 

${BUILD_LOCAL ? "return" : "export default"} function (str, env = {}) {
    
    debug_stack.length = 0;
        const 
            FAILED = recognizer(str), // call with pointers
            stack = [];
    
        let action_length = 0,
            error_message ="",
            review_stack = [];

    
        if (FAILED) {

            for(let i = debug_stack.length-1, j=0; i >= 0; i--){
                if(!debug_stack[i].FAILED && j++ > 80)
                    break;
                review_stack.push(debug_stack[i]);
            }

            review_stack.reverse();

            if(review_stack.length > 0)
                console.log({review_stack})
            
            let error_off = 10000000000000;
            let error_set = false;


            const lexer = new Lexer(str);

            for (let i = 0; i < error_array.length; i++) {
                if(error_array[i]>0 ){
                    if(!error_set){
                        error_set = true;
                        error_off = 0;
                    }
                    error_off = Math.max(error_off, error_array[i]);
                }
            }

            if(error_off == 10000000000000) 
                error_off = 0;

            while (lexer.off < error_off && !lexer.END) lexer.next();

            error_message = lexer.errorMessage(\`Unexpected token[\${ lexer.tx }]\`);

    
        } else {

            let offset = 0, pos = [];

            for (const action of action_array) {

                action_length++;
                
                if (action == 0) break;

                switch (action & 1) {
                    case 0: //REDUCE;
                        {
                            const
                                DO_NOT_PUSH_TO_STACK = (action >> 1) & 1,
                                body = action >> 16,
                                len = ((action >> 2) & 0x3FFF);

                            const pos_a = pos[pos.length - len] || {off:0,tl:0};
                            const pos_b = pos[pos.length - 1 ] || {off:0,tl:0};
                            pos[stack.length - len] = { off: pos_a.off, tl: pos_b.off - pos_a.off  + pos_b.tl };

                            stack[stack.length - len] = fns[body](env, stack.slice(-len), { off: pos_a.off, tl: pos_b.off - pos_a.off  + pos_b.tl });

                            if (!DO_NOT_PUSH_TO_STACK) {
                                stack.length = stack.length - len + 1;
                                pos.length = pos.length - len + 1;
                            } else {
                                stack.length = stack.length - len;
                                pos.length = pos.length - len;
                            }

                        } break;

                    case 1: { //SHIFT;
                        const
                            has_len = (action >>> 1) & 1,
                            has_skip = (action >>> 2) & 1,
                            len = action >>> (3 + (has_skip * 15)),
                            skip = has_skip * ((action >>> 3) & (~(has_len * 0xFFFF8000)));
                        offset += skip;
                        if (has_len) {
                            stack.push(str.slice(offset, offset + len));
                            pos.push({ off: offset, tl: len });
                            offset += len;
                        }else {
                            stack.push("");
                            pos.push({ off: offset, tl: 0 });
                        }
                    } break;
                }
            }
        }
    
        return { result: stack, FAILED: !!FAILED, action_length, error_message, review_stack };
    }`;
};