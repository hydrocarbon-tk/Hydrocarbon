import { compileJSParserFromGrammar } from "../tools.js";

const parser = await compileJSParserFromGrammar(`<> start > t:simple`);

assert("Should ba able to create parser from trivial grammar", parser("simple").result[0] == "simple");

assert("Parsing of trivial grammar should fail with input that does not belong to grammar. A", !parser("simpled"));

assert("Parsing of trivial grammar should fail with input that does not belong to grammar. B", !parser("simpl"));

const scientific = await compileJSParserFromGrammar(
    `<> sci > d
<> d >  g:num ( \\. g:num )? ( \\e g:num f:r{$2} )? 
    f:r { {integer:parseInt($1), fractional:parseInt($2), exponent:parseInt($3)}  } `
);

assert(
    "Should ba able to create parser from grammar that uses numerical characters",
    scientific("2.3e3").result[0] == { integer: 2, fractional: 3, exponent: 3 }
);

const complex = await compileJSParserFromGrammar(
    `<> complex > d
 
<> d >  real ( \\i real )? 
        f:r { {real:$1, imaginary:$2}  } 

<> real > g:num ( . g:num )? f:r { {integer:parseInt($1), fractional:parseInt($2)}  }`
);

assert(complex("2.3i3.2").result[0] == {
    real: { integer: 2, fractional: 3 },
    imaginary: { integer: 3, fractional: 2 }
});
