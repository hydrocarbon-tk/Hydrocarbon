# Hydrocarbon Architecture

These docs provide an overview of the architecture implemented in the grammar compiler, parser compiler, and parser runtimes. 
These documents are for those who interested in gaining an understanding of the inner workings of Hydrocarbon. If you are
interested in contributing improvements to the core compiler/runtime code, it is recommended that you review these docs
to get a good understanding of how all the code comes together. 

# Core Modules

## Compilers

### Grammar Compiler

### ASYTrip AST Compiler

ASYTrip is a cross language AST compiler that takes reduce actions written in ASYTrip syntax ( a strict subset of ECMAScript ) and converts them into AST construction functions that can target multiple language outputs.

### JavaScript AST Compiler

### IR State Compiler

### Bytecode Generator 


# Runtime

A runtime module exists for each target language that intended to provide the core parsing engine
# See Also 

[API Documentation](./api.index.md)

StateIterator
    A single state machine is maintained for every independent parser and scanner 
    Actions are yielded that allow implementor to chose how to perceeed. Fork
    handling is implementation depenedent
    input is consumed based on demand. 
    
