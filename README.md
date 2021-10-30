# See official repo at [Candlelib/Hydrocarbon](https://github.com/candlelibrary/hydrocarbon)
# Hydrocarbon

Hydrocarbon is a general purpose parser and AST generator 
with output targets for Typescript, Rust, C++, WebAssembly, and Golang.
It provides utilities for describing both Grammars and language
agnostic Abstract Syntax Tree, and runtime system for traversing
and transforming AST nodes. For targets that support such features, it can
generate multi-threaded, streaming parsers.

Hydrocarbon utilize a unique hybrid parser algorithm to deliver
parsers capable of handling ambiguous grammars outside the 
scope of LL and LR based parsers. 

### Features
- Lazy Evaluation / Multi-threaded parsing
- Automatic AST code generation
- Modular Grammars
- Custom Lexers 
- Multiple Language Targets
- Arbitrary Grammar Entrypoints
- Rich parser diagnostics
- Native UTF8 support

## Usage

### Install

At this time the Hydrocarbon compiler is written in Typescript.
Plans are in motion to convert to a compiled language, but at this point
a recent version of NodeJS is required to compile Grammars.

```bash
$ npm install -g @candlelib/hydrocarbon 
```

### Compile A Grammar

```bash
# TypeScript
$ hydrocarbon compile --type ts ./grammar.hcg

# Golang
$ hydrocarbon compile --type go ./grammar.hcg

# Rust
$ hydrocarbon compile --type rust ./grammar.hcg
```


