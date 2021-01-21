import { compileGrammars } from "../../build/library/hydrocarbon.js";
import { getFollow } from "../../build/library/utilities/follow.js";
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
        });
    }

    const grammar = await compileGrammars(
        `<> follow_test > second g:ts?
        <> second > third \\... ?  \\,,,
        <> third > third *? \\?
            | g:id
        `,
        "");

    assert("First Production Follow Symbols", getFollow(0, grammar).map(getUniqueSymbolName) == getSymbols("$eof").map(getUniqueSymbolName));
    assert("Second Production Follow Symbols", getFollow(1, grammar).map(getUniqueSymbolName) == getSymbols("g:ts $eof").map(getUniqueSymbolName));
    assert("Third Production Follow Symbols", getFollow(2, grammar).map(getUniqueSymbolName).sort() == getSymbols("\\... \\,,, * \\? $eof").map(getUniqueSymbolName).sort());
});



