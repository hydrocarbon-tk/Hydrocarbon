#include "../include/ast_ref.h"

#include <string>
#include <iostream>

using namespace HYDROCARBON;

ASTRef::ASTRef(void *val) { store = (u64)val; }

ASTRef::ASTRef(unsigned offset, unsigned length)
{
    store = (((u64)offset) << 32) | ((((u64)length) << 2) & 0x3FFF'FFFF) | 1;
}

bool ASTRef::isNode() const { return (3 & store) == 0; }

bool ASTRef::isToken() const { return (3 & store) == 1; }

bool ASTRef::isVector() const { return (3 & store) == 3; }

void *ASTRef::toNode() const { return isNode() ? (void *)store : nullptr; }

void ASTRef::print(const char *input) const
{
    if (isToken())
    {
        const unsigned token_offset = (unsigned)((store >> 32) & 0xFFFF'FFFF);
        const unsigned token_length = (unsigned)((store >> 2) & 0x3FFF'FFFF);

        std::string out_string(&input[token_offset], token_length);

        std::cout << out_string << std::endl;
    }
    else
    {
        std::cout << "AST Pointer: " << store << std::endl;
    }
}
