/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { goto_state_mask, state_index_mask, Token } from "@hctoolkit/common";
import { StringByteReader } from '../buffer/string_byte_reader.js';
import { ParseAction, ParseActionType, StateIterator } from '../recognizer/iterator.js';

export function complete<T>(
    input_string: string,
    entry_pointer: number,
    bytecode_buffer: Uint32Array,
    functions: any[],
    ReduceNames: string[],
    source_path: string = "",
): {
    result: T,
    err: null;
} | {
    result: null,
    err: ParseAction[ParseActionType.ERROR];
} {

    //Create a StringByteReader

    const string_byte_reader = new StringByteReader(input_string);

    const iterator = new StateIterator(string_byte_reader, bytecode_buffer, entry_pointer, false);

    let stack: any[] = [],
        tokens: Token[] = [],
        token_offset = 0,
        default_token: Token = new Token(input_string, 0, 0),
        err: ParseAction[ParseActionType.ERROR] | null = null;

    iterator.start(action => {
        switch (action.type) {
            case ParseActionType.ACCEPT: {
            }; break;

            case ParseActionType.ERROR: {
                err = action;
            }; break;

            case ParseActionType.REDUCE: {


                const { body, length, production } = action,

                    pos_a = tokens[tokens.length - length] || default_token,

                    pos_b = tokens[tokens.length - 1] || default_token,

                    e = stack.slice(-length),

                    token = Token.fromRange(pos_a, pos_b);

                tokens[stack.length - length] = token;

                try {
                    functions[body](stack, token);
                } catch (e) {

                    token.throw(`Unable to reduce production ${ReduceNames[body]} `);
                }

                tokens.length = tokens.length - length + 1;

            }; break;


            case ParseActionType.SHIFT: {

                const { line, length, token_type } = action;

                const token = new Token(input_string, length, token_offset, line);

                token.setPath(source_path);

                stack.push(token);

                tokens.push(token);

                token_offset += length;

            }; break;

            case ParseActionType.SKIP: {

                const { line, length, token_type } = action;

                token_offset += length;

            }; break;
        }
    }, fork_action_handler);


    if (err) return { result: null, err: err };

    return { result: stack[0], err: null };
}


function fork_action_handler(action: ParseAction[ParseActionType], iterator: StateIterator): ParseAction[ParseActionType][] {

    const bytecode = iterator.bytecode;

    const pointer = action.pointer;

    const fork_iterator = new StateIterator(iterator.reader.clone(), bytecode, 0, false);

    const buffers: ParseAction[ParseActionType][][] = [];

    const tokens = [];

    const readers = [];

    const length = bytecode[pointer] & 0xFFFFFF;

    let goto_start = 0;

    fork_iterator.production_id = -1;

    for (let i = iterator.stack.pointer; i > 0; i--) {
        const state = iterator.stack.state_stack[i];
        if (state & goto_state_mask) {
            goto_start = state;
            iterator.stack.pointer = i - 1;
            break;
        }
    }

    if (!goto_start)
        throw new Error("Unable to resolve fork to single production");

    const root_prod = iterator.bytecode[(goto_start & state_index_mask) - 1];

    for (let i = 0; i < length; i++) {

        let root = pointer + length + 1;

        const buffer: ParseAction[ParseActionType][] = [];

        const state = bytecode[pointer + 1 + i];

        fork_iterator.stack.pointer = 0;
        fork_iterator.stack.state_stack[0] = 0;
        fork_iterator.stack.push_state(goto_start);
        fork_iterator.stack.push_state(state);
        fork_iterator.tokens[0].impersonate(iterator.tokens[0]);
        fork_iterator.tokens[1].impersonate(iterator.tokens[1]);

        fork_iterator.reader.setTo(iterator.tokens[1].byte_offset);

        while (bytecode[root] > 0) {
            fork_iterator.stack.push_state(bytecode[root]);
            root.push();
        }

        fork_iterator.start(action => buffer.push(action), fork_action_handler, root_prod);

        if (fork_iterator.production_id == root_prod) {
            tokens.push(fork_iterator.tokens.slice(0, 2).map(t => t.copy()));

            readers.push(fork_iterator.reader.clone());

            buffers.push(buffer);
        }
    }

    if (buffers.length > 0) {

        //Go with the longest buffer;

        let IDEAL_INDEX = 0;
        let longest_buffer = 0;
        let i = 0;
        let AMBIGUOUS = false;

        for (const buffer of buffers) {
            if (buffer.length > longest_buffer) {
                IDEAL_INDEX = i;
                longest_buffer = buffer.length;
                AMBIGUOUS = false;
            } else if (buffer.length == longest_buffer) {
                AMBIGUOUS = true;
            }
            i++;
        }
        if (AMBIGUOUS) {
            console.warn("Using first match to resolve Ambiguous parse " + buffers.length);
            //throw new Error("Unable To Handle Ambiguous parses");
        }


        const ideal_tokens = tokens[IDEAL_INDEX];
        const ideal_buffer = buffers[IDEAL_INDEX];
        const ideal_reader = readers[IDEAL_INDEX];


        //iterator.stack.pointer -= 1;

        iterator.production_id = fork_iterator.production_id;

        iterator.tokens[0].impersonate(ideal_tokens[0]);
        iterator.tokens[1].impersonate(ideal_tokens[1]);

        iterator.reader.setTo(ideal_reader.cursor);

        return ideal_buffer.slice(0, -1);

    }

    return [];
}
