
### Documentation 
- Create documentation for grammar usage
- Create documentation for parser usage

### Library
- Make completer a library function
- Make State & Lexer library functions

### Parser
- Implement an optional collector for skipped values; Include a flag for non-whitespace skips.
- Implement error recovery 
- Implement parse forests <sub>low priority</sub>
- Make C++ and/or Rust targets for recognizer
- Implement action streaming for concurrent recognizing/completing
- Implement arbitrary parse entry
    > Allow parser to start anywhere within an input string with any production set as the goal.

### Grammar
- Improve toggling of ignored symbols
- Allow parse functions to be defined in separate files
- Remove Non Ascii symbols from HCG grammar
- Change production head notation from `<> production_id >` and `+ production_id >` to  `< production_id >` and `+ production_id >`


### CLI
- Convert interface to wax
- Add compilation reporting

### Extra Features
- Create browser based language inspector
- Create grammar playground

## Reporting
- ### Compiling
    - Report failed productions [names, error message]
    - Report number of productions completed
    - Report average parse time per production

