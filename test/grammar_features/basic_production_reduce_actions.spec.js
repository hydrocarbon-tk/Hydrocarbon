import { compileJSParserFromGrammar } from "../tools.js";

const parserA = await compileJSParserFromGrammar(`<> start > t:simple f:r {"complex"}`);
const parserB = await compileJSParserFromGrammar(
       `@IGNORE g:ws \n <> start > d <> d > ( t:simple(*) ) f:r { { data:$1 } } `
);
const parserC = await compileJSParserFromGrammar(`@IGNORE g:ws \n 
    <> start > sum          f:r {  { result : $1 }  } 
    <> sum > num + num      f:r {  $1 + $3  } 
    <> num > g:num          f:r {  parseInt($1)  } 
`);
const parserD = await compileJSParserFromGrammar(`@IGNORE g:ws \n 
    <> start > sum                 f:r {  { result : $1 }  } 
    <> sum > mul + sum             f:r {  $1 + $3  } 
           | mul
    <> mul > fact * mul            f:r {  $1 * $3  } 
           | fact
    <> fact > g:num \!             f:r {  (n=>{  let out = 1; for(let i = 1; i <= n; i++) out *= i; return out; })(parseInt($1))  } 
           | num
    <> num > \-  g:num             f:r {  -1 * parseInt($2)  } 
           | g:num                 f:r {  parseInt($1)  } 
`);

assert(parserA("simple").result[0] == "complex");

assert(parserB("simple simple simple").result[0] == { data: ["simple", "simple", "simple"] });

assert(parserC("50 + 20").result[0] == { result: 70 });

assert(parserD("-150 + 120 * 3 + 6!").result[0] == { result: 930 });


