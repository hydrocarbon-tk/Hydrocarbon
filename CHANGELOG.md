## [v0.13.1-canary] - 2021-09-30 

- [2021-07-17]

    Added code to handle special case of production "__entries__" which allows user to define a list of productions names that can be used to to enter the grammar at a particular production, effectively creating sub-grammar parsers using the same base parser.

- [2021-07-17]

    Added exclusive literals to employ defined IDs that always capture even in the presence of generated ids. This allows reserved "keywords" to be defined in grammars.

## [v0.12.0] - 2021-06-28 

- [2021-06-25]

    Added root production specification `<> >>*<< production_name > ...` that allows specific production to be defined as entry points for sub-grammar recognition.

## [v0.11.0] - 2021-06-16 

- [2021-06-16]

    Updated CLI. Added `check-emsdk` sub-command, which installs Emscripten if it cannot be found on PATH. This runs as it's own command and in `compile` sub command if the `recognizer` argument is set to *wasm*.

- [2021-06-16]

    Removed EMSDK install command. Will replace with CLI based check for emsdk followed by a prompt to install if the SDK can't be found

## [v0.10.0] - 2021-06-16 

- [2021-06-16]

    Updated HCG parser to make use of WASM recognizer code.

- [2021-06-15]

    Updated README.md. Improved description of package, grammar information, and usage.

- [2021-06-15]

    Re-implemented WASM target through C++ source file rendering and Emscripten tool chain.

## [v0.9.0] - 2021-06-13 

- [2021-06-11]

    Added error list to grammar compilation to track all errors encountered while compiling a grammar.

- [2021-06-11]

    Added hcg3 grammar and parser

- [2021-06-09]

    Reordered code point LU table assignments to allow code point types to be assigned before id classes (UNICODE_START & UNICODE_CONTINUE) to ensure all symbols have a type value greater than 0.

## [v0.8.1-alpha] 

- No changes recorded prior to this version.