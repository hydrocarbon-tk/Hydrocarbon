#pragma once

#include "./core_parser.h"
#include "./ast_ref.h"
#include "./type_defs.h"

namespace HYDROCARBON
{
    ASTRef parserCore(char *, unsigned long, StackFunction, ReduceFunction *);

    ASTRef createInvalidParseASTRef(DataRef &);

    ASTRef convertForkToASTRef(DataRef &, ReduceFunction *, char *);
} // namespace HYDROCARBON