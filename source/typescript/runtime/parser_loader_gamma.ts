/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import URI from "@candlelib/uri";
import { HCGParser, HCGProductionFunction } from "../types/parser";
import { RecognizeInitializer } from "../types/parser_data";
import { ParserEnvironment } from "../types/parser_environment.js";
import { initializeUTFLookupTableNewPlus as initialize_character_lut } from "./parser_memory_new.js";
import { Token } from "./token.js";
import { load_wasm_recognizer } from "./wasm_loader_gamma.js";

export { initialize_character_lut as initializeUTFLookupTableNewPlus };

/**
 * Provides 
 * @param functions 
 * @param wasm_binary_string 
 * @param load_js_recognizer 
 * @param entry_name_list 
 * @returns 
 */
export async function ParserFactory<T, R = {}>(

    functions: HCGProductionFunction<T>[],

    wasm_binary_source_path?: URI,

    load_js_recognizer?: () => RecognizeInitializer,

    entry_name_list: R = <R><any>{}

): Promise<HCGParser<T, R>> {

    let { recognize, init_table: get_character_lut, create_iterator }: RecognizeInitializer = <any>{};

    if (wasm_binary_source_path)
        ({ recognize, init_table: get_character_lut, create_iterator } = await load_wasm_recognizer(wasm_binary_source_path));
    else
        ({ recognize, init_table: get_character_lut, create_iterator } = load_js_recognizer());

    initialize_character_lut(get_character_lut());

    const out: any = function (input_string: string, env: ParserEnvironment = {}, production_id = 0) {

        const

            fns = functions,

            { valid, invalid } = recognize(input_string, production_id);

        if (valid.have_valid()) {

            const data = valid.get_mut_state(0);
            const iter = create_iterator(data);

            let stack = [],
                tokens = [],
                token_offset = 0;

            const
                default_token: Token = new Token(input_string, "", 0, 0);

            while (iter.is_valid()) {

                let low = iter.next();

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
                                len = iter.next();
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

                        if (low & 4) length = ((length << 16) | iter.next());

                        stack.push(input_string.slice(token_offset, token_offset + length));

                        tokens.push(new Token(input_string, "", length, token_offset));

                        token_offset += length;

                    } break;

                    case 2: { //SKIP

                        let length = (low >>> 3) & 0x1FFF;

                        if (low & 4) length = ((length << 16) | iter.next());

                        token_offset += length;
                    }
                }
            }
            return { result: stack };
        }

        if (invalid.len() > 0) {

            const farthest_invalid_state = invalid.get_mut_state(0);

            const token = new Token(input_string, "",
                farthest_invalid_state.lexer.byte_length,
                farthest_invalid_state.lexer.byte_offset
            );

            token.throw(`Unexpected token [${token.slice()}]`);
        }

        return { result: null };
    };

    for (const key in entry_name_list)
        out[key] = entry_name_list[key];

    return out;
};
