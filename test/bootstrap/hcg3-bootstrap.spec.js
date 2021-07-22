/**
 * Should compile a new HCG grammar parser, 
 * which then should be able to compile
 * a new HCG parser
 */
import URI from "@candlelib/uri";
import { buildRecognizer } from "../../build/library/build/build.js";
import { compileGrammarFromURI } from "../../build/library/grammar/compile.js";
import { createAddHocParser } from "../../build/library/render/create_add_hoc_parser.js";
import { generateWebAssemblyParser, writeParserScriptFile } from "../../build/library/render/render.js";

const
    hcg_grammar_file = URI.resolveRelative("./source/grammars/hcg-3/hcg.hcg");

//################################################################################################


//Compile existing HCG grammar object
assert_group(
    "Should parse HCG3 grammar file and return grammar object",
    10000, sequence, () => {

        const
            compiled_grammar = await compileGrammarFromURI(hcg_grammar_file);

        assert(compiled_grammar.type == "hc-grammar-3");
        assert(compiled_grammar.URI + "" == hcg_grammar_file);

    });

//Take grammar object and build grammar parser 
assert_group(
    "Should compile HCG3 grammar into a parser",
    10000, sequence, () => {
        const
            compiled_grammar = await compileGrammarFromURI(hcg_grammar_file),
            {
                recognizer_functions,
                meta,
            } = await buildRecognizer(compiled_grammar, 1),
            parser = await createAddHocParser(compiled_grammar, recognizer_functions, meta);

        assert(parser !== null);
        assert(typeof parser == "function");

    });

//Take parser and do a sanity parse of a simple grammar
assert_group(
    "Should be able to use bootstrapped parser to compile mock grammar",
    10000, sequence, () => {
        const compiled_grammar = await compileGrammarFromURI(hcg_grammar_file);
        const {
            recognizer_functions,
            meta,
        } = await buildRecognizer(compiled_grammar, 1);

        const parser = await createAddHocParser(compiled_grammar, recognizer_functions, meta);

        const { result } = parser("\n <> test > t:r ( \\hello_world (+) ) ");

        assert(result[0].type == "hc-grammar-3");
        assert(result[0].productions[0].name == "test");

    });

//Take parser and parse HCG grammar
assert_group(
    "Should be able to use bootstrapped parser to compile HCG Parser file",
    10000, sequence, () => {
        const compiled_grammar = await compileGrammarFromURI(hcg_grammar_file);
        const {
            recognizer_functions,
            meta,
        } = await buildRecognizer(compiled_grammar, 1);

        const parser = await createAddHocParser(compiled_grammar, recognizer_functions, meta);

        assert(parser !== null);

        const { result } = parser(await hcg_grammar_file.fetchText());

        assert(result[0].type == "hc-grammar-3");
        assert(result[0].productions[0].name == "hydrocarbon");
        assert(result[0].productions.length == 2);
    });

//Take HCG grammar and build parser 
assert_group(
    "Should be able to use bootstrapped parser to compile HCG3 grammar",
    20000, sequence, () => {
        const compiled_grammar = await compileGrammarFromURI(hcg_grammar_file);
        const {
            recognizer_functions,
            meta,
        } = await buildRecognizer(compiled_grammar, 1);

        const bootstrapped_parser = await createAddHocParser(compiled_grammar, recognizer_functions, meta);

        assert(bootstrapped_parser !== null);
        const bootstrapped_compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, bootstrapped_parser);

        assert(bootstrapped_compiled_grammar !== null);
        assert(bootstrapped_compiled_grammar.type == "hc-grammar-3");
        assert(bootstrapped_compiled_grammar.URI + "" == hcg_grammar_file);
    });


assert_group(
    "Should be able to use bootstrapped parser to compile another bootstrapped parser: WASM",
    20000, sequence, () => {
        const compiled_grammar = await compileGrammarFromURI(hcg_grammar_file);
        const {
            recognizer_functions,
            meta,
        } = await buildRecognizer(compiled_grammar, 1);
        const bootstrapped_parser = await createAddHocParser(
            compiled_grammar,
            recognizer_functions,
            meta,
            generateWebAssemblyParser
        );
        const bootstrapped_compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, bootstrapped_parser);
        const {
            recognizer_functions: bootstrapped_recognizer_functions,
            meta: bootstrapped_meta,
        } = await buildRecognizer(bootstrapped_compiled_grammar, 10);
        const parser = await createAddHocParser(
            bootstrapped_compiled_grammar,
            bootstrapped_recognizer_functions,
            bootstrapped_meta,
            generateWebAssemblyParser
        );

        const { result } = parser("\n <> test > t:r ( \\hello_world (+) ) ");

        assert(result[0].type == "hc-grammar-3");
        assert(result[0].productions[0].name == "test");
    });

assert_group(
    "Should be able to use bootstrapped parser to compile another bootstrapped parser: JavaScript",
    20000, sequence, () => {
        const compiled_grammar = await compileGrammarFromURI(hcg_grammar_file);
        const {
            recognizer_functions,
            meta,
        } = await buildRecognizer(compiled_grammar, 1);
        const bootstrapped_parser = await createAddHocParser(
            compiled_grammar,
            recognizer_functions,
            meta
        );
        const bootstrapped_compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, bootstrapped_parser);
        const {
            recognizer_functions: bootstrapped_recognizer_functions,
            meta: bootstrapped_meta,
        } = await buildRecognizer(bootstrapped_compiled_grammar, 10);
        const parser = await createAddHocParser(
            bootstrapped_compiled_grammar,
            bootstrapped_recognizer_functions,
            bootstrapped_meta
        );

        const { result } = parser("\n <> test > t:r ( \\hello_world (+) ) ");

        assert(result[0].type == "hc-grammar-3");
        assert(result[0].productions[0].name == "test");
    });

assert_group(
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

        let SUCCESS = await writeParserScriptFile(
            URI.resolveRelative("./build/staged/hcg3_parser.staged.ts") + "",
            bootstrapped_compiled_grammar, bootstrapped_recognizer_functions, bootstrapped_meta,
            "../runtime/parser_loader_next.js",
            generateWebAssemblyParser
        );

        assert(SUCCESS == true);
    });
