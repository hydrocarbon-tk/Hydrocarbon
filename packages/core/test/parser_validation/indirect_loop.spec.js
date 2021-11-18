import { createBuildPack } from "../../build/library/build/build.js";
import { compileGrammarFromURI } from "../../build/library/grammar/compile.js";
import { createAddHocParser } from "../../build/library/render/create_add_hoc_parser.js";

const grammar = await compileGrammarFromURI("./source/grammars/test/indirect_recursion_loop.hcg");

const build_pack = await createBuildPack(grammar, 1);

const { parse } = await createAddHocParser(build_pack);

const resultA = parse("dzxdzx").result;

assert(skip, resultA[0] == "zxdzxd");

const resultB = parse("xdzxdzx").result;

assert(skip, resultB[0] == "dzxdzxd");