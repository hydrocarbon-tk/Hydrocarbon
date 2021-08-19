import { compileJSParserFromGrammar } from "../tools.js";

const parser = await compileJSParserFromGrammar(
    `@IGNORE g:sp

    #<custom_skip> \\/*  ( g:sp | g:sym | g:nl | g:id )(*)  \\*/
    #
    #<tk::comment> \#(*

    <> start > t:simple(*) 

    `
);

assert(parser("simple simple").result[0] == ["simple", "simple"]);

