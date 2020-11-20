import { Grammar } from "../../types/grammar.js";
import { HybridCompilerOptions } from "../CompiledHybridOptions.js";

export const renderParserScript = (grammar: Grammar, options: HybridCompilerOptions, wasm_data?: Uint8Array, BUILD_LOCAL: boolean = false) => {

    const loader = (options.combine_wasm_with_js || BUILD_LOCAL)
        ? `await loader.instantiate(data, { env: { memory: shared_memory } })`
        : `await loader.instantiate(await URL.resolveRelative("${options.wasm_output_dir + "recognizer.wasm"}").fetchBuffer(), { env: { memory: shared_memory } })`,

        data = (BUILD_LOCAL || options.combine_wasm_with_js) ? `const data = new Uint8Array([${wasm_data.toString()}]);` : "";

    return `

${BUILD_LOCAL ? "" : `
    import loader from "@assemblyscript/loader";
    import {buildParserMemoryBuffer} from "${options.memory_loader_url}";              
    import URL from "@candlefw/url";
    import Lexer from "@candlefw/wind";
`}

${data}

const 
    { shared_memory, action_array, error_array } = buildParserMemoryBuffer(),
    fns = [(e,sym)=>sym[sym.length-1], \n${[...grammar.meta.reduce_functions.keys()].map((b, i) => {
        if (b.includes("return")) {
            return b.replace("return", "(env, sym, pos)=>(").slice(0, -1) + ")" + `/*${i}*/`;
        } else {
            return `(env, sym)=>new (class{constructor(env, sym, pos){${b}}})(env, sym)` + `/*${i}*/`;
        }
    }).join("\n,")
        }];

${BUILD_LOCAL ? "" : "export default async function loadParser(){"} 

    await URL.server();

    const wasmModule = ${loader},
    
    { main, __newString } = wasmModule.exports;

    return function (str, env = {}) {

        const 
            str_ptr = __newString(str),
            FAILED = main(str_ptr), // call with pointers
            aa = action_array,
            er = error_array,
            stack = [];
        
        let action_length = 0;
    
        if (FAILED) {
            
            let error_off = 0;


            const lexer = new Lexer(str);
            const probes = [];
            //Extract any probes
            for (let i = 0; i < er.length; i++) {
                if (((er[i] & 0xF000000F) >>> 0) == 0xF000000F) {
                    const num = er[i] & 0xFFFFFF0;
                    const sequence = (num >> 4) & 0xFFF;
                    const identifier = (num >> 16) & 0xFFF;
                    const token_type = [
                        "TokenEndOfLine",
                        "TokenSpace",
                        "TokenNumber",
                        "TokenIdentifier",
                        "TokenNewLine",
                        "TokenSymbol",
                        "TypeSymbol",
                        "TokenKeyword",
                    ][er[i + 1]];
                    const id = er[i + 2];
                    const token_length = er[i + 3];
                    const offset = er[i + 4];
                    const prod = er[i + 5] << 0;
                    const stack_ptr = er[i + 6];
                    const FAILED = !!er[i + 7];
                    i += 8;
                    const cp = lexer.copy();
                    cp.off = offset;
                    cp.tl = token_length;
                    probes.push({
                        identifier,
                        str: cp.tx,
                        token_type,
                        id,
                        token_length,
                        offset,
                        stack_ptr,
                        prod,
                        FAILED
                    });
                } else {
                    error_off = Math.max(error_off, er[i]);
                }
            }

            while (lexer.off < error_off && !lexer.END) lexer.next();
            console.table(probes);
            console.log(error_off, str.length);

            lexer.throw(\`Unexpected token[\${ lexer.tx }]\`);
    
        } else {
            
            let offset = 0;
    
            o: for (const action of aa) {
                
                action_length++;

                switch (action & 1) {
                    case 0: //REDUCE;
                        if(action == 0) break o; else{
                            const  
                                DO_NOT_PUSH_TO_STACK = (action >> 1) & 1,
                                body = action >> 16,
                                len = ((action >> 2) & 0x3FFF);

                            stack[stack.length - len] = fns[body](env, stack.slice(-len), {});
                            
                            if(!DO_NOT_PUSH_TO_STACK){
                                stack.length = stack.length - len + 1;
                            }else{
                                stack.length = stack.length - len;
                            }

                        }  break;

                    case 1: { //SHIFT;
                        const 
                            has_len  = (action >>> 1) & 1,
                            has_skip = (action >>> 2) & 1,
                            len = action >>> ( 3 + (has_skip * 15)),
                            skip = has_skip * ((action >>> 3) & (~(has_len * 0xFFFF8000)));                            
                            offset += skip;
                        if(has_len){
                            stack.push(str.slice(offset, offset + len));
                            offset += len;
                        }
                    } break;
                }
            }
        }
    
        return { result: stack, FAILED: !!FAILED, action_length };
    }
    ${BUILD_LOCAL ? "" : "}"} `;
};