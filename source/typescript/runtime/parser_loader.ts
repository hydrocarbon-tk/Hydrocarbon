
import { ParserEnvironment } from "../runtime";
import { HCGProductionFunction } from "../types/parser";
import { buildParserMemoryBuffer, loadWASM } from "./parser_memory.js";
import { Lexer } from "@candlefw/wind";

export function ParserFactory<T>(

    functions: HCGProductionFunction<T>[],

    wasm_binary_string?: string,

    js_recognizer_loader?: (
        shared_memory: ArrayBuffer,
        debug_array: Uint16Array,
    ) => ((str: string) => boolean),

    memory?: {
        shared_memory: ArrayBuffer | WebAssembly.Memory;
        jump_table: Uint16Array;
        action_array: Uint32Array;
        error_array: Uint32Array;
        debug_array: Uint16Array;
    },
) {

    let recognizer = (str: string) => false;

    //Load default memory if the calling process has not passed in a memory object;
    if (!memory) memory = buildParserMemoryBuffer(!wasm_binary_string, 4194304, 163920, 0);

    const { shared_memory, jump_table, action_array, error_array, debug_array } = memory;

    console.log(memory);

    if (!shared_memory || !jump_table || !action_array || !error_array || !debug_array)
        throw new Error("Invalid memory object");

    if (wasm_binary_string) {
        //decompress into buffer
        const out = new Uint8Array(wasm_binary_string.length >> 1);

        for (let i = 0; i < wasm_binary_string.length; i += 2)
            out[i >> 1] = parseInt(wasm_binary_string.slice(i, i + 2), 16);

        recognizer = loadWASM(out, <WebAssembly.Memory>shared_memory).recognizer;

    } else {
        //load javascript data;
        recognizer = js_recognizer_loader(<ArrayBuffer>shared_memory, debug_array)[0];
    }

    const parser = function (str: string, env: ParserEnvironment = {}) {

        const
            fns = functions,
            FAILED = recognizer(str), // call with pointers
            stack = [];

        let action_length = 0,
            error_message = "";


        if (FAILED) {
            /*

            for (let i = debug_stack.length - 1, j = 0; i >= 0; i--) {
                if (!debug_stack[i].FAILED && j++ > 80)
                    break;
                review_stack.push(debug_stack[i]);
            }

            review_stack.reverse();

            if (review_stack.length > 0)
                console.log({ review_stack });

            let error_off = 10000000000000;
            let error_set = false;


            const lexer = new Lexer(str);

            for (let i = 0; i < error_array.length; i++) {
                if (error_array[i] > 0) {
                    if (!error_set) {
                        error_set = true;
                        error_off = 0;
                    }
                    error_off = Math.max(error_off, error_array[i]);
                }
            }

            if (error_off == 10000000000000)
                error_off = 0;

            while (lexer.off < error_off && !lexer.END) lexer.next();

            error_message = lexer.errorMessage(`Unexpected token[${lexer.tx}]`);
            */

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

                            const pos_a = pos[pos.length - len] || { off: 0, tl: 0 };
                            const pos_b = pos[pos.length - 1] || { off: 0, tl: 0 };
                            pos[stack.length - len] = { off: pos_a.off, tl: pos_b.off - pos_a.off + pos_b.tl };
                            const e = stack.slice(-len);
                            stack[stack.length - len] = fns[body](env, e, { off: pos_a.off, tl: pos_b.off - pos_a.off + pos_b.tl });

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
                        } else {
                            stack.push("");
                            pos.push({ off: offset, tl: 0 });
                        }
                    } break;
                }
            }
        }

        return { result: stack, FAILED: !!FAILED, action_length, error_message, debug_array };
    };

    return {
        memory,
        parser
    };
};