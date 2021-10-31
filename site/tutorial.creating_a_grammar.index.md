# Creating A Grammar

*7 min read*

A Hydrocarbon grammar file is a document written in a [BNF](https://en.wikipedia.org/wiki/Backus%E2%80%93Naur_form) influenced 
syntax that describes a parser or set of parsers. Hydrocarbon grammars are modular in that then can be defined in multiple files, 
productions from different files can be combined in numerous ways, and  multiple sub-grammars that can be exposed as separate parsers 
from the same compiled package.

## A Brief Introduction

A single grammar is composed of one or more productions that define how a particular subset of grammar should be parsed. The syntax
of a basic production is `"<>" <production_name> ">" <production_bodies>`, where `production_name` is a sequence of alphanumeric 
 and/or `_` underscore characters, and `production_bodies` is one or more production bodies separated by a `|` character:

```hydrocarbon
<> Start_Production > body1 | body2 | body3 | ...
```
Production bodies are comprised of symbols that can represent sequences of characters, known as *terminal* symbols, 
and/or identifiers that refer to other productions, called *non-terminal* symbols. 

```hydrocarbon
<> ... > \im_a_terminal_symbol t:im_also_a_terminal_symbol im_a_non_terminal_symbol
```
<dance/>

Terminal symbols can be defined in *escaped literal* form by preceding a sequence of characters with a `\` character and following that character 
sequence with a newline or space. An example of this is the sequence `\hello \world `, which defines the terminal symbols
`hello` and `world`, which is differs from `\hello\world `, which defines the single terminal symbol `hello\world`.

> An alternate terminal symbol syntax, *exclusive literal*, uses the prefix `t:` define a sequence of characters, e.g. 
> `t:hello t:world`. There certain cases where you would want to define an *exclusive literal* over an *escaped literal*. Check
> out [grammar symbols](./grammar_symbols.index.md#) to find out about the use cases for these symbol types.

#### A Simple Grammar

Let's create a simple grammar to demonstrate the process of writing a Hydrocarbon grammar. In order to produce a parser that can 
recognize simple arithmetic expressions, such as `1+2+3`, one could write the following grammar:
```hydrocarbon

<> sum > sum \+ num | num 

<> num > \1 | \2 | \3 | \4 | \5 | \6 | \7 | \8 | \9 | \0

```
In this grammar, the production `sum` contains two bodies. The first, `sum \+ \num`, has two non-terminals `sum` and `num`, and
on terminal symbol `+`. The second body of `sum`, following the `|` symbol, contains a single non-terminal `num`. 

The second production `num` contains multiple bodies, each with a single terminal symbol representing a character in the range [0..9]. 

> One thing to note about this grammar is the use of left recursion to represent repeated sequences of productions. In this
> case, the production `<> sum > sum + num` is left recursive, where the first *terminal symbol* `sum` directly references the production
> in which it is a part of. 
>
> Certain parser compiling algorithms, such as parsers in the LL family and recursive descent parsers, 
> are unable to parse such productions in that form, as this would let to an infinite recursion. There a methods to
> transform such productions, however Hydrocarbon is able to directly work with left recursive grammars without transformations. 
> It is actually encouraged to use left recursion, since this leads to the compilation of a more efficient parser.

Hydrocarbon provides some modifiers and built in symbols that make it easier to write complex grammars. In our example
grammar, we can use the *generated* symbol `g:num` to represent a character in the range [0..9]. 

```hydrocarbon
<> num > g:num
```

We may also to replace the trivial non-terminal `num` with this generated symbol, which in turn allows us to remove the 
`num` production entirely.

```hydrocarbon
<> sum > sum \+ g:num | g:num
```

We can represent a sequence that repeats zero or more times with the symbol *modifier* `(*)`. To apply a modifier to a sequence
of symbols, we can wrap them in `(` `)` parenthetic brackets. Applying this syntax to our grammar, we can re-write it as:

```hydrocarbon
<> sum > g:num ( \+ g:num )(*)
```
This single production represents the same grammar as our first version, but more compactly.

#### Functions

As it is, this grammar will produce a parser that can do nothing more than tell us if a givin input can be produced by the grammar,
in effect the parser can only recognize an input as being part of the grammar. However, if we want are parser to do something more 
interesting, we can provide reduce functions that act on the recognized symbols of the grammar symbols. Hydrocarbon calls a reduce
function when the parser recognizes an input as being part of a particular production body. Going back to an early iteration of our 
grammar, we can add a reduce function to the `num` production's body to convert the `g:num` symbol into a numeric object:

```hydrocarbon
<> num > g:num f:r { parseInt($1 + "") }
```

> When a *terminal-symbol* is passed to a reduce function, it is represented by a [Token](#todo) object. This object provides several utility
> methods useful when analyzing and transforming an AST into other forms. 

We're using JavaScript expressions to define action used in the reduce function `f:r { ... }`. Hydrocarbon supports other syntaxes, but
its native form is JavaScript, so we'll stick with that. The contents of a reduce function is an expression that takes the parsed symbols
of a production body, modifies them in some way, and returns a new object or primitive. Inside a reduce function symbols are referenced 
by the syntax `\$ g:num`, where `g:num` is the one-based index position of the symbol.

An alternative to using the `\$ g:num` syntax to reference a symbol in a production body is to use *annotated* symbols and define a
reference name for a symbol: 

```hydrocarbon
<> num > g:num^number f:r { parseInt(number + "") }
```

The `g:num` symbol has been annotated with the reference annotation `^number`, which can now be used within the reduce function to 
refer to that symbol. We can also add a reduce function to the `sum` grammar production. We'll also use an previous iteration of this
production to apply the reduce function:

```hydrocarbon
<> sum >    sum^operandA \+ num^operandB   f:r { operandA + operandB }
        
        |   num
```

Note in the second production `|  num` we do not need to apply a reduce action, as Hydrocarbon will automatically pass the value of 
number primitive when it completed the production `<> num > g:num^number f:r { parseInt(number + "") }`  

> By default, Hydrocarbon will return the last symbol within a production body when it recognizes that body.

Likewise, the value of num in `... \+ num^operandB ...` is the numeric literal that was created when the production `num` was completed. 

Now our grammar looks like this:

```
<> sum >    sum^operandA \+ num^operandB   f:r { operandA + operandB }
        |   num

<> num > g:num^number f:r { parseInt(number + "") }
```

A parse produced by this grammar will now be able to take an input such as `"1+2+3"` and return a numeric literal `6`. 

## What Next

Checkout [creating the bash parser](./tutorial.bash_parser.index.md) if you desire a thorough guide on generating a parser with Hydrocarbon.

You can also checkout the Grammar API to gain an in-depth understanding of grammar constructs. 





