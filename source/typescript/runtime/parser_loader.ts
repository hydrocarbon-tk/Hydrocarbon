import { loadWASM } from "./wasm_loader.js";
import { ParserEnvironment } from "../runtime";
import { HCGProductionFunction } from "../types/parser";
import { RecognizeInitializer } from "../types/parser_data";
import { initializeUTFLookupTable } from "./parser_memory_new.js";

export function ParserFactory<T>(

    functions: HCGProductionFunction<T>[],

    wasm_binary_string?: string,

    js_recognizer_loader?: () => RecognizeInitializer,
) {

    let { recognizer, init_data, init_table, delete_data }: RecognizeInitializer = <any>{};

    if (wasm_binary_string) {
        //decompress into buffer
        const out = new Uint8Array(wasm_binary_string.length >> 1);

        for (let i = 0; i < wasm_binary_string.length; i += 2)
            out[i >> 1] = parseInt(wasm_binary_string.slice(i, i + 2), 16);

        ({ recognizer, init_data, init_table, delete_data } = loadWASM(out));

    } else {
        //load javascript data;
        ({ recognizer, init_data, init_table, delete_data } = js_recognizer_loader());
    }

    initializeUTFLookupTable(init_table());

    const parser = function (str: string, env: ParserEnvironment = {}) {

        const
            str_len = str.length,
            str_buffer = str_len + 8,
            data = init_data(str_len + 8, str_len * 32, 512, 0),
            { input, rules, debug, error } = data,
            byte_length = fillByteBufferWithUTF8FromString(str, input, str_buffer);

        const
            fns = functions,
            FAILED = recognizer(data, byte_length), // call with pointers
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

            for (const rule of rules) {


                action_length++;

                if (rule == 0) break;

                switch (rule & 1) {
                    case 0: //REDUCE;
                        {
                            const
                                DO_NOT_PUSH_TO_STACK = (rule >> 1) & 1,
                                body = rule >> 16,
                                len = ((rule >> 2) & 0x3FFF);

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
                            has_len = (rule >>> 1) & 1,
                            has_skip = (rule >>> 2) & 1,
                            len = rule >>> (3 + (has_skip * 15)),
                            skip = has_skip * ((rule >>> 3) & (~(has_len * 0xFFFF8000)));
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

        delete_data(data);

        return { result: stack, FAILED: !!FAILED, action_length, error_message };
    };

    return {
        parser
    };
};



function fillByteBufferWithUTF8FromString(string, buffer: Uint8Array, max_length) {

    let i = 0, j = 0;

    for (; i < string.length && j < max_length - 4; i++) {

        const code_point = string.codePointAt(i);

        if ((code_point & 0x7F) == code_point) {
            buffer[j++] = (code_point & 0x7F);
        } else if ((code_point & 0x7FF) == code_point) {
            buffer[j++] = 0xC0 | ((code_point >> 6) & 0x1F);
            buffer[j++] = 0x80 | ((code_point & 0x3F));
        } else if ((code_point & 0xFFFF) == code_point) {
            buffer[j++] = 0xE0 | ((code_point >> 12) & 0xF);
            buffer[j++] = 0x80 | ((code_point >> 6) & 0x3F);
            buffer[j++] = 0x80 | ((code_point & 0x3F));
            i++;
        } else {
            buffer[j++] = 0xF0 | ((code_point >> 18) & 0x7);
            buffer[j++] = 0x80 | ((code_point >> 12) & 0x3F);
            buffer[j++] = 0x80 | ((code_point >> 6) & 0x3F);
            buffer[j++] = 0x80 | ((code_point & 0x3F));
            i++;
        }
    }

    return j;
}