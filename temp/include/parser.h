
#pragma once
#include "./core_parser.h"
#include "./node_base.h"
#include "./parser_entry.h"
#include "./spec_parser.h"

namespace myParser {

    enum TYPE_enum : unsigned {
        FUNCTION,
PARAM
    };
    unsigned char sequence_lookup[22] = {40,41,123,125,44,69,78,68,95,79,70,95,80,82,79,68,85,67,84,73,79,78};

    class FUNCTION : public HYDROCARBON::Node { 
            public:
            TYPE_enum type = TYPE_enum::FUNCTION;
HYDROCARBON::ASTRef name = 0;
HYDROCARBON::ASTRef params = 0;    

        FUNCTION( HYDROCARBON::ASTRef name_,HYDROCARBON::ASTRef params_ ) 
            : HYDROCARBON::Node(), name(name_),params(params_) {}
        };;

class PARAM : public HYDROCARBON::Node { 
            public:
            TYPE_enum type = TYPE_enum::PARAM;
HYDROCARBON::ASTRef name = 0;    

        PARAM( HYDROCARBON::ASTRef name_ ) 
            : HYDROCARBON::Node(), name(name_) {}
        };
    
    HYDROCARBON::ReduceFunction reduce_functions[] = {[](HYDROCARBON::ASTRef * stack, int len){return stack[len-1];}, [](HYDROCARBON::ASTRef * stack, int len){return HYDROCARBON::ASTRef(new class FUNCTION (stack[0],stack[2])); },
[](HYDROCARBON::ASTRef * stack, int len){return HYDROCARBON::ASTRef(new class FUNCTION (stack[0],0)); },
[](HYDROCARBON::ASTRef * stack, int len){return HYDROCARBON::ASTRef(new class PARAM (stack[0])); }};
    
    HYDROCARBON::ASTRef parse(char * utf8_encoded_input, unsigned long ut8_byte_length){
        return parserCore(
            utf8_encoded_input, 
            ut8_byte_length,
            sequence_lookup, 
            $start,
            myParser::reduce_functions
            );
        }
}