import { compileGrammar } from "../tools.js";

const parser = await compileGrammar(
    `<d> start > t:simple`
);

assert(parser("simple").result[0] == "simple");

