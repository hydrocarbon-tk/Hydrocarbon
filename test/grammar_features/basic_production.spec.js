import { compileGrammar } from "../tools.js";

const parser = await compileGrammar(`<> start > t:simple`);

assert(parser("simple").result[0] == "simple");

assert(parser("simpled").FAILED == true);

assert(parser("simpl").FAILED == true);

const scientific = await compileGrammar(
    `<> sci > d
<> d >  g:num ( \\. g:num )? ( \\e g:num )? 
    f:r { {integer:parseInt($sym1), fractional:parseInt($sym2), exponent:parseInt($sym3)}  } `
);

assert(scientific("2.3e3").result[0] == { integer: 2, fractional: 3, exponent: 3 });

const complex = await compileGrammar(
    `<> complex > d
 
<> d >  real ( \\i real )? 
        f:r { {real:$sym1, imaginary:$sym2}  } 

<> real > g:num ( . g:num )? f:r { {integer:parseInt($sym1), fractional:parseInt($sym2)}  }`
);

assert(complex("2.3i3.2").result[0] == {
    real: { integer: 2, fractional: 3 },
    imaginary: { integer: 3, fractional: 2 }
});
