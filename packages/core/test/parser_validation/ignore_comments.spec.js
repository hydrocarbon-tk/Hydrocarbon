import { createBuildPack } from "../../build/library/build/build.js";
import { compileGrammarFromURI } from "../../build/library/grammar/compile.js";
import { createAddHocParser } from "../../build/library/render/create_add_hoc_parser.js";

const grammar = await compileGrammarFromURI("./source/grammars/test/ignored_comments.hcg");

const build_pack = await createBuildPack(grammar, 1);

const { parse } = await createAddHocParser(build_pack);

const resultA = parse("data # test \n data").result;

assert(resultA[0] == ["data", "data"]);

//const resultB = parse("xdzxdzx").result;
//
//assert(resultB[0] == "dzxdzxd");