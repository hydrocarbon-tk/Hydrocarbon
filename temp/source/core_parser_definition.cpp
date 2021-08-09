#include "../include/parser_entry.h"

namespace HYDROCARBON
{

    ASTRef parserCore(char *utf8_encoded_input, unsigned long input_byte_count,
                      unsigned char *sequence_data, StackFunction stack_function,
                      ReduceFunction *reduce_functions)
    {

        init_data((unsigned char *)utf8_encoded_input, input_byte_count, input_byte_count * 4);

        // upload string data
        int fork_count =
            recognize(input_byte_count, 0, sequence_data, stack_function);

        // start process
        auto forks = get_fork_pointers();

        DataRef &fork1 = *forks[0];
        DataRef &fork2 = *forks[1];
        DataRef &fork3 = *forks[2];
        DataRef &fork4 = *forks[3];
        DataRef &fork5 = *forks[4];
        DataRef &fork6 = *forks[5];

        if (fork1.VALID)
            return convertForkToASTRef(fork1, reduce_functions);
        else
            return createInvalidParseASTRef(fork1);
    }

    ASTRef createInvalidParseASTRef(DataRef &fork)
    {
        return ASTRef(fork.byte_offset, fork.byte_length, true);
    }

    ASTRef convertForkToASTRef(DataRef &fork, ReduceFunction *reduce_functions)
    {

        unsigned short *block = get_next_command_block(&fork);

        auto short_offset = 0, token_offset = 0;
        auto high = block[short_offset++];
        auto limit = 1000000;
        auto length = 0;
        auto offset = 0;
        auto stack_pointer = 0;

        ASTRef stack[1024];

        while (limit-- > 0)
        {

            auto low = high;

            if (low == 0)
                break;

            high = block[short_offset++];

            auto rule = low & 3;

            switch (rule)
            {
            case 0: // REDUCE;
            {
                auto body = (low >> 8) & 0xFF, len = ((low >> 3) & 0x1F);

                if (low & 4)
                {
                    body = (body << 8) | len;
                    len = high;
                    short_offset++;
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
                    length = ((length << 16) | high);
                    short_offset++;
                }

                auto token = ASTRef(token_offset, length);

                stack[stack_pointer++] = token;

                token_offset += length;
            }
            break;

            case 2: // SKIP
            {

                auto length = (low >> 3) & 0x1FFF;

                if (low & 4)
                {
                    length = ((length << 16) | high);
                    short_offset++;
                }

                auto token = ASTRef(token_offset, length);

                token_offset += length;
            }
            }

            if (short_offset > 63)
            {
                block = get_next_command_block(&fork);
                short_offset = 0;
            }
        }

        return stack[0];
    }
} // namespace HYDROCARBON