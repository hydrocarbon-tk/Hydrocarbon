# [API](./api.index.md)::Preambles

Preambles are special directives that can be defined at the top of the grammar file. As of HCG version 5, There are currently three preambles
that can be defined in this section: Export, Import, and Ignore.
### `@IMPORT`

#### Definition 

###### HCG Syntax
```hcg
\@IMPORT filepath \as namespace
``` 

#### Grammar Composition

A Hydrocarbon grammar can be derived from multiple sub-grammars defined in multiple files. The `@IMPORT` preamble allows productions from other grammars
to be accessed through a `namespace` reference and integrated within the productions of the importer source file. Such productions are accessed through
a syntax similar to C/C++ namespace reference: `namespace_reference \:: production`. The `filepath` can be a relative or absolute posix file path that 
resolves to a single `*.hcg` grammar file.

#### Example 

```hcg
@IMPORT ./my_other_grammar.hcg as other

<> start > other::start
```


### `@EXPORT`

#### Definition 

###### HCG Syntax
``` 
\@EXPORT production_name \as reference
``` 

#### Entry Points

The design of Hydrocarbon allows any production to serve as an entry point from which a parse run will begin. By default, the first production defined
in the root grammar file as used as the sole entry point for a parse run. By using the `@EXPORT` preamble, any number of entry points can be defined
to use an alternate start point for a parse run. 

#### Example

The following grammar exports two entry points `str` and `num`, which allows the parser to work as double quote string recognizer using the production 
`number`, or as a scientific number recognizer from the production `number`.

```hydrocarbon
@EXPORT string as str
@EXPORT number as num

<> start > ( string | number )(+)

<> string > \" ( g:id | g:num | g:sym | g:sp )(*) \"

<> number > g:nums ( . g:nums )? ( \e \- ? g:nums )?
```

