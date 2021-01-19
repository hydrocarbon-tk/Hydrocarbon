import { compileGrammarSource } from "../tools.js";

const parserA = await compileGrammarSource(`<> start > t:simple f:r {"complex"}`);
const parserB = await compileGrammarSource(
       `@IGNORE g:ws \n <> start > d <> d > ( t:simple(*) ) f:r { { data:$sym1 } } `
);
const parserC = await compileGrammarSource(`@IGNORE g:ws \n 
    <> start > sum          f:r {  { result : $sym1 }  } 
    <> sum > num + num      f:r {  $sym1 + $sym3  } 
    <> num > g:num          f:r {  parseInt($sym1)  } 
`);
const parserD = await compileGrammarSource(`@IGNORE g:ws \n 
    <> start > sum                  f:r {  { result : $sym1 }  } 
    <> sum > mul + sum              f:r {  $sym1 + $sym3  } 
           | mul
    <> mul > fact * mul              f:r {  $sym1 * $sym3  } 
           | fact
    <> fact > g:num (RST g:ws) \!   f:r {  (n=>{  let out = 1; for(let i = 1; i <= n; i++) out *= i; return out; })(parseInt($sym1))  } 
           | num
    <> num > \- (RST g:ws) g:num    f:r {  -1 * parseInt($sym2)  } 
           | g:num                  f:r {  parseInt($sym1)  } 
`);

assert(parserA("simple").result[0] == "complex");

assert(parserB("simple simple simple").result[0] == { data: ["simple", "simple", "simple"] });

assert(parserC("50 + 20").result[0] == { result: 70 });

assert(parserD("-150 + 120 * 3 + 6!").result[0] == { result: 930 });


