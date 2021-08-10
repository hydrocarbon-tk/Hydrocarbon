#pragma once
#include "./character_lookup_table.h"
#include "./type_defs.h"
namespace HYDROCARBON
{
    unsigned int getUTF8ByteLengthFromCodePoint(unsigned int);
    unsigned int utf8ToCodePoint(unsigned int, unsigned char *);
    unsigned int getTypeAt(unsigned int);
    unsigned int createState(unsigned int);
    class ParserData
    {
    public:
        Lexer *lexer;
        unsigned int state;
        unsigned int prod = 0;
        int stack_ptr = 0;
        unsigned int input_ptr = 0;
        unsigned int rules_ptr = 0;
        unsigned int input_len = 0;
        unsigned int rules_len = 0;
        unsigned int origin_fork = 0;
        unsigned short *rules;
        unsigned char *input;
        unsigned char *sequence;
        StackFunction stack[256] = {0};
        unsigned int stash[256] = {0};
        ParserData *origin;
        ParserData *next = 0;
        bool VALID = 0;
        bool COMPLETED = 0;
        ParserData(unsigned char *, unsigned int, unsigned int, Lexer *);
        void sync(ParserData *);
    };
    class ParserDataBuffer
    {
    public:
        ParserData **data = new ParserData *[64];
        int len;
        ParserDataBuffer();
        void addDataPointer(ParserData *);
        void removeDataAtIndex(int);
    };
    class DataRef
    {
    public:
        ParserData *ptr = 0;
        bool VALID = 0;
        unsigned int depth = 0;
        unsigned int byte_offset = 0;
        unsigned int byte_length = 0;
        unsigned int line = 0;
        unsigned int command_offset = 0;
        unsigned short command_block[64] = {0};
        DataRef(ParserData *, bool, unsigned int, unsigned int, unsigned int, unsigned int);
    };
    class Lexer
    {
    public:
        unsigned int byte_offset = 0;
        unsigned int token_offset = 0;
        unsigned short byte_length = 0;
        unsigned short token_length = 0;
        unsigned int prev_byte_offset = 0;
        unsigned int type = 0;
        unsigned short line = 0;
        unsigned short current_byte = 0

            ;
        Lexer();
        int setToken(int, unsigned int, unsigned int);
        unsigned int getType(bool, ParserData &);
        bool isSym(bool, ParserData &);
        bool isNL();
        bool isSP(bool, ParserData &);
        bool isNum(ParserData &);
        bool isUniID(ParserData &);
        Lexer *copy();
        Lexer copyInPlace();
        Lexer &sync(Lexer &);
        Lexer &slice(Lexer &);
        Lexer &next(ParserData &);
        bool END(ParserData &);
    };
    unsigned int compare(ParserData &, unsigned int, unsigned int, unsigned int);
    ParserData *create_parser_data_object(unsigned char *, unsigned int, unsigned int);
    ParserData *fork(ParserData &, ParserDataBuffer &);
    bool isOutputEnabled(unsigned int);
    void set_action(unsigned int, ParserData &);
    void add_reduce(unsigned int, ParserData &, unsigned int, unsigned int = 0, bool = false);
    void add_shift(ParserData &, unsigned int);
    void add_skip(ParserData &, unsigned int);
    unsigned int mark(unsigned int, ParserData &);
    void reset(ParserData &, Lexer &, unsigned int, unsigned int);
    bool consume(Lexer &, ParserData &, unsigned int);
    void pushFN(ParserData &, StackFunction, int);
    bool stepKernel(ParserData &, Lexer &, ParserDataBuffer &, int);
    int insertData(ParserData *, ParserData **, int, int);
    int run(ParserData *, ParserData **, int, int, unsigned int, unsigned int);
    void clear_data();
    void init_data(unsigned char *, unsigned int, unsigned int);
    DataRef **get_fork_pointers();
    int block64Consume(ParserData *, unsigned short *, unsigned int, unsigned int, unsigned int);
    unsigned short *get_next_command_block(DataRef *);
    unsigned int recognize(unsigned int, unsigned int, unsigned char *, StackFunction);
}