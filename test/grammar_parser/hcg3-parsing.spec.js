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


assert_group("Imported Grammar Integration", sequence, () => {
    const general_uri = new URI("./source/grammars/misc/general_with_import.hcg");
    const general_parse_grammar = await loadGrammarFromFile(general_uri, parser);

    await integrateImportedGrammars(general_parse_grammar);
    convertListProductions(general_parse_grammar);
    createJSFunctionsFromExpressions(general_parse_grammar);

    //general_parse_grammar.productions = [general_parse_grammar.productions[2]];
    //convertListProductions(general_parse_grammar);
    //convertGroupProductions(general_parse_grammar);
    //expandOptionals(general_parse_grammar);
    assert(i, 20000, general_parse_grammar == "");
});