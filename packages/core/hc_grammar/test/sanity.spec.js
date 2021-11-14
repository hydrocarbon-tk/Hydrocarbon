import { assert } from "console";
import { SymbolType } from "../../hc_ts_common/build/index.js";
import { compileGrammarFromString } from "../build/compile.js";


assert_group(sequence, "Parses simple grammar", () => {

    const basic_grammar =
        `@IGNORE g:sp

<> start > g:id \+ g:id
`;

    const grammar = await compileGrammarFromString(basic_grammar);

    assert(grammar.URI === undefined);

    assert(grammar.productions[0].name == "start");

    assert(grammar.productions[0].bodies.length == 1);

    assert(grammar.productions[0].bodies[0].sym.length == 3);

    assert(grammar.productions[0].bodies[0].sym[0].type == SymbolType.GENERATED);

    assert(grammar.productions[0].bodies[0].sym[1].type == SymbolType.LITERAL);

    assert(grammar.productions[0].bodies[0].sym[2].type == SymbolType.GENERATED);

    assert(grammar.meta.ignore.length > 0);

});