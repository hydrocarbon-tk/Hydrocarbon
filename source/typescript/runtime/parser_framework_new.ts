/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import URI from "@candlelib/uri";
import {
    ParserPack,
    ProductionFunction,
    ParserEnvironment,
    RecognizeInitializer
} from "../types/parser_framework_types";
import { initializeUTFLookupTableNewPlus as initialize_character_lut } from "./parser_memory_new.js";
import { Token } from "./token.js";
import { load_wasm_recognizer } from "./parser_framework_wasm.js";



export { initialize_character_lut as initializeUTFLookupTableNewPlus };

/**
 * Provides 
 * @param reduce_functions 
 * @param wasm_binary_string 
 * @param load_js_recognizer 
 * @param production_entry_names 
 * @returns 
 */
export async function ParserFramework<T, R, K extends keyof R>(

    reduce_functions: ProductionFunction<T>[],

    production_entry_names: R,

    js_parser_pack: RecognizeInitializer<R, K> = null,

    wasm_binary_source_path: URI = null,

): Promise<ParserPack<T, R, K>> {

    let { recognize, init_table: get_character_lut, create_iterator }: RecognizeInitializer<R, K> = <any>{};

    if (wasm_binary_source_path)
        (
            { recognize, init_table: get_character_lut, create_iterator }
            = await load_wasm_recognizer(wasm_binary_source_path)
        );
    else
        (
            { recognize, init_table: get_character_lut, create_iterator }
            = js_parser_pack
        );

    initialize_character_lut(get_character_lut());

    const out: ParserPack<T, R, K>["parse"] = <ParserPack<T, R, K>["parse"]>(
        (input_string: string, env: ParserEnvironment = {}, production_id: R[K] = <any>0) => {

            const

                fns = reduce_functions,

                { valid, invalid } = recognize(input_string, production_id);

            if (valid.have_valid()) {

                const
                    data = valid.get_mut_state(0),
                    //history = data.state_history.slice(),
                    iter = create_iterator(data),
                    default_token: Token = new Token(input_string, 0, 0);

                let
                    stack = [],
                    tokens = [],
                    rules = [],
                    token_offset = 0;

                try {

                    while (iter.is_valid()) {

                        let low = iter.next();

                        rules.push(low);

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

                                const tok = new Token(input_string, length, token_offset);

                                stack.push(tok);

                                tokens.push(tok);

                                token_offset += length;

                            } break;

                            case 2: { //SKIP

                                let length = (low >>> 3) & 0x1FFF;

                                if (low & 4) {
                                    length = ((length << 16) | iter.next());
                                };

                                token_offset += length;
                            }
                        }
                    }

                    return { result: <T[]>stack, err: null };
                } catch (e) {
                    return { result: <T[]>[], err: e };
                }
            }

            if (invalid.len() > 0) {
                // Furthest invalid state
                const fail_state = invalid.get_mut_state(0);

                const lexer = fail_state.get_root_lexer();

                const token = new Token(input_string,
                    lexer.token_length,
                    lexer.token_offset
                );

                const err = token.createError(`Unexpected token [${token.slice()}]`);

                return { result: <T[]>[], history: fail_state.state_history, err };
            }

            return { result: <T[]>[], history: fail_state.state_history, err };
        });

    return { parse: out, entry_points: production_entry_names };
};
