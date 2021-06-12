import { compileGrammarSource } from "../tools.js";

const parser = await compileGrammarSource(`<> start > t:simple`);

assert(parser("simple").result[0] == "simple");

assert(!parser("simpled"));

assert(!parser("simpl"));

const scientific = await compileGrammarSource(
    `<> sci > d
<> d >  g:num ( \\. g:num )? ( \\e g:num f:r{$2} )? 
    f:r { {integer:parseInt($1), fractional:parseInt($2), exponent:parseInt($3)}  } `
);

assert(scientific("2.3e3").result[0] == { integer: 2, fractional: 3, exponent: 3 });

const complex = await compileGrammarSource(
    `<> complex > d
 
<> d >  real ( \\i real )? 
        f:r { {real:$1, imaginary:$2}  } 

<> real > g:num ( . g:num )? f:r { {integer:parseInt($1), fractional:parseInt($2)}  }`
);

assert(complex("2.3i3.2").result[0] == {
    real: { integer: 2, fractional: 3 },
    imaginary: { integer: 3, fractional: 2 }
});
