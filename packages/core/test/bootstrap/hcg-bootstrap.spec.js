/**
 * Should compile a new HCG grammar parser, 
 * which then should be able to compile
 * a new HCG parser
 */
import URI from "@candlelib/uri";
import { buildRecognizer, createBuildPack } from "../../build/library/build/build.js";
import { compileGrammarFromURI } from "../../build/library/grammar/compile.js";
import { createAddHocParser } from "../../build/library/render/create_add_hoc_parser.js";
import { generateScriptParser, generateWebAssemblyParser, writeJSBasedParserScriptFile } from "../../build/library/render/render.js";

await URI.server();

const
    hcg_grammar_file = URI.resolveRelative("./source/grammars/hcg/hcg.hcg");

//################################################################################################


//Compile existing HCG grammar object
assert_group(
    "Should parse HCG grammar file and return grammar object",
    10000, sequence, () => {

        const
            compiled_grammar = await compileGrammarFromURI(hcg_grammar_file);

        assert(compiled_grammar.type == "hc-grammar-5");
        assert(compiled_grammar.URI + "" == hcg_grammar_file);

    });

//Take grammar object and build grammar parser 
assert_group(
    "Should compile HCG grammar into a parser", 10000, sequence, () => {
        const
            compiled_grammar = await compileGrammarFromURI(hcg_grammar_file),
            build_pack = await createBuildPack(compiled_grammar, 1),
            { parse } = await createAddHocParser(build_pack);

        assert(parse !== null);
        assert(typeof parse == "function");
    });

//Take parser and do a sanity parse of a simple grammar
assert_group(
    "Should be able to use bootstrapped parser to compile mock grammar",
    10000, sequence, () => {
        const
            compiled_grammar = await compileGrammarFromURI(hcg_grammar_file),
            build_pack = await createBuildPack(compiled_grammar, 1),
            { parse } = await createAddHocParser(build_pack),
            { result } = parse("\n <> test > t:r ( \\hello_world (+) ) ");

        assert(result[0].type == "hc-grammar-5");
        assert(result[0].productions[0].symbol.name == "test");

    });

//Take parser and parse HCG grammar
assert_group(
    "Should be able to use bootstrapped parser to compile HCG Parser file",
    10000, sequence, () => {
        const
            compiled_grammar = await compileGrammarFromURI(hcg_grammar_file),
            build_pack = await createBuildPack(compiled_grammar, 1),
            { parse } = await createAddHocParser(build_pack);

        assert(parse !== null);

        const { result } = parse(await hcg_grammar_file.fetchText());

        assert(result[0].type == "hc-grammar-5");
        assert(result[0].productions[0].symbol.name == "hydrocarbon");
        assert(result[0].productions.length == 2);
    });

//Take HCG grammar and build parser 
assert_group(
    "Should be able to use bootstrapped parser to compile HCG grammar",
    20000, sequence, () => {

        const
            compiled_grammar = await compileGrammarFromURI(hcg_grammar_file),
            build_pack = await createBuildPack(compiled_grammar, 1),
            { parse: bootstrapped_parse } = await createAddHocParser(build_pack);

        assert(bootstrapped_parse !== null);
        const bootstrapped_compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, bootstrapped_parse);

        assert(bootstrapped_compiled_grammar !== null);
        assert(bootstrapped_compiled_grammar.type == "hc-grammar-5");
        assert(bootstrapped_compiled_grammar.URI + "" == hcg_grammar_file);
    });


/* assert_group(
    skip,
    "Should be able to use bootstrapped parser to compile another bootstrapped parser: WASM",
    20000, sequence, () => {

        const

            compiled_grammar = await compileGrammarFromURI(hcg_grammar_file),

            build_pack = await createBuildPack(compiled_grammar, 10),

            { parse: bootstrapped_parse } = await createAddHocParser(build_pack),

            bootstrapped_compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, bootstrapped_parse),

            build_pack_2 = await createBuildPack(bootstrapped_compiled_grammar, 10),

            { parse } = await createAddHocParser(build_pack_2);

        const { result } = parse("\n <> test > t:r ( \\hello_world (+) ) ");

        assert(result[0].type == "hc-grammar-5");

        assert(result[0].productions[0].name == "test");
    }); */

assert_group(
    "Should be able to use bootstrapped parser to compile another bootstrapped parser: JavaScript",
    20000, sequence, () => {
        const

            compiled_grammar = await compileGrammarFromURI(hcg_grammar_file),

            build_pack = await createBuildPack(compiled_grammar, 10),

            { parse: bootstrapped_parse } = await createAddHocParser(build_pack),

            bootstrapped_compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, bootstrapped_parse),

            build_pack_2 = await createBuildPack(bootstrapped_compiled_grammar, 10),

            { parse } = await createAddHocParser(build_pack_2);

        const { result } = parse("\n <> test > t:r ( \\hello_world (+) ) ");

        assert(result[0].type == "hc-grammar-5");
        assert(result[0].productions[0].symbol.name == "test");
    });

/* assert_group(
    "Should be able to write bootstrapped parser to staging file",
    20000, sequence, () => {


        const compiled_grammar = await compileGrammarFromURI(hcg_grammar_file);
        const {
            recognizer_functions,
            meta,
        } = await buildRecognizer(compiled_grammar, 1);
        const bootstrapped_parser = await createAddHocParser(compiled_grammar, recognizer_functions, meta);
        const bootstrapped_compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, bootstrapped_parser);
        const {
            recognizer_functions: bootstrapped_recognizer_functions,
            meta: bootstrapped_meta,
        } = await buildRecognizer(bootstrapped_compiled_grammar, 1);


        const SUCCESS = !!(await generateWebAssemblyParser(
            bootstrapped_compiled_grammar,
            bootstrapped_recognizer_functions,
            bootstrapped_meta,
            "../runtime/parser_loader_gamma.js",
            undefined,
            "grammar_parser.staged",
            "./build/staged/",
            "ts"
        ));

        assert(SUCCESS == true);
    }); */
