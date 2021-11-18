import { createBuildPack } from "../../build/library/build/build.js";
import { compileGrammarFromURI } from "../../build/library/grammar/compile.js";
import { createAddHocParser } from "../../build/library/render/create_add_hoc_parser.js";

const grammar = await compileGrammarFromURI("./source/grammars/test/ambiguous.hcg");

const build_pack = await createBuildPack(grammar, 1);

const { parse } = await createAddHocParser(build_pack);

const resultA = parse("aaabbb").result;

assert(resultA[0].type == "E");

const resultB = parse("aaabbbbbb").result;

assert(resultB[0].type == "F");