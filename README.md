![Hydrocarbon](./site/resources/img/test.webp)


The Hydrocarbon Toolkit is a set of compilers and tools that can 
used to generate parsers, AST implementations, and diagrams for domain
specific languages and general purpose languages. 

It has build targets for several popular languages including TypeScript, Rust, 
Go, and C++. 

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
- Arbitrary Parser Entry-points
- Rich parser diagnostics
- Native UTF8 support

> Disclaimer: Hydrocarbon is a work-in-progress and not all features may be fully realized. Please be patient as ongoing dev
> work completes and improves the feature set. As Hydrocarbon is an open source project, may also want to [contribute](./CONTRIBUTING.md)
> to make the changes you want.

## Usage

### Write A Grammar

Everything Hydrocarbon can do starts with a grammar definition file. Chckout the [writing a grammar](./site/tutorial.creating_a_grammar.index.md) doc for details on writing a grammar that can suite your needs. 

### Install Hydrocarbon

```bash
$ npm i -g hctoolkit
```

### Compile a parser from a grammar

```bash
# Compiles a TypeScript parser
$ hc compile parser <grammar file>
```

### Compile a parser for a target language including [ASYTrip](./site/api.asytrip.index.md) AST code

```bash
$ hc compile parser --asytrip --type <rust|go|ts|js|c++> <grammar_filepath>
```

### Render a [bytcode](./site/architecture.bytecode.index.md) disassembly sheet and open in a browser

```bash
$ hc tools disassemble --browse <grammar_filepath>
```

### Create a fuzz string from a grammar

```bash
$ hc tools fuzz <grammar_filepath>
```

And more: checkout the [CLI reference](./packages/core/hc_root/README.md)

## Want to learn more?

Checkout out the documentation

- [Getting Started: Writing A Grammar](./site/tutorial.creating_a_grammar.index.md)
- [API](./site/api.index.md)
- [Parser Architecture](./site/architecture.index.md)


## Existing projects enhanced by Hydrocarbon

- Candlelibrary JS
- Candlelibrary TS
- CandleLibrary CSS

## Contributing

This project is made with ❤️. The simplest way to give back is by starring and sharing it online.

If the documentation is unclear or has a typo, please click on the page's Edit button (![pencil icon](./site/resources/img/github_pencil.svg)) and suggest a correction.

If you would like to help fix an error or add more information, please check our guidelines. Pull requests are welcome!

- [Contributing](./CONTRIBUTING.md)

- [Code Of Conduct](./CODE_OF_CONDUCT.md)

## Licenses

The toolkit is licensed under [GPL-V3](LICENSE.md).

Compiled parsers, AST code, and target language modules licensed under separate MIT licenses.
