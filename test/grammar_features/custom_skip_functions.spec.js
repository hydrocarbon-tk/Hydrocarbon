import { compileJSParserFromGrammar } from "../tools.js";

const parser = await compileJSParserFromGrammar(
    `@IGNORE g:ws

    #<custom_skip> \\/*  ( g:ws | g:sym | g:nl | g:id )(*)  \\*/
    #
    #<tk::comment> \#(*

    <> start > t:simple(*) 

    `
);

assert(parser("simple simple").result[0] == ["simple", "simple"]);

