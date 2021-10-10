# Creating A Grammar

## Key Concepts

A Hydrocarbon Grammar is comprised of Productions and optional Reduce Functions to apply when a particular production is 
recognized from an input. Each production is comprised  of production bodies which are inturn comprised of symbols representing 
sequences of characters, known as *terminal* symbols, and/or references to other productions known as *non-terminal*
symbols. 

For example, in order to produce a parser that can recognize simple arithmatic expressions, such as `1+2+3`, one could write
the following grammar:
```hydrocarbon

<> sum > sum \+ num | num 

<> num > \1 | \2 | \3 | \4 | \5 | \6 | \7 | \8 | \9 | \0

```
In this grammar, the production `sum` contains two bodies. The first, `sum \+ \num`, has two non-terminals `sum` and `num`, and
on terminal symbol `+`. The second body of `sum`, following the `|` symbol, contains a single non-terminal `num`. 

The production `num` contains multiple bodies, each with a single terminal symbol representing a character in the range [0..9]. 

> One thing to note about this grammar is the use of left recursion to represent repeated sequences of productions. In this
> case, the production `<> sum > sum + num` is left recursize, where the first symbol `sum` directly references the production
> which it is a part of. Certain parser compiling algorthms such as LL, are unable to parse such productions, as this would
> let to an infinite recursion. Hydrocarbon has no such restrictions, and it is actually encouraged to use left recursion, 
> since these leads to a more efficient parser.

Hydrocarbon provides some modifiers and built in symbols that make it easier to write complex grammars. In the our example
grammar, we can use the *generic* symbol `g:num` to represent a character in the range [0..9]. 

```hydrocarbon
<> num > g:num
```

This also allows us to replace the trivial non-terminal `num` with this generic symbol, which in turn allows us to remove the 
`num` production entirely.

```hydrocarbon
<> sum > sum \+ g:num | g:num
```

We can represent a sequence that repeats zero or more times with the symbol *modifier* `(*)`. To apply a modifier to a sequence
of symbols, we can wrap them in '(' ')' parenthetic brackets. Applying this syntax to our grammar, we can re-write it as:

```hydrocarbon
<> sum > g:num ( \+ g:num )(*)
```
This single production represents the same grammar as our first version, but more compactly.

#### Functions

As it is, this grammar will produce parse that will do nothing more than tell us if a givin input can be produced by the grammar,
in effect a grammar *recognizer*. However, if we want are parse to do something more interesting, we can provide reduce functions
that act on the recognized symbols of the grammar symbols. Going back to an early iteration of the grammar, we can add a reduce
function to the `num` production to convert the recognized `g:num` symbol into a numeric object. 

```hydrocarbon
<> num > g:num f:r { parseInt($1 + "") }
```

We're using JavaScript expressions to define action used in the reduce function `f:r { ... }`. Hydrocarbon supports other syntaxes, but
it's native form is JavaScript, so we'll stick with that. A reduce function is an expression that takes the parsed symbols of a production
body, modifies them in some way, and returns a new object or primitive. Inside a reduce function symbols are referenced by `$##`, where `##` is
the 1 based index position of the symbol. By default, Hydrocarbon will return the last symbol within a production body when it completes
it. An alternative to using the `$##` syntax to reference a symbol in a production body is to use *annotated* symbols and define a
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

Note in the second production `|  num` we do not need to apply a reduce action, as Hydrocarbon will automaticaly pass the value of 
number primitive when it completed the production `<> num > g:num^number f:r { parseInt(number + "") }`. Likewise, the value of num
in `... \+ num^operandB ...` is the numeric literal that was created when the production `num` was completed. 

Now our grammar looks like this:

```
<> sum >    sum^operandA \+ num^operandB   f:r { operandA + operandB }
        |   num

<> num > g:num^number f:r { parseInt(number + "") }
```

A parse produced by this grammar will now be able to take and an input such as `"1+2+3"` and return a numeric literal `6`. There are
several other grammr writting concepts not discussed in this introduction that you may want to have a deeper look into, including 
Importing a merging grammars from different files, using the intermediate representation syntax to gain deeper control over parsing,
and using the "out-of-band" function refernce syntax to define reduce functions for production bodies in other files. Checkout out 
the detailed catagories. 





Prodction: ` \<> production_name \> production_body(+) `  



```hydrocarbon
<> production > non_terminal \terminal 
```


Symbol types:

- terminal symbols
    productions - Call 
    groups
    list
- non-terminal symbols
    generated
    Generic Symbols - tab | sp | nl |



Productions
Bodies
Lists 
Groups
Symbols
Ignore

## Advanced Concepts
Import
Export
Meta Symbols
Reduce Functions
