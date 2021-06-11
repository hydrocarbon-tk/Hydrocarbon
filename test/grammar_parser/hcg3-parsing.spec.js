import { experimentalConstructRenderers, experimentalRender } from "@candlelib/conflagrate";
import URI from "@candlelib/uri";
import {
    createUniqueSymbolSet,
    createItemMaps,
    buildSequenceString,
    loadGrammarFromFile,
    convertListProductions,
    convertGroupProductions,
    expandOptionals,
    integrateImportedGrammars,
    createJSFunctionsFromExpressions
} from "../../build/library/grammar3/compile_grammar.js";
import { adHocParse, compile } from "../../build/library/compiler/compiler.js";
import { hcg3_mappings } from "../../build/library/grammar3/mappings.js";
import { getHCGParser } from "./hcg3.tools.js";
import { assert } from "console";
import { Item } from "../../build/library/utilities/item.js";


const parser = await getHCGParser();

assert_group("Basic Parsing", sequence, 20000, () => {

    const source_file_uri = new URI("./source/grammars/misc/ambiguous.hcg");
    const import_test_uri = new URI("./source/grammars/misc/import_grammar.hcg");
    const ambig_grammar = await loadGrammarFromFile(source_file_uri, parser);
    const import_grammar = await loadGrammarFromFile(import_test_uri, parser);
    const renderers = experimentalConstructRenderers(hcg3_mappings);

    assert(experimentalRender(ambig_grammar, hcg3_mappings, renderers) == "");

    assert(ambig_grammar.productions[0].name == "S");
    assert(ambig_grammar.productions[1].name == "E");
    assert(ambig_grammar.productions[2].name == "F");

    assert(import_grammar.imported_grammars.length == 1);

    assert(list_unroll == "");
});

assert_group("List Unrolling", sequence, 20000, () => {
    const list_test_uri = new URI("./source/grammars/misc/loop.hcg");
    const list_unroll = await loadGrammarFromFile(list_test_uri, parser);
    convertListProductions(list_unroll);
    assert(list_unroll == "");
});

assert_group("Group Unrolling", sequence, 20000, () => {
    const group_test_uri = new URI("./source/grammars/misc/group.hcg");
    const group_unroll = await loadGrammarFromFile(group_test_uri, parser);
    convertGroupProductions(group_unroll);
    assert(group_unroll == "");
});

assert_group("Optional Unrolling", sequence, 20000, () => {
    const optional_test_uri = new URI("./source/grammars/misc/optional.hcg");
    const optional_unroll = await loadGrammarFromFile(optional_test_uri, parser);
    expandOptionals(optional_unroll);
    assert(optional_unroll == "");
});


assert_group("General Grammar Parsing", sequence, 20000, () => {
    const general_uri = new URI("./source/grammars/misc/general.hcg");
    const general_parse_grammar = await loadGrammarFromFile(general_uri, parser);

    //general_parse_grammar.productions = [general_parse_grammar.productions[2]];
    convertListProductions(general_parse_grammar);
    //convertGroupProductions(general_parse_grammar);
    //expandOptionals(general_parse_grammar);
    assert(general_parse_grammar == "");
});

/*
assert_group("Imported Grammar Integration", sequence, 20000, () => {
    const general_uri = new URI("./source/grammars/misc/general_with_import.hcg");
    const general_parse_grammar = await loadGrammarFromFile(general_uri, parser);

    await integrateImportedGrammars(general_parse_grammar);
    convertListProductions(general_parse_grammar);
    createJSFunctionsFromExpressions(general_parse_grammar);
    createUniqueSymbolSet(general_parse_grammar);
    buildSequenceString(general_parse_grammar);
    createItemMaps(general_parse_grammar);

    const prepared_grammar = general_parse_grammar;



    const {
        grammar_functions,
        runner
    } = await compile(prepared_grammar, { functions: {} }, {
        name: "test",
        recognizer_type: { js: "js", wasm: "wasm" }["js"],
        completer_type: { js: "js", ts: "ts" }["js"],
        output_dir: "./",
        memory_loader_url: "@candlelib/hydrocarbon",
        optimize: false,
        combine_recognizer_and_completer: true,
        add_annotations: true,
        debug: false,
        number_of_workers: 1
    });

    const result = adHocParse(prepared_grammar, grammar_functions, runner, "222", {});

    //general_parse_grammar.productions = [general_parse_grammar.productions[2]];
    //convertListProductions(general_parse_grammar);
    //convertGroupProductions(general_parse_grammar);
    //expandOptionals(general_parse_grammar);
    assert(i, result == "");
});
*/

