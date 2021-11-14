# [API](./api.index.md)::ASYTrip

ASYTrip (pronounced Asy~trip) is the moniker givin to the automatic AST generation process provided by Hydrocarbon. It is
a lazy conglomeration of *AST* and *Script*. Laziness aside, Hydrocarbon is not only able to create
a custom byte parser for your grammar, it can also create a feature rich AST types in the target language
of your choice. These types provide facilities for tree *traversal / visiting / walking*, *rendering / printing* code, 
lazy evaluation, production specific parsing, stream and multithreaded parsing. 

The AST generation is not *completely* automatic. By default, Hydrocarbon converts recognized terminal symbols
into Tokens, and nothing else. Through reduce actions, your are able to specify ways in which these tokens
can be combined and transformed into new types. The default language for reduce actions is JavaScript. ASyTrip
uses a subset of the JavaScript syntax to allow you to define AST node types. Based on these definitions, ASyTrip 
will find or infer suitable permutations and combinations of these node types to create appropriate 
reduce actions transformations that will convert the recognized Token's into your AST description. These types
will either inherited or have generated methods and properties that provide the mechanism necessary to traverse
transform, and analyze the AST structure. 


## Core Types

### Structs

An ASYTrip struct is the backbone of an AST. It defines the nodes that can be present within the tree. A struct 
is defined using `{ ... }` brackets within a parse action. 

```
/* A simple struct definition */ 
f:r { { type: t_Sub, left:$1, right:$2 } }
```

It uses a subset of the JavaScript **object literal** syntax. 

> If you are more familiar with JSON, then you may also consider a struct as an object of 
> JSON key value pairs, with the additional option of specifying keys without quotes. 


#### Struct Type
Every struct MUST be defined with a `type` key. The value of the key must be specified with a *type label* of the form `t_<identifier>`, such as
`type: t_Term` or `type: t_If_Statement`. The *type label* serves as the name of the compiled struct type. Different struct definitions with matching *type labels* will be merged into one struct. A struct can only be defined with one *type label*. An error will be formed if  multiple type labels are defined on a single struct 
```
f:r { { type: t_Sub, type: t_Add } } /* Causes an error */
```


#### Struct Class
The *type label* can be augmented with *class descriptors*, of the form `c_<identifier>`. They are combined with the type labels using the join operator `|`, as in `type: t_Term | c_Statement` or `type: t_If_Statement | c_Block`. Think of *Class descriptors* as tags that provide more information on the use and 
classification of a particular struct type. A struct can be defined with multiple *class descriptors*:
```
f:r { { type: t_Sub | c_Expression | c_Binary | c_Additive_Operator } }
```

If different struct definitions a have matching *type labels* but a different set of of class descriptors, the struct definitions will still be merged, and 
the union of the class descriptors will define the class descriptor set used in the compiled struct:

```
/* A single struct definition somewhere in the grammar */
... f:r { { type: t_Mult | c_Binary | c_Multiplicative_Operator } } 

/* Another struct definition elsewhere in the grammar */
... f:r { { type: t_Mult | c_Expression | c_Binary } } 

/* The generated representation of the struct will look like */
/* f:r { { type: t_Mult | c_Expression | c_Binary | c_Multiplicative_Operator } } */

```

They can be used in conjuction with the iteration system to filter iterated results, returning struct instances that
match a givin *class descriptor*:

```typescript
import { Class } from "./ast.ts";

const my_ast = parse(...);

for (const {node} of my_ast.iterate().filter(Class.Block)){
    /* 
        Only structs that have been defined with the 
        *c_Block* class descriptor will be yielded.
    */
}
```
### Token

Similar to string, can store source file information and 
directly references the source data instead of copying a section of
data to a new String buffer.

### Vector


## Numerical Types

### I8

```Javascript
f:r { i8($1) }
```

8bit Integer. May be interpreted as signed or unsigned. 

### I16

```Javascript
f:r { i16($1) }
```

16bit Integer. May be interpreted as signed or unsigned. 

### I32

```Javascript
f:r { i32($1) }
```

32bit Integer. May be interpreted as signed or unsigned. 

### I64

```Javascript
f:r { i64($1) }
```

64bit Integer. May be interpreted as signed or unsigned. 

### F32
```Javascript
f:r { f32($1) }
```

32bit Floating Point value

### F64
```Javascript
f:r { f64($1) }
```

64bit Floating Point value. Only true numeric type available in JavaScript.

## Other

### Boolean
```Javascript
f:r { bool($1) } || f:r { !!($1) }
```

Boolean `true` or `false` value.

### String
```Javascript
f:r { string($1) } or f:r { "" + ($1) } or f:r { ($1) + "" }
```

A target language native string container type. 



### Null

```Javascript
f:r { null }
```




## Errors

Mixed structs and non-struct types

Mixed vector of structs and non-struct types