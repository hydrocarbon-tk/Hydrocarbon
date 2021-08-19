#pragma once

namespace HYDROCARBON
{

   class Lexer;
   class ParserState;
   class ParserStateIterator;
   class ParserStateBuffer;
   class DataRef;
   class ASTRef;

   typedef long long i64;

   typedef unsigned long long u64;

   typedef int i32;

   typedef unsigned u32;

   typedef short i16;

   typedef unsigned short u16;

   typedef char i8;

   typedef unsigned char u8;

   typedef double f64;

   typedef float f32;

   /**
 * A function used to produce ASTRef nodes from the current
 * slice of the recognizer node.
 */
   typedef ASTRef (*ReduceFunction)(ASTRef *, int);

   /**
 *  A function that can be inserted into the ParserData function
 *  state stack
 */
   typedef int (*StackFunction)(ParserState &, ParserStateBuffer &, int);
} // namespace HYDROCARBON