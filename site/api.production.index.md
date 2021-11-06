# [API](./api.index.md)::Production

###### HCG Syntax
``` 
<> production > \<> \! ? sym::production_symbol \>  pb::production_bodies? 
````
----

The production is the highest abstraction of a grammar description. It represents one or more distinct set of symbols that combined are
represent a derivative of the production. These derivations are called production bodies. Productions allow a grammar to be divided up into distinct, parsable units that can be referenced by other productions, encouraging composition and DRY descriptions of a language syntax. 

A production is defined with a production header, `<>` followed by a [production identifier symbol](./api.symbols.index.md#production-symbol), which is then followed by header closing symbol `>` and finally followed by one or more [production bodies](./api.production_body.index.md) separated by `|` symbols.

##### example:
```hcg
<> Production_Name > g:id | g:num | \november | \red
```


Hydrocarbon provides two distinct types of productions 
- General Production
    A production defined within a single *.hcg* file 
- Imported Production
