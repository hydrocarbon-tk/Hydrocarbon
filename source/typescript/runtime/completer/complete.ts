/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { ParseActionType, StateIterator } from '../recognizer/iterator.js';
import { Token } from "../token.js";
import { StringByteReader } from '../common/string_byte_reader.js';

export function complete<T>(
    input_string: string,
    entry_pointer: number,
    bytecode_buffer: Uint32Array,
    functions: any[],
    source_path: string = ""
): {
    result: T,
    err: any;
} {

    //Create a StringByteReader

    const string_byte_reader = new StringByteReader(input_string);

    const iterator = new StateIterator(string_byte_reader, bytecode_buffer, entry_pointer, false);

    let stack = [],
        tokens = [],
        token_offset = 0,
        default_token: Token = new Token(input_string, 0, 0);

    while (true) {

        const action = iterator.nextAction();

        switch (action.type) {
            case ParseActionType.ACCEPT: {
                return { result: stack[0], err: null };
            }; break;

            case ParseActionType.ERROR: {
                return { result: null, err: null };
            }; break;

            case ParseActionType.FORK: {
                throw new Error("Fork behavior not implemented!");
            }; break;

            case ParseActionType.REDUCE: {

                const { body, length, production } = action,

                    pos_a = tokens[tokens.length - length] || default_token,

                    pos_b = tokens[tokens.length - 1] || default_token,

                    e = stack.slice(-length),

                    token = Token.fromRange(pos_a, pos_b);

                tokens[stack.length - length] = token;

                functions[body](stack, token);

                tokens.length = tokens.length - length + 1;

            }; break;


            case ParseActionType.SHIFT: {

                const { line, length, token_type } = action;

                const token = new Token(input_string, length, token_offset, line);

                token.setPath(source_path);

                stack.push(token);

                tokens.push(token);

                //console.log(token + "");

                token_offset += length;

            }; break;

            case ParseActionType.SKIP: {

                const { line, length, token_type } = action;

                token_offset += length;

            }; break;
        }
    }
}