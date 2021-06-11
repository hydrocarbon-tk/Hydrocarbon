/**
 * Should compile a new HCG grammar parser, 
 * which then should be able to compile
 * a new HCG parser
 */
import URI from "@candlelib/uri";
import { assert } from "console";
import { buildJSParserStrings, compileRecognizer, createAddHocParser, writeJSParserToFile } from "../../build/library/compiler/compiler.js";
import {
    compileGrammarFromURI
} from "../../build/library/grammar3/compile.js";
import { getHCGParser } from "./hcg3.tools.js";

await URI.server();

const
    hcg_grammar_file = URI.resolveRelative("./source/grammars/hcg-3-alpha/hcg.hcg"),
    default_parser = await getHCGParser();

//################################################################################################


//Compile existing HCG grammar object
assert_group(
    "Should parse HCG3 grammar file and return grammar object",
    20000, sequence, () => {

        const
            compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, default_parser);

        assert(compiled_grammar.type == "hc-grammar-3");
        assert(compiled_grammar.URI + "" == hcg_grammar_file);

    });

//Take grammar object and build grammar parser 
assert_group(
    "Should compile HCG3 grammar into a parser",
    20000, sequence, () => {
        const
            compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, default_parser),
            {
                recognizer_functions,
                meta,
            } = await compileRecognizer(compiled_grammar, 1),
            { recognizer_script, completer_script } = buildJSParserStrings(compiled_grammar, recognizer_functions, meta),
            parser = await createAddHocParser(compiled_grammar, recognizer_script, completer_script);

        assert(parser !== null);
        assert(typeof parser == "function");

    });

//Take parser and do a sanity parse of a simple grammar
assert_group(
    "Should be able to use bootstrapped parser to compile mock grammar",
    20000, sequence, () => {
        const compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, default_parser);
        const {
            recognizer_functions,
            meta,
        } = await compileRecognizer(compiled_grammar, 1);

        const { recognizer_script, completer_script } = buildJSParserStrings(compiled_grammar, recognizer_functions, meta);
        const parser = await createAddHocParser(compiled_grammar, recognizer_script, completer_script);

        const { result } = parser("\n <> test > t:r ( \\hello_world (+) ) ");

        assert(result[0].type == "hc-grammar-3");
        assert(result[0].productions[0].name == "test");

    });

//Take parser and parse HCG grammar
assert_group(
    "Should be able to use bootstrapped parser to compile HCG Parser file hcg.hcg",
    20000, sequence, () => {
        const compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, default_parser);
        const {
            recognizer_functions,
            meta,
        } = await compileRecognizer(compiled_grammar, 1);

        const { recognizer_script, completer_script } = buildJSParserStrings(compiled_grammar, recognizer_functions, meta);
        const parser = await createAddHocParser(compiled_grammar, recognizer_script, completer_script);

        const { result } = parser(await hcg_grammar_file.fetchText());

        assert(result[0].type == "hc-grammar-3");
        assert(result[0].productions[0].name == "hydrocarbon");
        assert(result[0].productions.length == 2);
    });

//Take HCG grammar and build parser 
assert_group(
    "Should be able to use bootstrapped parser to compile HCG3 grammar",
    20000, sequence, () => {
        const compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, default_parser);
        const {
            recognizer_functions,
            meta,
        } = await compileRecognizer(compiled_grammar, 1);

        const { recognizer_script, completer_script } = buildJSParserStrings(compiled_grammar, recognizer_functions, meta);
        const bootstrapped_parser = await createAddHocParser(compiled_grammar, recognizer_script, completer_script);
        const bootstrapped_compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, bootstrapped_parser);



        assert(bootstrapped_compiled_grammar !== null);
        assert(bootstrapped_compiled_grammar.type == "hc-grammar-3");
        assert(bootstrapped_compiled_grammar.URI + "" == hcg_grammar_file);
    });


assert_group(
    "Should be able to use bootstrapped parser to compile another bootstrapped parser",
    20000, sequence, () => {
        const compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, default_parser);
        const {
            recognizer_functions,
            meta,
        } = await compileRecognizer(compiled_grammar, 1);
        const { recognizer_script, completer_script } = buildJSParserStrings(compiled_grammar, recognizer_functions, meta);
        const bootstrapped_parser = await createAddHocParser(compiled_grammar, recognizer_script, completer_script);
        const bootstrapped_compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, bootstrapped_parser);
        const {
            recognizer_functions: bootstrapped_recognizer_functions,
            meta: bootstrapped_meta,
        } = await compileRecognizer(bootstrapped_compiled_grammar, 1);

        const { recognizer_script: bs_recognizer_script, completer_script: bs_completer_script } = buildJSParserStrings(
            bootstrapped_compiled_grammar, bootstrapped_recognizer_functions, bootstrapped_meta
        );
        const parser = await createAddHocParser(
            bootstrapped_compiled_grammar, bs_recognizer_script, bs_completer_script
        );

        const { result } = parser("\n <> test > t:r ( \\hello_world (+) ) ");

        assert(result[0].type == "hc-grammar-3");
        assert(result[0].productions[0].name == "test");
    });

assert_group(
    "Should be able to write bootstrapped parser to staging file",
    20000, sequence, () => {
        const compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, default_parser);
        const {
            recognizer_functions,
            meta,
        } = await compileRecognizer(compiled_grammar, 1);
        const { recognizer_script, completer_script } = buildJSParserStrings(compiled_grammar, recognizer_functions, meta);
        const bootstrapped_parser = await createAddHocParser(compiled_grammar, recognizer_script, completer_script);
        const bootstrapped_compiled_grammar = await compileGrammarFromURI(hcg_grammar_file, bootstrapped_parser);
        const {
            recognizer_functions: bootstrapped_recognizer_functions,
            meta: bootstrapped_meta,
        } = await compileRecognizer(bootstrapped_compiled_grammar, 1);

        let SUCCESS = await writeJSParserToFile(
            URI.resolveRelative("./source/typescript/grammar3/hcg3_parser.staged.js") + "",
            bootstrapped_compiled_grammar, bootstrapped_recognizer_functions, bootstrapped_meta,
            "../runtime/parser_loader_alpha.js"
        );

        assert(SUCCESS == true);
    });


//Take parser and compile to JSON File
