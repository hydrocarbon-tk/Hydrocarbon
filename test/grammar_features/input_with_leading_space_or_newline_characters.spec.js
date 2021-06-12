import { compileGrammarSource } from "../tools.js";

assert_group(sequence, 10000, () => {

    const grammar = `@IGNORE g:ws g:nl \n <> A > A g:id f:r{ $1 + " " + $2} \n | g:id`;

    const parser = await compileGrammarSource(grammar);

    assert("Construct test parser", parser != undefined);

    const input = `   \nTEST TEST TEST TEST`;

    assert("Parse of input is successful", parser(input).FAILED == false);

    assert("Parse of input produces expected value", parser(input).result[0] == "TEST TEST TEST TEST");

});