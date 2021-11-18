# API::Parse Action


A parse action is an expression that is applied to the tokens of an input after a [production body](./api.production_body.index.md) 
has been recognized. Initially, each production body is assigned a default parse action that converts body's last symbol into a string.  
If the last symbol is a terminal, then the string is the token defined by that symbol. If instead the symbol is a production reference, 
then the value is the value returned by the recognized body of the production. 

The default behavior ultimately results in the last token of the input being returned as a string when the root production is finally recognized, 
discarding the all other tokens.

> #### example
> When the input `2+3-4` is parsed using the following grammar, the string `"4"` is returned by the parse function. 
> ```
> <> start > expr           // returns "4" after `expr` is recognized
> 
> <>  expr > num + term     // returns "4" after `term` is recognized 
>  
> <>  term > num - num      // returns "4" after the last `num` is recognized
>
> <>   num > g:num          // returns "2", "3" and "4"
> ```

##  Custom Parse Actions

Custom parse actions provide a way of overriding the default parse action behavior. You may define a custom parse actions using a 
parse action definition, which looks like `f:r{<JS_Expression>}`.  Within the brackets, any valid JavaScript expression may be 
defined and will be executed upon the completion of it's respective production body. The evaluated value of the expression becomes 
the value returned by the production body. 

A parse action must be defined after the last symbol within a production body:

```hcg
 <> A > \a \b \c f:{ true }  //✅ The parse declaration is the last part of the production body

 <> A > \a \b f:{ false } \c //❌ Symbol \c defined after the parse action declaration
 ```

### Symbol References

Special identifiers are made available within the parse action that allow you to reference the symbols of the production body. These identifiers
begin with a `$` character followed by one of the following: 

- The 1-based index position of a symbol `\$\d+`:
  ```
   <> A > \a \b \c f:{ $1 + $2 }          // returns the value "ac";
  ```
- The annotation identifier value assigned to a symbol `\$\w+`:
  ```
   <> A > \a ^a \b ^b \c ^c f:{ $c + $a } // returns the value "ca";
  ```
- The name of a symbol if that symbol happens to be a production reference or import production reference:
```
   <> A > a_prod \b ^b c_prod f:{ $c_prod + $b_prod } // returns the concatenated values of a_prod and c_prod;
  ```


#### Example

The simple grammar below has a single production which has a production body defined at




see also: [ASYTrip](./api.asytrip.index.md)