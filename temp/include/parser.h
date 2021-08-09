
#pragma once
#include "./core_parser.h"
#include "./node_base.h"
#include "./parser_entry.h"
#include "./spec_parser.h"

namespace myParser {

    using HYDROCARBON::ASTRef;

    enum class type_enum : unsigned {

        UNDEFINED,
        FUNCTION,
PARAM
    };
    unsigned char sequence_lookup[22] = {40,41,123,125,44,69,78,68,95,79,70,95,80,82,79,68,85,67,84,73,79,78};

    
class BASE : public HYDROCARBON::NODE{
    public:
    const type_enum type = type_enum::UNDEFINED;

    BASE(type_enum type_) : HYDROCARBON::NODE(), type(type_){}
};;

class FUNCTION : public BASE { 
            public:
            
HYDROCARBON::ASTRef name = 0;
HYDROCARBON::ASTRef params = 0;
HYDROCARBON::ASTRef body = 0;    

        FUNCTION( HYDROCARBON::ASTRef name_,HYDROCARBON::ASTRef params_,HYDROCARBON::ASTRef body_ ) 
            : BASE(type_enum::FUNCTION), name(name_),params(params_),body(body_) {}
        };;

class PARAM : public BASE { 
            public:
            
HYDROCARBON::ASTRef name = 0;    

        PARAM( HYDROCARBON::ASTRef name_ ) 
            : BASE(type_enum::PARAM), name(name_) {}
        };
    
    HYDROCARBON::ReduceFunction reduce_functions[] = {[](HYDROCARBON::ASTRef * stack, int len){return stack[len-1];}, [](HYDROCARBON::ASTRef * stack, int len){return (ASTRef(new FUNCTION(stack[0],stack[2],stack[5]))); },
[](HYDROCARBON::ASTRef * stack, int len){return (ASTRef(new FUNCTION(stack[0],0,stack[4]))); },
[](HYDROCARBON::ASTRef * stack, int len){return (ASTRef(new PARAM(stack[0]))); },
[](HYDROCARBON::ASTRef * stack, int len){return (ASTRef::vector(stack[0])); },
[](HYDROCARBON::ASTRef * stack, int len){return (stack[0].push(stack[2]),stack[0]); }};
    
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