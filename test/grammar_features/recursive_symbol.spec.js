import { assert } from "console";
import { compileGrammarSource } from "../tools.js";



const parser = await compileGrammarSource(`
@IGNORE g:ws

<> A > C
<> C > (B)(+\\; ) | (B)(+\\, )
<> B > g:id
`);

assert_group(10000, () => {

    assert(parser("test, document").result[0] == ["test", "document"]);
    assert(parser("test; document").result[0] == ["test", "document"]);
    assert(parser("test").result[0] == ["test"]);
    assert(parser("A;B,C").FAILED == true);
    assert(parser("A;B;C").FAILED == false);
    assert(parser("A,B,C").FAILED == false);
});