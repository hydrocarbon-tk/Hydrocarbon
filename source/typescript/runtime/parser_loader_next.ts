/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { Lexer } from "@candlelib/wind";
import { HCGParser, HCGProductionFunction } from "../types/parser";
import { ForkData, RecognizeInitializer } from "../types/parser_data";
import { ParserEnvironment } from "../types/parser_environment.js";
import { initializeUTFLookupTableNew, initializeUTFLookupTableNewPlus } from "./parser_memory_new.js";
import { Token } from "./token.js";
import { fillByteBufferWithUTF8FromString } from "./utf8.js";
import { loadWASM } from "./wasm_loader_next.js";

export { initializeUTFLookupTableNewPlus };

class BlockInterface {
    private fork: ForkData;
    private get_next_block: (fork: ForkData) => void;
    private block: Uint16Array;
    private offset: number;
    constructor(fork: ForkData, get_next_block: (fork: ForkData) => Uint16Array) {

        this.fork = fork;

        this.block = get_next_block(fork);

        this.get_next_block = get_next_block;

        this.offset = 0;
    }

    get high(): number {

        this.increment();

        return this.block[this.offset];
    }

    get low(): number {
        return this.block[this.offset];
    }
    increment() {

        if (this.offset > 62) {
            this.get_next_block(this.fork);
            this.offset = 0;
        } else
            this.offset++;
    }
};

/**
 * Provides 
 * @param functions 
 * @param wasm_binary_string 
 * @param js_recognizer_loader 
 * @param entry_name_list 
 * @returns 
 */
export async function ParserFactory<T, R = {}>(

    functions: HCGProductionFunction<T>[],

    wasm_binary_string?: string,

    js_recognizer_loader?: () => RecognizeInitializer,

    entry_name_list: R = <R><any>{},

    memory_init: (buffer: Uint8Array) => void = initializeUTFLookupTableNew

): Promise<HCGParser<T, R>> {

    let { recognize, init_data, init_table, get_fork_pointers, get_next_command_block }: RecognizeInitializer = <any>{};

    if (wasm_binary_string) {

        //decompress into buffer
        const out = new Uint8Array(wasm_binary_string.length >> 1);

        for (let i = 0; i < wasm_binary_string.length; i += 2)
            out[i >> 1] = parseInt(wasm_binary_string.slice(i, i + 2), 16);

        ({ recognize, init_data, init_table, get_fork_pointers, get_next_command_block } = await loadWASM(out));

    } else {
        //load javascript data;
        ({ recognize, init_data, init_table, get_fork_pointers, get_next_command_block } = js_recognizer_loader());
    }

    memory_init(init_table());

    const out = function (input_string: string, env: ParserEnvironment = {}, production_id = 0) {

        const

            str_len = input_string.length,

            str_buffer_size = (str_len * 4) + 8,

            rules_buffer_size = str_len * 8,

            input = init_data(str_buffer_size, rules_buffer_size),

            byte_length = fillByteBufferWithUTF8FromString(input_string, input, str_buffer_size),

            fns = functions,

            fork_count = recognize(byte_length, production_id),

            forks = get_fork_pointers();

        let fork = forks.filter(f => f.VALID)[0];

        if (!fork?.VALID) {
            fork = forks.sort((a, b) => b.byte_offset - a.byte_offset)[0];

            throwForkError(input_string, fork);
        }

        let stack = [],
            tokens = [],
            token_offset = 0,
            limit = 1000000;

        const
            default_token: Token = new Token(input_string, "", 0, 0),
            block = new BlockInterface(fork, get_next_command_block);

        while (limit-- > 0) {

            let low = block.low;

            if (low == 0) break;

            const rule = low & 3;

            switch (rule) {
                case 0: //REDUCE;
                    {
                        let
                            body = (low >> 8) & 0xFF,
                            len = ((low >> 3) & 0x1F);

                        if (low & 4) {
                            body = (low >> 3);
                            len = block.high;
                        }

                        const
                            pos_a = tokens[tokens.length - len] || default_token,

                            pos_b = tokens[tokens.length - 1] || default_token,

                            e = stack.slice(-len),

                            token = Token.fromRange(pos_a, pos_b);

                        tokens[stack.length - len] = token;

                        stack[stack.length - len] = fns[body](env, e, token);

                        stack.length = stack.length - len + 1;

                        tokens.length = tokens.length - len + 1;

                    } break;

                case 1: { //SHIFT;

                    let length = (low >>> 3) & 0x1FFF;

                    if (low & 4) length = ((length << 16) | block.high);

                    stack.push(input_string.slice(token_offset, token_offset + length));

                    tokens.push(new Token(input_string, "", length, token_offset));

                    token_offset += length;

                } break;

                case 2: { //SKIP

                    let length = (low >>> 3) & 0x1FFF;

                    if (low & 4) length = ((length << 16) | block.high);

                    token_offset += length;
                }
            }

            block.increment();
        }

        return { result: stack };
    };

    for (const key in entry_name_list)
        out[key] = entry_name_list[key];

    return out;
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
