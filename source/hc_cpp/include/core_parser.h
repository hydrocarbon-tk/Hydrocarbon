#pragma once
#include "./character_lookup_table.h"
#include "./type_defs.h"
#include <vector>
namespace HYDROCARBON
{

    /////////////////////////////////////////////
    // LEXER
    /////////////////////////////////////////////
    struct Input
    {
        u8 *input;
        u32 length;
    };

    class Lexer
    {
    public:
        u32 byte_offset = 0;
        u32 token_offset = 0;
        unsigned short byte_length = 0;
        unsigned short token_length = 0;
        u32 prev_byte_offset = 0;
        u32 _type = 0;
        unsigned short line = 0;
        unsigned short current_byte = 0;

        Lexer();
        i32 setToken(i32, u32, u32);
        u32 getType(Input, bool);
        bool isSym(Input, bool);
        bool isNL();
        bool isSP(bool);
        bool isNum(Input);
        bool isUniID(Input);
        Lexer copyInPlace();
        Lexer &sync(Lexer &);
        Lexer &slice(Lexer &);
        Lexer &next(Input);
        bool END(Input);
    };

    /////////////////////////////////////////////
    // PARSER STATE
    /////////////////////////////////////////////

    class ParserState
    {
    public:
        Lexer lexer;
        // 8 byte +
        std::vector<StackFunction> stack;
        std::vector<u16> rules;
        std::vector<i32> stash;
        u8 *input = 0;
        ParserState *origin = 0;

        // 4 byte
        u32 state;
        u32 active_token_productions = 0;
        u32 origin_fork = 0;
        u32 input_len = 0;
        i32 prod;

        // 1 byte
        bool VALID = 0;
        bool COMPLETED = 0;
        u8 refs = 0;

        ParserState(u8 *, u32);
        void sync(ParserState *);
        u32 get_stack_len();
        u32 get_rules_len();
        u32 get_input_len();
        void push_fn(StackFunction, i32);
        Input get_input_array();
        u8 get_byte_from_input(u32);
        void reset(Lexer &, u32, u32);
        ParserState &fork(ParserStateBuffer &);
        void add_rule(u32);
    };
    /////////////////////////////////////////////
    // PARSER STATE Iterator
    /////////////////////////////////////////////
    class ParserStateIterator
    {
        ParserState *current;
        std::vector<ParserState *> refs;
        u32 index;
        u32 limit;
        bool valid;

    public:
        ParserStateIterator(ParserState &state);

        bool is_valid();

        u16 next();
    };

    /////////////////////////////////////////////
    // PARSER STATE BUFFER
    /////////////////////////////////////////////

    class ParserStateBuffer
    {
    public:
        std::vector<ParserState *> data;

        ParserStateBuffer();
        ~ParserStateBuffer()
        {
            //Make sure held ParserStates are deleted.
            for (auto it = data.begin(); it != data.end(); ++it)
            {
                auto ptr = *it;
                delete ptr;
            }
        };
        ParserState *remove_state_at_index(i32);
        u32 len();
        ParserState *create_data(u8 *, u32);
        void add_state_pointer(ParserState *);
        u32 add_state_pointer_and_sort(ParserState *);
        bool have_valid();
        ParserState *get_valid_parser_state();
        ParserState &get_mut_state(u32);
        ParserState &get_ref_state(u32);
        ParserState *get_recycled_ParserState(ParserState &);
        ParserState &fork(ParserStateBuffer &);
    };
    class DataRef
    {
    public:
        ParserState *ptr = 0;
        bool VALID = 0;
        u32 depth = 0;
        u32 byte_offset = 0;
        u32 byte_length = 0;
        u32 line = 0;
        u32 command_offset = 0;
        unsigned short command_block[64] = {0};
        DataRef(ParserState *, bool, u32, u32, u32, u32);
    };

    /////////////////////////////////////////////
    // PARSER RESULT BUFFERS
    /////////////////////////////////////////////

    struct ParserResultBuffers
    {
        ParserStateBuffer *valid;
        ParserStateBuffer *invalid;
        int *reference;

        ParserResultBuffers(
            ParserStateBuffer *_valid,
            ParserStateBuffer *_invalid) : valid(_valid),
                                           invalid(_invalid)
        {
            reference = new int(0);

            (*reference) += 1;
        }

        ParserResultBuffers(
            const ParserResultBuffers &origin) : valid(origin.valid),
                                                 invalid(origin.invalid)
        {
            (*reference) += 1;
        }

        ~ParserResultBuffers()
        {
            (*reference) -= 1;
            if (*reference == 1)
            {
                delete reference;
                delete invalid;
                delete valid;
            }
        }
    };

    /////////////////////////////////////////////
    // OTHER FUNCTIONS
    /////////////////////////////////////////////

    u32 getUTF8ByteLengthFromCodePoint(u32);
    u32 utf8ToCodePoint(u32, Input);
    u32 getTypeAt(u32);
    u32 createState(u32);

    bool token_production(ParserState &, StackFunction, u32, u32, u32);
    u32 compare(ParserState &, u32, u32, u32, u8 *);
    ParserState *create_parser_data_object(u8 *, u32, u32);
    bool is_output_enabled(u32);
    void add_reduce(ParserState &, u32, u32 = 0);
    void add_shift(ParserState &, u32);
    void add_skip(ParserState &, u32);
    bool consume(ParserState &);
    bool step_kernel(ParserState &, ParserStateBuffer &, u32);
    i32 run(ParserStateBuffer &,
            ParserStateBuffer &,
            ParserStateBuffer &,
            u32);

    ParserResultBuffers recognize(u8 *, u32, u32, StackFunction);

    i32 set_production(ParserState &, ParserStateBuffer &, i32);
}