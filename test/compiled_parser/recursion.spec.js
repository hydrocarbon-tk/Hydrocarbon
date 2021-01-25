import { compileGrammarSource } from "../tools.js";

const grammar = `
    @IGNORE g:ws

    <> start > data

    <> data > data g:num? # this body will derive [data => data]
        | g:num
`;

const parser = await compileGrammarSource(grammar, true);

assert("Direct production body recursion ( S=>S ) does not cause infinite recursion", parser("12 12").result[0] == "12");