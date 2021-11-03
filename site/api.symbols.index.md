# API::Symbols

Symbols make up the bulk of any grammar and represent the parsable entities that may be
encountered within an acceptable input. Hydrocarbon makes four distinct symbol classifications:

- Non-Terminal Symbols: 
These symbols are primarily references to productions within the current grammar file or
external grammar files. 

- Terminal Symbols:
These symbols represent author prescribed character sequences and general character sequences
in form of generated symbols that are converted into Tokens.

- Modify Symbols:
These 

## Non-Terminal Symbols

### Production Symbol

### Import Production Symbol

`<module-name>::<production-symbol>`

### Recovery Symbol

`g:rec`

### Inline Production

`( sub_bodyA | sub_bodyB | sub_bodyC )`

### List Production

`g:sp`

## Terminal Symbols

### Escaped Terminal Symbol

`\ <character> `

### Exclusive Terminal Symbol

### Generated Symbol

- `g:sp`

- `g:nl`

- `g:num`

- `g:id`

- `g:sym`

### Production Token Symbol

`tk: <production-symbol>`

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

`<symbol>^<identifier>`

example:`g:id^primary_ident`

### Non-Capture Symbol

`<symbol>^<identifier>`

example:`g:id^primary_ident`

### Optional Symbol

`<symbol>^<identifier>`

example:`g:id^primary_ident`



