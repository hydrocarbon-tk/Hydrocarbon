#include "include/parser.h"
#include <iostream>

using namespace HYDROCARBON;

int main()
{

  char input[] = "identifier ( APPLEJUICE ) { test }";

  ASTRef result = myParser::parse(input, sizeof(input) - 1);

  if (result.isNode())
  {
    myParser::BASE *node = result;

    if (node->type == myParser::type_enum::FUNCTION)
    {

      class myParser::FUNCTION *fn = result;

      fn->name.print(input);

      auto params = fn->params;

      if (params.isVector())
      {

        auto length = params.size();

        std::cout << "Hello World" << std::endl;

        for (auto i = 0; i < length; i++)
          ((class myParser::PARAM *)params[i])->name.print(input);
      }
    }
  }else if(result.isInvalidToken()){
    result.print(input);
  }

  return 0;
}