assert_group("Imported Grammar Integration", sequence, 20000, () => {
    const general_uri = new URI("./source/grammars/misc/simple_expression_parser.hcg");
    const general_parse_grammar = await loadGrammarFromFile(general_uri, parser);

    await integrateImportedGrammars(general_parse_grammar);
    convertListProductions(general_parse_grammar);
    createJSFunctionsFromExpressions(general_parse_grammar);
    createUniqueSymbolSet(general_parse_grammar);
    buildSequenceString(general_parse_grammar);
    createItemMaps(general_parse_grammar);


    //*
    const prepared_grammar = general_parse_grammar;



    const {
        grammar_functions,
        runner
    } = await compile(prepared_grammar, { functions: {} }, {
        name: "test",
        recognizer_type: { js: "js", wasm: "wasm" }["js"],
        completer_type: { js: "js", ts: "ts" }["js"],
        output_dir: "./",
        memory_loader_url: "@candlelib/hydrocarbon",
        optimize: false,
        combine_recognizer_and_completer: true,
        add_annotations: true,
        debug: false,
        number_of_workers: 1
    });

    const result = adHocParse(prepared_grammar, grammar_functions, runner, "222 + 222 - 222   2 - 22 + 4 - 2  234", {});

    //general_parse_grammar.productions = [general_parse_grammar.productions[2]];
    //convertListProductions(general_parse_grammar);
    //convertGroupProductions(general_parse_grammar);
    //expandOptionals(general_parse_grammar);
    assert(result[0] == [222, -22, 234]);
    //*/
});


assert_group(solo, "@candle/paraffin args grammar", sequence, 20000, () => {

    await URI.server();

    const general_uri = URI.resolveRelative("./source/grammar/process_args.hcg", URI.resolveRelative("@candlelib/paraffin/"));

    const general_parse_grammar = await loadGrammarFromFile(general_uri, parser);

    //*
    await integrateImportedGrammars(general_parse_grammar);
    convertListProductions(general_parse_grammar);
    createJSFunctionsFromExpressions(general_parse_grammar);
    createUniqueSymbolSet(general_parse_grammar);
    buildSequenceString(general_parse_grammar);
    createItemMaps(general_parse_grammar);

    const item = new Item(6, 2, 2);

    const map = general_parse_grammar.item_map.get(item.toString());
    console.log(map, item.renderUnformattedWithProduction(general_parse_grammar));


    //*
    const prepared_grammar = general_parse_grammar;


    const {
        grammar_functions,
        runner
    } = await compile(prepared_grammar, { functions: {} }, {
        name: "test",
        recognizer_type: { js: "js", wasm: "wasm" }["js"],
        completer_type: { js: "js", ts: "ts" }["js"],
        output_dir: "./",
        memory_loader_url: "@candlelib/hydrocarbon",
        optimize: false,
        combine_recognizer_and_completer: true,
        add_annotations: true,
        debug: false,
        number_of_workers: 6
    });

    const result = adHocParse(prepared_grammar, grammar_functions, runner, "--test --doggie -ds f  -./283williasm", { data: { test: true, doggie: true } }, true);

    console.log({ result });

    //general_parse_grammar.productions = [general_parse_grammar.productions[2]];
    //convertListProductions(general_parse_grammar);
    //convertGroupProductions(general_parse_grammar);
    //expandOptionals(general_parse_grammar);
    assert(i, result[0] == [222, -22, 234]);
    //*/
});