#pragma once

#include "core_parser.h"
#include "ast_ref.h"
#include "type_defs.h"

namespace HYDROCARBON
{
    ASTRef parserCore(char *, unsigned long, unsigned char *, StackFunction,
                      ReduceFunction *);

    ASTRef createInvalidParseASTRef(DataRef &);

    ASTRef convertForkToASTRef(char *, DataRef &, ReduceFunction *);
} // namespace HYDROCARBON