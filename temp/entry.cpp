#include "include/parser.h"
#include <iostream>
#include <chrono>
#include <ctime>

using namespace HYDROCARBON;

int main()
{

  char input[] = "identifier ( APPLEJUICE, KRAKU ) { testmasson }";

  std::chrono::time_point<std::chrono::system_clock> start, end;
  start = std::chrono::system_clock::now();

  ASTRef result = myParser::parse(input, sizeof(input) - 1);

  end = std::chrono::system_clock::now();

  auto elapsed_seconds = std::chrono::duration_cast<std::chrono::microseconds>(end - start);

  std::cout << "elapsed time: " << elapsed_seconds.count() << "us\n";

  if (result.isNode())
  {
    myParser::BASE *node = result;

    if (node->type == myParser::type_enum::FUNCTION)
    {

      class myParser::FUNCTION *fn = result;

      fn->name.print(input);

      auto params = fn->params;
      auto body = fn->body;

      if (params.isVector())
      {

        auto length = params.size();

        std::cout << "Hello World" << std::endl;

        for (auto i = 0; i < length; i++)
          ((class myParser::PARAM *)params[i])->name.print(input);
      }

      body.print(input);
    }
  }
  else if (result.isInvalidToken())
  {
    result.print(input);
  }

  return 0;
}
