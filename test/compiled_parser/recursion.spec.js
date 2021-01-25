import { compileGrammarSource } from "../tools.js";

const grammar = `
    @IGNORE g:ws

    <> start > data

    <> data > data g:num?
        | g:num
`;


const parser = await compileGrammarSource(grammar, true);

assert("Direct production body recursion ( S=>S ) exits", parser("12"));