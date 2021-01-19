import { compileGrammars } from "../../build/library/hydrocarbon.js";
import { getFirst } from "../../build/library/utilities/first.js";
import { getUniqueSymbolName } from "../../build/library/utilities/symbol.js";
import { compileGrammarSource } from "../tools.js";


assert_group(10000, sequence, () => {

    const symbol_parser = await compileGrammarSource("./source/grammars/hcg/symbols.hcg");

    function getSymbols(string) {
        const symbols = [];
        symbol_parser(string, { symbols });
        return symbols.map(sym => {
            delete sym.pos;
            sym.precedence = 0;
            return sym;
        }).map(getUniqueSymbolName).sort();
    }

    function getProdFollow(prod, grammar) {
        return getFirst(prod, grammar).map(getUniqueSymbolName).sort();
    }

    const grammar = await compileGrammars(
        `<> follow_test > second? g:ts?
        <> second > third \\... ?  \\,,,
        <> third > third? *? \\?
            | g:id
        `,
        "");

    assert("First Production First Symbols", getProdFollow(0, grammar) == getSymbols("g:id g:ts * \\? "));
    assert("Second Production First Symbols", getProdFollow(1, grammar) == getSymbols("g:id * \\? "));
    assert("Third Production First Symbols", getProdFollow(2, grammar) == getSymbols("g:id * \\? "));
});



