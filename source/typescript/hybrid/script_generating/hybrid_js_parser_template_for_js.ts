import { Grammar } from "../../types/grammar.js";
import { HybridCompilerOptions } from "../types/CompiledHybridOptions.js";
import { action32bit_array_byte_size_default, error8bit_array_byte_size_default } from "../parser_memory.js";
import {
    TokenSpaceIdentifier,
    TokenNumberIdentifier,
    TokenIdentifierIdentifier,
    TokenNewLineIdentifier,
    TokenSymbolIdentifier
} from "../utilities/utilities.js";
export const renderParserScript = (
    grammar: Grammar,
    options: HybridCompilerOptions,
    js_data?: string,
    BUILD_LOCAL: boolean = false,
    action32bit_array_byte_size = action32bit_array_byte_size_default,
    error8bit_array_byte_size = error8bit_array_byte_size_default
) => {

    return `

${BUILD_LOCAL ? "" : `
    import loader from "@assemblyscript/loader";
    import {buildParserMemoryBuffer} from "${options.memory_loader_url}";              
    import URL from "@candlefw/url";
    import Lexer from "@candlefw/wind";
`} 

const 
    { shared_memory, action_array, error_array } = buildParserMemoryBuffer(true, ${action32bit_array_byte_size}, ${error8bit_array_byte_size}),
    debug_stack = [],
    recognizer = ${js_data}(shared_memory, debug_stack),
    fns = [(e,sym)=>sym[sym.length-1], \n${[...grammar.meta.reduce_functions.keys()].map((b, i) => {
        if (b.includes("return")) {
            return b.replace("return", "(env, sym, pos)=>(").slice(0, -1) + ")" + `/*${i}*/`;
        } else {
            return `(env, sym)=>new (class{constructor(env, sym, pos){${b}}})(env, sym)` + `/*${i}*/`;
        }
    }).join("\n,")
        }];

${BUILD_LOCAL ? "" : "export default async function loadParser(){"} 
    
    return function (str, env = {}) {
        
        const 
            FAILED = recognizer(str), // call with pointers
            aa = action_array,
            er = error_array,
            stack = [];
    
        let action_length = 0;

        //console.log({FAILED})
    
        if (FAILED) {

            //console.log({ds:debug_stack.length})

            const review_stack = [];

            for(let i = debug_stack.length-1, j=0; i >= 0; i--){
                if(!debug_stack[i].FAILED && j++ > 80)
                    break;
                review_stack.push(debug_stack[i]);
            }

            //console.log({review_stack:review_stack.reverse()})
            
            let error_off = 10000000000000;
            let error_set = false;


            const lexer = new Lexer(str);
            const probes = [];
            //Extract any probes

            //console.log("ERROR_LENGTH", er)
            for (let i = 0; i < er.length; i++) {
                if(er[i]>0 && !error_set){
                    error_set = true;
                    error_off = Math.max(error_off, er[i]);
                }
            }

            if(error_off == 10000000000000)
            error_off = 0;

            while (lexer.off < error_off && !lexer.END) lexer.next();
            if(probes.length >0)
                console.table(probes);
            //console.log("", error_off, str.length);
            //console.log(lexer.errorMessage(\`Unexpected token[\${ lexer.tx }]\`));
    
        } /*else {*/

            let offset = 0, pos = [];

            for (const action of aa) {

                action_length++;
                let prev_off = 0;

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
                            // console.log(pos);

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
            //console.log({aa,er})
        //}
    
        return { result: stack, FAILED: !!FAILED, action_length };
    }
    ${BUILD_LOCAL ? "" : "}"} `;
};