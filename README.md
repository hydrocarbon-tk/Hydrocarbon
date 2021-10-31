# See official repo at [Candlelib/Hydrocarbon](https://github.com/candlelibrary/hydrocarbon)

![Hydrocarbon](./site/resources/img/test.webp)

Hydrocarbon is a general purpose parser and AST generator 
with output targets for Typescript, Rust, C++, WebAssembly, and Go.
It provides utilities for describing both Grammars and language
agnostic Abstract Syntax Tree, and runtime system for traversing
and transforming AST nodes. For targets that support such features, it can
generate multi-threaded, streaming parsers.

Hydrocarbon utilize a unique hybrid parser algorithm to deliver
parsers capable of handling ambiguous grammars outside the 
scope of LL and LR based parsers. It's grammars are written in a language agnostic
syntax that allows separation of language description and parse actions.

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
a recent version of NodeJS is required to compile `*.hcg` files. Output files are 
rendered in the target language. 

```bash
$ npm install -g @candlelib/hydrocarbon 
```

### Write A Grammar

Checkout the [writing a grammar](./site/tutorial.creating_a_grammar.index.md) doc for details on writing a grammar to
suite your needs. 

### Compile A Grammar

```bash
# TypeScript
$ hydrocarbon compile --type ts ./grammar.hcg

# Golang
$ hydrocarbon compile --type go ./grammar.hcg

# Rust
$ hydrocarbon compile --type rust ./grammar.hcg
```

### CLI 



### Docs

- [Getting Started: Writing A Grammar](./site/tutorial.creating_a_grammar.index.md)
- [API](./site/api.index.md)
- [Parser Architecture](./site/architecture/parser_architecture.index.md)

## Licenses

The core parser compiler is licensed under GPL-V3.

Parser runtime modules and generated parser code are licensed under MIT licenses.

## [Contributing](./CONTRIBUTING.md)
## [Code Of Conduct](./CODE_OF_CONDUCT.md)