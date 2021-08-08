#pragma once
#include "./type_defs.h"

/*
 * Copyright 2021 Anthony C Weathersby
 * Licensed under MIT
 */

#include "ast_ref.h"
#include <string>

namespace HYDROCARBON
{

  struct String : public ASTRef
  {
  };

  struct VAL
  {
    // virtual std::string toString() const;

    // operator new(){};
  };

  struct Node : public VAL
  {
  };

} // namespace HYDROCARBON
