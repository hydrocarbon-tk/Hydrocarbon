# [API](./api.index.md)::Symbol


A symbol either represent a sequence of input characters that are combined together to form
a token or it represents a unique grouping of symbols. A production body is comprised of one or
more symbols. There are 3 types of symbols that can be defined in a Hydrocarbon grammar.


- **Terminal Symbols**:
These symbols represent character sequences that form a unique token which which may be encountered
within an input.

- **Non-Terminal Symbols**: 
These symbols are primarily references to productions within the current grammar file or
external grammar files, which intern may define a series of terminal and non-terminal symbols
within the production's bodies. 

- **Modifier Symbols**:
These symbols augment existing symbols and change how the parser treats them.


## Non-Terminal Symbols

### Production Symbol

###### RegEx Syntax
```regex
[\w\_][\w\d\_]*
```
Production that is defined within the current grammar module.

### Import Production Symbol

###### RegEx Syntax
```regex
(?<moduleName>[\w\_][\w\d\_]*)\s*::\s*(?<productionName>[\w\_][\w\d\_]*)
```
Productions referenced from another grammar module.

### Recovery Symbol

###### RegEx Syntax
```regex
g:rec
```

The recovery symbol can be used in conjunction with user defined IR blocks to handle
parse errors. 

### Inline Production

- `( <production_bodies> )` : defines an anonymous production with its own distinct set of [production bodies](./api.production_body.index.md). 
Multiple production bodies can be defined with the parenthesis by sperating each body with a `|` character. 

Each body can contain defined using the exact same syntax is as used within normal productions bodies defined in a named production, 
including a inline productions within inline productions:



### List Production

Indicates that the proceeding symbol may be repeated a number of times. There are two main forms:

- `<symbol>(+)` : one or more repetitions of `<symbol>`

- `<symbol>(*)` : zero or more repetitions of `<symbol>`

A terminal symbol may also be specified to indicate that each repetition should be separated by
the token defined by the terminal symbol.

- `<symbol>(+<terminal-symbol>)`: one or more repetitions of `<symbol>` separated by `<terminal-symbol>` 

- `<symbol>(*<terminal-symbol>)`: zero or more repetitions of `<symbol>` separated by `<terminal-symbol>` 


Note the lack of space between `(` and `*`, or `(` and `+`. This is important; `<symbol>( * )` will not
be parsed as a list production, but `<symbol>(* )` or `<symbol>(*)` will.

## Terminal Symbols

### Escaped Terminal Symbol

###### RegEx Syntax
```regex
\\.*+\s
```

This is the general form of a specified sequence of characters / codepoints

### Exclusive Terminal Symbol

###### RegEx Syntax
```regex
t:[\w\d\_\-]+
```

This type of symbol will always match even if a generated symbol or an non-exclusive symbol would also match.

### Generated Symbol

- `g:sp`

- `g:nl`

- `g:num`

- `g:nums`

- `g:id`

- `g:ids`

- `g:sym`

- `g:syms`


Hydrocarbon provides several generated symbols similar to character classes found within RegEx. 

### Production Token Symbol

###### RegEx Syntax
```
regextk:(?<productionSymbol>)
```

*Production Token* symbols use a [production](./api.production.index.md) to serve as the basis for a token symbol. This allows complex tokens to be described using the same syntax as one would use for normal productions. The difference is a *production token* is atomic; that is whatever characters where recognized in the parsing of the production are returned as a single, irreducible token. Any parse actions described in the production or it's sub-productions are ignored. 

A common use case for such symbols are when defining comments that should be ignored: 
```
@IGNORE tk:comment

<> comment > \/* ( g:id | g:nl | g:sp | g:num | g:sym )(*) \*/ 
    | \// ( g:id | g:sp | g:num | g:sym )(*)


```

## Modifier Symbols

> One note concerning production tokens. Productions tokens are greedy. This means that when parsing an input where 

### Annotated Symbol

###### RegEx Syntax
```regex
(?<symbol>.*)^(?<identifier>[\w\_][\w\d\_]*)
```

example:`g:id^primary_ident`

An annotation can be applied to a symbol for referential use within parse actions.

### Non-Capture Symbol

###### RegEx Syntax
```regex
\?\=(?<symbol>.*)
```
example:`g:num ?=g:id`

Used to define a symbol that should be match but should not be included within the current production body. Most often used when a trivial lookahead is required.

### Optional Symbol

###### RegEx Syntax
```regex
(?<symbol>.*)\?
```

examples: `g:id?` | `\hello \world ?`



