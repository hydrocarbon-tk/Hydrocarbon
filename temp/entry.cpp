#include "include/parser.h"

using namespace HYDROCARBON;

int main()
{

  char input[] = "identifier ( test, test ) { test }";

  auto result = myParser::parse(input, 23);

  return 0;
}
