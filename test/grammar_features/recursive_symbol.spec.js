import { assert } from "console";
import { compileGrammarSource } from "../tools.js";



const parser = await compileGrammarSource(`
@IGNORE g:ws

<> A > C
<> C > (B)(+\\; ) | (B)(+\\, )
<> B > g:id
`);


assert(parser("test, document").result[0] == ["test", "document"]);
assert(parser("test; document").result[0] == ["test", "document"]);
assert(parser("test").result[0] == ["test"]);
assert(!parser("A;B,C"));
assert(parser("A;B;C"));
assert(parser("A,B,C"));
