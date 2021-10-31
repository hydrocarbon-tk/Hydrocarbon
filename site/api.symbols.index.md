# API::Symbols

## Non-Terminal Symbols

### Production Symbol

### Import Production Symbol

`<module-name>::<production-symbol>`

## Terminal Symbols

### Generated Symbol

## Modifier Symbols

### Production Token Symbol

`tk: <production-symbol>`

*Production Token* symbols use a [production](./api.production.index.md) to serve as the basis for a token symbol. This allows complex tokens to be described using the same syntax as one would use for normal productions. The difference is a *production token* is atomic; that is whatever characters where recognized in the parsing of the production are returned as a single, irreducible token. Any reduce actions described in the production or it's sub-productions are ignored. 

A common use case for such symbols are when defining comments that should be ignored: 
```
@IGNORE tk:comment

<> comment > \/* ( g:id | g:nl | g:sp | g:num | g:sym )(*) \*/ 
    | \// ( g:id | g:sp | g:num | g:sym )(*)


```

> One note concerning production tokens. Productions tokens are greedy. This means that when parsing an input where 

### Annotated Symbol

### Inline Production