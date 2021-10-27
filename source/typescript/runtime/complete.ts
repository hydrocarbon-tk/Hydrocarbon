/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { KernelStateBuffer, KernelStateIterator } from './kernel_next.js';
import { Token } from "./token.js";

export function complete<T>(
    input_string: string,
    valid: KernelStateBuffer,
    invalid: KernelStateBuffer,
    functions: any[]
) {
    if (valid.have_valid()) {

        const
            data = valid.get_mut_state(0),
            iter = new KernelStateIterator(data),
            default_token: Token = new Token(input_string, 0, 0);

        let stack = [],
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

                            stack[stack.length - len] = functions[body](e, token);

                            stack.length = stack.length - len + 1;

                            tokens.length = tokens.length - len + 1;

                        } break;

                    case 1: { //SHIFT;

                        let length = (low >>> 3) & 0x1FFF;

                        if (low & 4) length = ((length << 16) | iter.next());

                        stack.push(input_string.slice(token_offset, token_offset + length));

                        tokens.push(new Token(input_string, length, token_offset));

                        token_offset += length;

                    } break;

                    case 2: { //SKIP

                        let length = (low >>> 3) & 0x1FFF;

                        if (low & 4) length = ((length << 16) | iter.next());

                        token_offset += length;
                    }
                }
            }

            return { result: <T[]>stack[0], err: null };
        } catch (e) {
            return { result: null, err: e };
        }
    }

    if (invalid.len() > 0) {
        // Furthest invalid state
        const fail_state = invalid.get_mut_state(0);

        const lexer = fail_state.get_root_lexer();

        const token = new Token(
            input_string,
            lexer.token_length,
            lexer.token_offset
        );

        const err = token.createError(`Unexpected token [${token.slice()}]`);

        return { result: null, err };
    }

    return { result: null, err };
}
