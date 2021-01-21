import { compileGrammarSource } from "../tools.js";

assert_group(sequence, 10000, () => {

    const grammar = `@IGNORE g:ws \n <> A > A g:id f:r{ $sym1 + " " + $sym2} \n | g:id`;

    const parser = await compileGrammarSource(grammar);

    assert("Construct test parser", parser != undefined);

    const input = `   TEST TEST TEST TEST`;

    assert("Parse of input is successful", parser(input).FAILED == false);

    assert("Parse of input produces expected value", parser(input).result[0] == "TEST TEST TEST TEST");

});