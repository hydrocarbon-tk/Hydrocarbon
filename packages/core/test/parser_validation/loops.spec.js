import { createBuildPack } from "../../build/library/build/build.js";
import { compileGrammarFromURI } from "../../build/library/grammar/compile.js";
import { createAddHocParser } from "../../build/library/render/create_add_hoc_parser.js";

const grammar = await compileGrammarFromURI("./source/grammars/test/loop.hcg");

const build_pack = await createBuildPack(grammar, 1);

const { parse } = await createAddHocParser(build_pack);

const resultA = parse("test r;").result;

assert(skip, resultA[0] == 3);

const resultB = parse("test, test; test, test r r;").result;

assert(skip, resultB[0] == 8);