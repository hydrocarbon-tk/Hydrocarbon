import { compileGrammar } from "../tools.js";

const parser = await compileGrammar(
    `@IGNORE g:ws

    #<custom_skip> \\/*  ( g:ws | g:sym | g:nl | g:id )(*)  \\*/
    #
    #<tk::comment> \#(*

    <> start > t:simple(*) 

    `
);

assert(parser("simple/* test */simple").result[0] == ["simple", "simple"]);

