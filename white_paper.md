# Hydrocarbon - A General RDLR(*) Parser

A system for a general recursive descent 

GRDLR(*) Parser


- Introduction
- Algorithms
- - Time Complexity
- - Recognizer Construction
- - - STARTs
- - - Earley Resolver
- - Stack Machine
- Implementation
- - Parse Data IR
- - Stack Machine Kernel 
- - - Parse Action Output
- Results
- Summary
- Proofs
- References

- [0] Adaptive LL(*) Parsing: The Power of Dynamic Analysis | 2014 | Terence Parr, Sam Harwell, Kathleen Fisher
- -  GRDLR parse instructions already serve as the preconstructed DFA and there is no
    need for ATN/DFA simulation during parsing. This can be seen within the Token Production parsing sequences. 

-[1] Tomita-Style Generalised LR Parsers | 2000 | Elizabeth Scott, Adrian Johnstone, Shamsa Sadaf Hussain

## A RDLR(k/*) Parser Generator


# Parser Generating

## Create START candidates:

Givin a root production R:

Start with the initial items of a production for all bodies defined within the production
```
<A> ::= Bb
```

For any item whose initial symbol is a terminal add this to the START set.

For any item whose symbol at it's initial position is a non-terminal, add this to the 
set `START_candidates`. 

What follows is recursively done until there are no 


Remove from the `START_candidates` an item `start_candidate` whose initial symbol is a non-terminal.
Take the closure of this item. If any item within  this closure has `R` as it's initial symbol
then the `start_candidate` cannot be a member of `STARTs`. In this case, take all items within the
closure that  have terminal symbols in the initial position and add them to `STARTs`. For the remaining items
in the closure add them to the `START_candidates` set, except in the case that the item has
been previously add to the `START_candidates` set.

### Common derivatives
If two or more candidates have the same production symbol in their left most position, remove these candidates and replace with candidates from their closure.

If there are no items with the `start_candidate` closure that have a symbol `R` in it's initial
position, add `start_candidate` to the `STARTs` set.

## State Generation

### Earley Disambiguation

### Goto State Generation

## Intermediate Representation

### Blocking Assertions

`prod | peek | assert`

#### `prod [ prod_idn prod_idn+1 ... prod_idn+x ]`

Execute the branch if the production id matches one of  `prod_id*`

#### `peek [ tok_idn tok_idn+1 ... tok_idn+x ]`

Look ahead 1 token from the last position. Increment `cursor = cursor + 1` and execute the branch if the symbol id matches one of `tok_id*`

#### `assert [ tok_idn tok_idn+1 ... tok_idn+x ]`

Reset cursor to cursor_start ( `curser = cursor_start` )

### Branch Instructions

### Goto Instructions


# Building

## Block storage:
- Hash Table Lookup
- Jump Table Lookup
### Storage Algorithm

## Virtual Stack Machine Kernel




