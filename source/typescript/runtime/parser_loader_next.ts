/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Lexer } from "@candlelib/wind";
import { fillByteBufferWithUTF8FromString } from "./fillByteBufferWithUTF8FromString.js";
import { HCGProductionFunction } from "../types/parser";
import { ForkData, RecognizeInitializer } from "../types/parser_data";
import { initializeUTFLookupTableNew } from "./parser_memory_new.js";
import { loadWASM } from "./wasm_loader_next.js";
import { ParserEnvironment } from "../types/parser_environment.js";

export async function ParserFactory<T>(

    functions: HCGProductionFunction<T>[],

    wasm_binary_string?: string,

    js_recognizer_loader?: () => RecognizeInitializer,
) {

    let { recognize, init_data, init_table, get_fork_pointers, get_next_command_block }: RecognizeInitializer = <any>{};

    if (wasm_binary_string) {

        //decompress into buffer
        const out = new Uint8Array(wasm_binary_string.length >> 1);

        for (let i = 0; i < wasm_binary_string.length; i += 2)
            out[i >> 1] = parseInt(wasm_binary_string.slice(i, i + 2), 16);

        ({ recognize, init_data, init_table, get_fork_pointers, get_next_command_block } = loadWASM(out));

    } else {
        //load javascript data;
        ({ recognize, init_data, init_table, get_fork_pointers, get_next_command_block } = js_recognizer_loader());
    }

    initializeUTFLookupTableNew(init_table());

    return function (str: string, env: ParserEnvironment = {}, production_id = 0) {

        const
            str_len = str.length,
            str_buffer_size = (str_len * 4) + 8,
            rules_buffer_size = str_len * 8,
            input = init_data(str_buffer_size, rules_buffer_size, 0),
            byte_length = fillByteBufferWithUTF8FromString(str, input, str_buffer_size),
            fns = functions,
            fork_count = recognize(byte_length, production_id), // call with pointers
            forks = get_fork_pointers();


        const fork = forks[0];

        if (!fork.VALID)
            throwForkError(str, fork);

        let stack = [],
            pos = [],
            block = get_next_command_block(fork),
            short_offset = 0,
            token_offset = 0,
            high = block[short_offset++],
            limit = 1000000;

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
            }

            if (short_offset > 63) {
                get_next_command_block(fork);
                short_offset = 0;
            }
        }

        return { result: stack };
    };
};

function throwForkError(str: string, fork: ForkData) {

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
