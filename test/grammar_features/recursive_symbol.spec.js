import { assert } from "console";
import { compileGrammar, compileHCGParser, getGrammar } from "../tools.js";

const HCGparser = await compileHCGParser(true);

const grammar = await HCGparser(`
    @IGNORE g:ws

    <> A > C
    <> C > (B)(+\\; )
        |(B)(+\\, )

    <> B > g:id
`, HCGparser);

const parser = await compileGrammar(grammar);

assert_group(sequence, 10000, () => {

    assert(parser("test, document").result[0] == ["test", "document"]);
    assert(parser("test; document").result[0] == ["test", "document"]);
    assert(parser("test").result[0] == ["test"]);
    assert(parser("A;B,C").FAILED == true);
    assert(parser("A;B;C").FAILED == false);
    assert(parser("A,B,C").FAILED == false);
});