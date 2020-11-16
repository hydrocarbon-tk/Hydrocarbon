import { Grammar } from "../../types/grammar.js";

export const renderParserScript = (grammar: Grammar) => {

    return `
import loader from "@assemblyscript/loader";

import { buildParserMemoryBuffer } from "@candlefw/hydrocarbon";        
import URL from "@candlefw/url";
import Lexer from "@candlefw/wind";

const 
    { shared_memory, action_array, error_array } = buildParserMemoryBuffer(),
    fns = [(e,sym)=>sym[sym.length-1], ${grammar.meta.reduce_functions.map((b, i) => {
        if (b.includes("return")) {

            return b.replace("return", "(env, sym, pos)=>(").slice(0, -1) + ")";
        } else {
            return `(env, sym)=>new (class{constructor(env, sym, pos){${b}}})(env, sym)`;
        }
    }).join("\n,")
        }];

export default async function loadParser(){

    await URL.server();

    const wasmModule = await loader.instantiate(await URL.resolveRelative("./recognizer.wasm").fetchBuffer(), { env: { memory: shared_memory } }),
    
    { main, __newString, __release } = wasmModule.exports;

    return function (str, env = {}) {

        const 
            str_ptr = __newString(str),
            FAILED = main(str_ptr), // call with pointers
            aa = action_array,
            er = error_array,
            stack = [];

        __release(str_ptr);
        
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
                switch (action & 3) {
                    case 0: //ACCEPT
                        break o;
                    case 1: //REDUCE;
                        var 
                            body = action >> 16,
                            len = ((action & 0xFFFF) >> 2);
                        stack[stack.length - len] = fns[body](env, stack.slice(-len), {});
                        stack.length = stack.length - len + 1;
                        break;
                    case 2: //SHIFT;
                        var len = action >> 2;
                        stack.push(str.slice(offset, offset + len));
                        offset += len;
                        break;
                    case 3: //SKIP;
                        var len = action >> 2;
                        offset += len;
                        break;
                }
            }
        }
    
        return { result: stack, FAILED: !!FAILED, action_length };
    }
}`;
};