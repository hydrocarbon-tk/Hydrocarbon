#pragma once

namespace HYDROCARBON {

class Lexer;
class ParserData;
class ParserDataBuffer;
class DataRef;
class ASTRef;

typedef unsigned long long u64;

typedef unsigned u32;

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
typedef int (*StackFunction)(Lexer &, ParserData &, ParserDataBuffer &,
                             unsigned int, unsigned int, unsigned int);
} // namespace HYDROCARBON