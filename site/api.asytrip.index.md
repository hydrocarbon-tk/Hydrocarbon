# ASyTrip ASTs

ASyTrip is the moniker givin to the automatic AST generation process provided by Hydrocarbon. It is
a lazy conglomeration of *AST* and *Script*. Laziness aside, Hydrocarbon is not only able to create
a custom byte parser for your grammar, it can also create a feature rich AST types in the target language
of your choice. These types provide facilities for tree traversal/visiting/walking, rendering/printing code, 
lazy evaluation, production specific parsing, stream and multithreaded parsing. 

The AST generation is not *completely* automatic. By default, Hydrocarbon converts recognized terminal symbols
into Tokens, and nothing else. Through reduce actions, your are able to specify ways in which these tokens
can be combined and transformed into new types. The default language for reduce actions is JavaScript. ASyTrip
uses a subset of the JavaScript syntax to allow you to define AST node types. Based on these definitions, ASyTrip 
will find or infer suitable permutations and combinations of these node types to create appropriate 
reduce actions transformations that will convert the recognized Token's into your AST description. These types
will either inherited or have generated methods and properties that provide the mechanism 