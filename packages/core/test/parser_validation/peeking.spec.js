import { createBuildPack } from "../../build/library/build/build.js";
import { compileGrammarFromURI } from "../../build/library/grammar/compile.js";
import { createAddHocParser } from "../../build/library/render/create_add_hoc_parser.js";

const grammar = await compileGrammarFromURI("./source/grammars/test/peeking.hcg");

const build_pack = await createBuildPack(grammar, 1);

const { parse } = await createAddHocParser(build_pack);

const resultA = parse("ambiguity is a pain for all parsers").result;

assert(resultA[0] == "parsers");

const resultB = parse("ambiguity is a pain for all grammars").result;

assert(resultB[0] == "grammars");