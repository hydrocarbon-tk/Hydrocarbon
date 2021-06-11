import { Lexer } from "@candlelib/wind";
import fs from "fs";
import { fillByteBufferWithUTF8FromString } from "../runtime/parser_loader.js";
import { initializeUTFLookupTableNew } from "../runtime/parser_memory_new.js";
import { HCG3Grammar } from "../types/grammar_nodes.js";
import { HCGTokenPosition } from "../types/parser.js";
import { ParserEnvironment } from "../types/parser_environment.js";
import { RDProductionFunction } from "../types/rd_production_function.js";
import { Helper } from "./helper.js";
import { renderRecognizerAsJavasScript, renderJavaScriptReduceFunctionLookupArray } from "./compiler.js";


export function adHocParse(
    grammar: HCG3Grammar,
    recognizer_functions: RDProductionFunction[],
    runner: Helper,
    input_string: string,
    env: ParserEnvironment = {},
    AN = false

) {

    const str = renderRecognizerAsJavasScript(
        grammar,
        recognizer_functions,
        runner
    );

    const fn = new Function(str + "\n return {get_next_command_block, sequence_lookup, lookup_table, run, dispatch, init_data, recognizer,get_fork_information}")();

    const reduce_function_str = renderJavaScriptReduceFunctionLookupArray(grammar);

    const reduce_functions = new Function("return" + reduce_function_str)();

    const {
        dispatch,
        lookup_table,
        run,
        sequence_lookup,
        init_data,
        recognizer,
        get_fork_information,
        get_next_command_block
    } = fn;

    // Post 
    //----------------------------------------------------------------------------
    // Static Initialization
    initializeUTFLookupTableNew(lookup_table);

    let i = 0;

    for (const code_point of grammar.sequence_string.split("").map(s => s.charCodeAt(0)))
        sequence_lookup[i++] = code_point;

    //----------------------------------------------------------------------------
    // Dynamic Initialization
    const input_size = input_string.length * 4;

    const data = init_data(input_size, input_size, 512);

    const { input, rules, debug, error } = data;

    const byte_length = fillByteBufferWithUTF8FromString(input_string, input, input_size);

    //----------------------------------------------------------------------------
    // Recognizer Pass
    const result = recognizer(data, byte_length, 0);

    //----------------------------------------------------------------------------
    // Recognizer Directed Parsing
    const
        forks = get_fork_information(),
        fns = reduce_functions,
        stack = [];

    if (forks.length == 1) {
        //Normal parse
        const fork = forks[0];
        let limit = 1000000;
        let block = get_next_command_block(fork);
        let short_offset = 0;
        let token_offset = 0;
        let pos: HCGTokenPosition[] = [];
        let high = block[short_offset++];

        if (fork.valid == false) {

            const lex = new Lexer(input_string);

            lex.off = fork.byte_offset;
            lex.tl = fork.byte_length;

            let i = fork.byte_offset;

            for (; input_string[i] != "\n" && i >= 0; --i)
                ;

            lex.line = fork.line;
            lex.column = fork.byte_offset - i;

            lex.throw(`Unexpected token [${input_string.slice(lex.off, lex.off + lex.tl)}]`);

            throw Error("Could not parse data");
        }

        if (short_offset > 63) {
            get_next_command_block(fork);
            short_offset = 0;
        }

        while (limit-- > 0) {

            let low = high;

            if (low == 0)
                break;

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

                        const
                            pos_a = pos[pos.length - len] || { offset: 0, length: 0 },
                            pos_b = pos[pos.length - 1] || { offset: 0, length: 0 },
                            e = stack.slice(-len),
                            token_position: HCGTokenPosition = {
                                line: 0,
                                column: 0,
                                offset: pos_a.offset,
                                length: pos_b.offset - pos_a.offset + pos_b.length
                            };

                        if (AN)
                            console.log(stack, fns[body].toString());

                        pos[stack.length - len] = token_position;
                        stack[stack.length - len] = fns[body](env, e, token_position);
                        stack.length = stack.length - len + 1;
                        pos.length = pos.length - len + 1;


                    } break;

                case 1: { //SHIFT;
                    let length = (low >>> 3) & 0x1FFF;

                    if (low & 4) {
                        length = ((length << 16) | high);
                        short_offset++;
                    }

                    stack.push(input_string.slice(token_offset, token_offset + length));
                    pos.push({ offset: token_offset, length: length });
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

    return { result: stack };
}
;
