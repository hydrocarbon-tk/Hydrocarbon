/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { loadWASM } from "./wasm_loader.js";
import { ParserEnvironment } from "../runtime";
import { HCGProductionFunction } from "../types/parser";
import { RecognizeInitializer } from "../types/parser_data";
import { initializeUTFLookupTable } from "./parser_memory_new.js";
import { Lexer } from "@candlelib/wind";

export type HCParser<T = any> = (str: string, env?: ParserEnvironment, production_id?: number) => {
    result: T[];
    FAILED: boolean;
    action_length: number;
    error_message: string;
};

export type ParserFactoryReturn<T = any> = {
    parser: HCParser<T>;
};

export function ParserFactory<T>(

    functions: HCGProductionFunction<T>[],

    wasm_binary_string?: string,

    js_recognizer_loader?: () => RecognizeInitializer,
): ParserFactoryReturn<T> {

    let { recognizer, init_data, init_table, delete_data, get_fork_information, get_next_command_block }: RecognizeInitializer = <any>{};

    if (wasm_binary_string) {
        //decompress into buffer
        const out = new Uint8Array(wasm_binary_string.length >> 1);

        for (let i = 0; i < wasm_binary_string.length; i += 2)
            out[i >> 1] = parseInt(wasm_binary_string.slice(i, i + 2), 16);

        ({ recognizer, init_data, init_table, delete_data, get_fork_information, get_next_command_block } = loadWASM(out));

    } else {
        //load javascript data;
        ({ recognizer, init_data, init_table, delete_data, get_fork_information, get_next_command_block } = js_recognizer_loader());
    }

    initializeUTFLookupTable(init_table());

    const parser = function (str: string, env: ParserEnvironment = {}, production_id = 0) {



        const
            str_len = str.length,
            str_buffer_size = (str_len * 4) + 8,
            rules_buffer_size = str_len * 8,
            data = init_data(str_buffer_size, rules_buffer_size, 512, 0),
            { input, rules, debug, error } = data,
            byte_length = fillByteBufferWithUTF8FromString(str, input, str_buffer_size);

        const
            fns = functions,
            FAILED = recognizer(data, byte_length, production_id), // call with pointers
            stack = [];

        let action_length = 0,
            error_message = "";

        const forks = get_fork_information();

        if (forks.length == 1) {
            //Normal parse
            const fork = forks[0];
            let limit = 1000000;
            let block = get_next_command_block(fork);
            let short_offset = 0;
            let token_offset = 0;
            let pos = [];
            let high = block[short_offset++];

            if (fork.valid == false) {

                const lex = new Lexer(str);

                lex.off = fork.byte_offset;
                lex.tl = fork.byte_length;

                let i = fork.byte_offset;

                for (; str[i] != "\n" && i >= 0; --i);

                lex.line = fork.line;
                lex.column = fork.byte_offset - i;

                lex.throw(`Unexpected token [${str.slice(lex.off, lex.off + lex.tl)}]`);

                throw Error("Could not parse data");
            }

            if (short_offset > 63) {
                get_next_command_block(fork);
                short_offset = 0;
            }

            while (limit-- > 0) {

                let low = high;

                if (low == 0) break;

                high = block[short_offset++];

                const rule = low & 3;

                switch (rule) {
                    case 0: //REDUCE;
                        {
                            let
                                body = (low >> 8) & 0xFF,
                                len = ((low >> 3) & 0x1F);

                            if (low & 4) {
                                body = (body << 8) | len;
                                len = high;
                                short_offset++;
                            }

                            const pos_a = pos[pos.length - len] || { off: 0, tl: 0 };
                            const pos_b = pos[pos.length - 1] || { off: 0, tl: 0 };
                            const e = stack.slice(-len);


                            pos[stack.length - len] = { off: pos_a.off, tl: pos_b.off - pos_a.off + pos_b.tl };
                            stack[stack.length - len] = fns[body](env, e, { off: pos_a.off, tl: pos_b.off - pos_a.off + pos_b.tl });

                            stack.length = stack.length - len + 1;
                            pos.length = pos.length - len + 1;


                        } break;

                    case 1: { //SHIFT;
                        let length = (low >>> 3) & 0x1FFF;

                        if (low & 4) {
                            length = ((length << 16) | high);
                            short_offset++;
                        }

                        stack.push(str.slice(token_offset, token_offset + length));
                        pos.push({ off: token_offset, tl: length });
                        token_offset += length;
                    } break;

                    case 2: { //SKIP

                        let length = (low >>> 3) & 0x1FFF;

                        if (low & 4) {
                            length = ((length << 16) | high);
                            short_offset++;
                        }

                        token_offset += length;
                    }

                    case 3: {
                        //Error
                    }
                }


                if (short_offset > 63) {
                    get_next_command_block(fork);
                    short_offset = 0;
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

export function fillByteBufferWithUTF8FromString(string, buffer: Uint8Array, max_length) {

    let i = 0, j = 0, l = string.length;

    for (; i < l && j < max_length - 4; i++) {

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
            if (code_point > 65535) {
                i++; l++;
            }
        } else {
            if (code_point > 65535) {
                i++; l++;
            }
            buffer[j++] = 0xF0 | ((code_point >> 18) & 0x7);
            buffer[j++] = 0x80 | ((code_point >> 12) & 0x3F);
            buffer[j++] = 0x80 | ((code_point >> 6) & 0x3F);
            buffer[j++] = 0x80 | ((code_point & 0x3F));
            i++;
        }
    }

    return j;
}