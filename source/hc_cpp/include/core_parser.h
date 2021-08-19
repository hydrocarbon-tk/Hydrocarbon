#pragma once
#include "./character_lookup_table.h"
#include "./type_defs.h"
#include <vector>
namespace HYDROCARBON
{

    /////////////////////////////////////////////
    // LEXER
    /////////////////////////////////////////////
    class Lexer
    {
    public:
        // 8 byte
        u8 *input = 0; // 0

        // 4 byte
        u32 byte_offset = 0;              // 8
        u32 token_offset = 0;             // 12
        u32 prev_byte_offset = 0;         // 16
        u32 prev_token_offset = 0;        // 20
        u32 active_token_productions = 0; // 24
        u32 input_len = 0;                // 28
        u32 _type = 0;                    // 32

        // 2 byte
        u16 byte_length = 0;  // 36
        u16 token_length = 0; // 38
        u16 line = 0;         // 40
        u16 current_byte = 0; // 42

        Lexer(u8 *, u32);
        i32 setToken(i32, u32, u32);
        u8 get_byte_at(u32);
        u32 getType(bool);
        bool isSym(bool);
        bool isNL();
        bool isSP(bool);
        bool isNum();
        bool isUniID();
        Lexer copy_in_place();
        Lexer &sync(Lexer &);
        Lexer &set_token_span_to(Lexer &);
        Lexer &next();
        bool END();
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
        ParserState *origin = 0;

        // 4 byte
        u32 state;
        u32 origin_fork = 0;
        i32 prod;

        // 1 byte
        bool VALID = 0;
        bool COMPLETED = 0;
        u8 refs = 0;

        ParserState(u8 *, u32);
        void sync(ParserState *);
        u32 get_stack_len();
        u32 get_rules_len();
        void push_fn(StackFunction, i32);
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
        ParserState *remove_valid_parser_state();
        ParserState *get_recycled_ParserState(ParserState &);
        u32 len();
        ParserState &create_state(u8 *, u32);
        void add_state_pointer(ParserState *);
        u32 add_state_pointer_and_sort(ParserState *);
        bool have_valid();
        ParserState &get_mut_state(u32);
        ParserState &get_ref_state(u32);
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
        u16 command_block[64] = {0};
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
                                                 invalid(origin.invalid),
                                                 reference(origin.reference)
        {
            (*reference) += 1;
        }

        ~ParserResultBuffers()
        {
            (*reference) -= 1;
            if (*reference < 1)
            {
                if (invalid)
                    delete invalid;
                if (valid)
                    delete valid;
            }
        }

        ParserResultBuffers &operator=(const ParserResultBuffers &origin)
        {
            (*reference) -= 1;

            if (*reference < 1)
            {
                delete reference;
                if (invalid)
                    delete invalid;
                if (valid)
                    delete valid;
            }

            reference = origin.reference;
            invalid = origin.invalid;
            valid = origin.valid;

            (*reference) += 1;

            return *this;
        }
    };

    /////////////////////////////////////////////
    // OTHER FUNCTIONS
    /////////////////////////////////////////////

    u32 get_ut8_byte_length_from_code_point(u32);
    u32 get_utf8_code_point_at(u32, u8 *);
    u32 getTypeAt(u32);
    u32 createState(u32);

    bool token_production(Lexer &, StackFunction, u32, u32, u32);
    u32 compare(Lexer &, u32, u32, u32, u8 *);
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