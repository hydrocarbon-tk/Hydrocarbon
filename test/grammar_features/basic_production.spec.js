import { compileGrammar } from "../tools.js";

const parser = await compileGrammar(`<> start > t:simple`);

assert(parser("simple").result[0] == "simple");

assert(parser("simpled").FAILED == true);

assert(parser("simpl").FAILED == true);

