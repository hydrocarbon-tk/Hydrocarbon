#include "hc_cpp/include/completer.h"

namespace HYDROCARBON
{

    ASTRef parserCore(u8 *utf8_encoded_input,
                      u32 input_byte_count,
                      i32 expected_resolved_id,
                      StackFunction stack_function,
                      ReduceFunction *reduce_functions)
    {

        ParseResultBuffers result = recognize(
            utf8_encoded_input,
            input_byte_count,
            expected_resolved_id,
            stack_function);

        auto &valid = result.valid;
        auto &invalid = result.invalid;

        if (valid.len() > 0)
        {
            auto &farthest_success = valid.get_ref_state(0);
            if (farthest_success.lexer.byte_offset >= input_byte_count)
            {
                return convertForkToASTRef(farthest_success, reduce_functions);
            }
        }

        if (failure.length > 0)
        {
            auto &farthest_failure = invalid.get_ref_state(0);
            return ASTRef(farthest_failure.lexer.byte_offset, farthest_failure.lexer.byte_length, true);
        }

        return ASTRef(0, 0, true);
    }

    ASTRef createInvalidParseASTRef(DataRef &fork)
    {
        return ASTRef(fork.byte_offset, fork.byte_length, true);
    }

    ASTRef convertForkToASTRef(ParserState &state, ReduceFunction *reduce_functions)
    {

        ParserStateIterator iter(state);

        auto token_offset = 0;
        auto length = 0;
        auto offset = 0;
        auto stack_pointer = 0;

        ASTRef stack[1024];

        while (iter.is_valid())
        {

            auto instr = iter.next();

            auto rule = instr & 3;

            switch (rule)
            {
            case 0: // REDUCE;
            {
                auto body = (low >> 8) & 0xFF, len = ((low >> 3) & 0x1F);

                if (instr & 4)
                {
                    body = (body << 8) | len;
                    len = iter.next();
                }

                stack[stack_pointer - len] = reduce_functions[body](&stack[stack_pointer - len], len);

                stack_pointer = stack_pointer - len + 1;
            }
            break;

            case 1: // SHIFT;
            {
                auto length = (low >> 3) & 0x1FFF;

                if (low & 4)
                {
                    length = ((length << 16) | iter.next());
                }

                auto token = ASTRef(token_offset, length);

                token.print(utf8_encoded_input);

                stack[stack_pointer++] = token;

                token_offset += length;
            }
            break;

            case 2: // SKIP
            {

                auto length = (low >> 3) & 0x1FFF;

                if (low & 4)
                {
                    length = ((length << 16) | iter.next());
                }

                auto token = ASTRef(token_offset, length);

                token_offset += length;
            }
            }
        }

        return stack[0];
    }
} // namespace HYDROCARBON