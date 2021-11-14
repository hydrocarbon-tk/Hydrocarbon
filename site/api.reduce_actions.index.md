# [API](./api.index.md)::Reduce Actions

A grammar is mostly useless unless there is some way to take what has been recognized and do 
something with it. That's where reduce actions come into play. Reduce actions are small JavaScript
expression functions that take as input the parsed parts of a [production body](./api.production_body.index.md) 
and output some transformation of those inputs. 

A reduce action is defined using a `f:r` symbol to denote the start of reduce action function 
definition. This is followed by the definition of the reduce action, which is a `{` `}` bracketed JavaScript
expression:

```
f:r{ "I'm a Reduce Action!" }
```

Reduce actions are defined after the last symbol in a production body:

```
<> P > \hello \world f:r{ $1 }
```




# See Also 

- [ASYTrip](api.asytrip.index.md)
 
    A multi-language AST builder that can be used as an alternative to JavaScript reduce actions.

