# [API](./api.index.md)::Architecture

These docs provide an overview of the architecture implemented in the grammar compiler, parser compiler, and parser runtimes. 
These documents are for those who interested in gaining an understanding of the inner workings of Hydrocarbon. If you are
interested in contributing improvements to the core compiler/runtime code, it is recommended that you review these docs
to get a good understanding of how all the code comes together. 

# Core Modules

Hydrocarbon has a highly modular architecture to facilitate ease of design and implantation. There are two major architectural focuses: Compile Time Modules and Runtime Modules. 

## Compiler Modules

### [Grammar Compiler](./architecture.grammar_compiler.index.md)

Compiles a given grammar description into a compiled grammer repository (`*.hcg.repo`) file, which is a JSON formatted document that provides all information necessary for other compiler modules to convert the grammar into a target output.

### [ASYTrip AST Compiler](./architecture.asytrip_compiler.index.md)

ASYTrip is a cross language AST compiler that takes reduce actions written in ASYTrip syntax ( a strict subset of ECMAScript ) and converts them into AST construction functions that can target multiple language outputs.

### [JavaScript AST Compiler](./architecture.js_compiler.index.md)

This simple module will convert JavaScript based reduce actions into completer functions.  

### [IR State Compiler](./architecture.ir_compiler.index.md)

This module will convert grammar productions into intermediate representation parse states. 

### [Bytecode Generator](./architecture.bytecode_compiler.index.md)

This module converts IR States into byte code, and optionally render state machine dissassembly for review.


# Runtime Modules

A runtime package exists for each target language that intended to provide the core parsing engine. Each one
is implemented in roughly the same way, with variations dependent on restrictions or features provided by the target language
architecture. 

A detailed description of each implementation is not provided here and can only be gained through
the direct review of the source code of a target language module. What you'll instead find here is a general description
of the main components that are implemented in each package. 

- [State Machine](./architecture.state_machine.index.md)

- Reader

- Parser Iterator

This system converts an input into parse actions. 

[API Documentation](./api.index.md)


