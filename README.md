# See official repo at [Candlelib/Hydrocarbon](https://github.com/candlelibrary/hydrocarbon)

![Hydrocarbon](./site/resources/img/test.webp)


The Hydrocarbon Toolkit is a set of Language compilers and tools that can 
used to generate parsers, AST implementations, and diagrams for domain
specific languages and general purpose languages. 

It has build targets for several popular languages including TypeScript, Rust, 
Go, and C++. 


Existing projects enhanced by Hydrocarbon:

- Candlelibrary JS
- Candlelibrary TS
- CandleLibrary CSS

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
- [Parser Architecture](./site/architecture.index.md)

## Contributing

This project is made with ❤️. The simplest way to give back is by starring and sharing it online.

If the documentation is unclear or has a typo, please click on the page's Edit button (![pencil icon](./site/resources/img/github_pencil.svg)) and suggest a correction.

If you would like to help fix an error or add more information, please check our guidelines. Pull requests are welcome!

- [Contributing](./CONTRIBUTING.md)

- [Code Of Conduct](./CODE_OF_CONDUCT.md)

## Licenses

The toolkit is licensed under [GPL-V3](LICENSE.md).

Compiled parsers, AST code, and target language modules licensed under separate MIT licenses.
