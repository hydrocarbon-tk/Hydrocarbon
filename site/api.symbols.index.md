# [API](./api.index.md)::Symbol

Symbols make up the bulk of any grammar and represent the acceptable parsable tokens that can be
encountered within an input. Hydrocarbon makes 3 distinct symbol classifications:

- Non-Terminal Symbols: 
These symbols are primarily references to productions within the current grammar file or
external grammar files. 

- Terminal Symbols:
These symbols represent author prescribed character sequences and general character sequences
in form of generated symbols that are converted into Tokens.

- Modifier Symbols:
These symbols augment existing symbols and change how the parser treats theme.


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

###### RegEx Syntax
```regex
\((<body>.+)(|.+)*\)
```

Declares an anonymous production with it's own distinct set 
of bodies. 


### List Production

- One or more: 
###### RegEx Syntax
```regex
(?<symbol>.*)\(\+\)
```
- Zero or more: 
###### RegEx Syntax
```regex
(?<symbol>.*)\(\*\)
``` 
- One or more with seperator: 
###### RegEx Syntax
```regex
(?<symbol>.*)\(\+(?<symbol>.*)\)
```
- Zero or more with seperator: 
###### RegEx Syntax
```regex
(?<symbol>.*)\(\*(?<symbol>.*)\)
```

Note the lack of space between `(` and `*`, or `(` and `+`. This is important; `<symbol> ( * )` will not
be parsed as a list production, but `<symbol> (* )` or `<symbol> (*)` will.

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

- `g:id`

- `g:sym`

Hydrocarbon provides several generated symbols similar to character classes found within RegEx. 

### Production Token Symbol

###### RegEx Syntax
```
regextk:(?<productionSymbol>)
```

*Production Token* symbols use a [production](./api.production.index.md) to serve as the basis for a token symbol. This allows complex tokens to be described using the same syntax as one would use for normal productions. The difference is a *production token* is atomic; that is whatever characters where recognized in the parsing of the production are returned as a single, irreducible token. Any reduce actions described in the production or it's sub-productions are ignored. 

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

An annotation can be applied to a symbol for referential use within reduce actions.

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



