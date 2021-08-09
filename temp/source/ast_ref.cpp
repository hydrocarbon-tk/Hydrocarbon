#include "../include/ast_ref.h"

#include <string>
#include <iostream>
#include <cstdarg>

using namespace HYDROCARBON;

ASTRef::ASTRef(void *val) { store = (u64)val; }

ASTRef::ASTRef(unsigned offset, unsigned length, bool invalid)
{
    int valid = invalid ? 2 : 1;
    store = (((u64)offset) << 32) | ((((u64)length) << 2) & 0x3FFF'FFFF) | valid;
}

bool ASTRef::isNull() const { return store == 0; }

bool ASTRef::isNode() const { return (3 & store) == 0; }

bool ASTRef::isToken() const { return (3 & store) == 1; }

bool ASTRef::isInvalidToken() const { return (3 & store) == 2; }

bool ASTRef::isVector() const { return (3 & store) == 3; }

int ASTRef::size() const { return isVector() ? toVectorPtr()->size() : -1; }

ASTRef::ASTRefVector *ASTRef::toVectorPtr() const { return isVector() ? (ASTRef::ASTRefVector *)(store & PtrMask) : nullptr; }

void ASTRef::print(const char *input) const
{
    if (isToken())
    {
        std::string out_string(&input[token_offset()], token_length());

        std::cout << out_string << std::endl;
    }else if(isInvalidToken()){

        std::string out_string(&input[token_offset()], token_length());

        std::cout << "Unexpected token [ " <<  out_string << " ]" << std::endl;
        
    } else
    {
        std::cout << "ASTRef: " << store << std::endl;
    }
}

unsigned ASTRef::token_length() const {
    return (isToken() || isInvalidToken()) ? ((unsigned)((store >> 2) & 0x3FFF'FFFF)) : -1;
}

unsigned ASTRef::token_offset() const {
    return (isToken() || isInvalidToken()) ? ((unsigned)((store >> 32) & 0xFFFF'FFFF)) : -1;
}