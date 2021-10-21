import { createBuildPack } from "../build/library/build/build.js";
import { compileGrammarFromURI, compileGrammarFromString } from "../build/library/grammar/compile.js";
import { getUniqueSymbolName } from "../build/library/grammar/nodes/symbol.js";
import { createAddHocParser } from "../build/library/render/create_add_hoc_parser.js";
import { Logger } from "../build/library/runtime/logger.js";
//import env from "../../ts/build/library/parser/env.js";
//import env from "../../css/build/library/parser/env.js";
import env from "../../wick/build/library/compiler/source-code-parse/env.js";
import { convertMarkdownToHTMLNodes } from "../../wick/build/library/compiler/common/markdown.js";
import { state_history, assign_peek } from "../build/library/runtime/kernel_next.js";

import framework from "../build/library/grammar/hcg_parser_pending.js";

const {
    parse: parser
} = await framework;


//const grammar = await compileGrammarFromURI("./source/grammars/test/utf8_test.hcg");
//const grammar = await compileGrammarFromURI("../ts/source/grammar/typescript.hcg");
//const grammar = await compileGrammarFromURI("../wick/source/grammars/wick.hcg");
//const grammar = await compileGrammarFromURI("../wick/source/grammars/md.hcg");
//const grammar = await compileGrammarFromURI("../js/source/grammar/javascript.hcg");
//const grammar = await compileGrammarFromURI("../css/source/grammar/css.hcg");
//const grammar = await compileGrammarFromURI("../conflagrate/source/grammar/render.hcg");
//const grammar = await compileGrammarFromURI("../paraffin/source/grammar/args_parser.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/js_asi_recovery.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/misc/lllr.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/indirect_recursion_loop.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/ignored_comments.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/ambiguous.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/misc/ruminate_formatter.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/failure_recovery.hcg");
const grammar = await compileGrammarFromURI("./source/grammars/hcg/hcg.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/misc/oob.hcg", parser);
//const grammar = await compileGrammarFromURI("./source/grammars/hcg/state_ir.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/peeking.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/tight_loop.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/ambiguity_resolution.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/out_of_scope.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/arithmetic_expression.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/large_switch_hash_table.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/shift_reduce_conflict.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/hcg/state_ir.hcg");
//const grammar = await compileGrammarFromURI("../js/source/grammar/javascript.hcg");
//const string = await fs.promises.readFile("./source/grammars/hcg/comments.hcg", { encoding: "utf8" });
//const grammar = await compileGrammarFromString(`<> A > B(*) t:foo f:r{ $1 + $2 } <> B > ( g:sp | g:nl )(*)`);

Logger.get("MAIN");//.activate();

const build_pack = await createBuildPack(grammar, 1);

const { parse, rlu } = await createAddHocParser(build_pack);
//console.log([...build_pack.states_map.values()].map(v => v.string).join("\n-------\n"));

//process.exit();
/* 
const string = `

<[test_]

    pass then pass

>

`;
//*/
//const string = ["", "", "--test", `"test value"`, "--value", "uncaptured  ", "-abt", "timeout", "./dir", "--data", "=./data/dir", "../fi-le/path", "\"./another-potential/file/path/**/*.js\""].join(" ");
//const string = "a b r";
//const string = `2+2 \n    2 + 2`;
//const string = `aaaabbbb`;
//const string = `dzxdzx`;
//const string = `dzxdzx`;
//const string = `one + two * three + one /one /two`;
//const string = `x x x x x x x x`;
//const string = `SabbF,SabE`;
//const string = "test, test; test, test r r;";
//const string = "x x x x x x x x x x x x x x x x x x";
//const string = "ambiguity is a pain for all parsers";;
//const string = "test, test; test, test r r;";
//const string = "a=2+2;";
//const string = "data # test \n data";
/* const string = `
this is a test *that will 

work without fail?
######*World **test **
* 2) Test
\`\`\`
Hello World
This is a day to remember
This is a day to remember
This is a day to remember
This is a day to remember
This is a day to remember
This is a day to remember
This is a day to remember
This is a day to remember
This is a day to remember
This is a day to remember
This is a day to remember
This is a day to remember
\`\`\`
### Hello World
    `; */
//const string = `{NO_SUBSTITUTE: \`} @nodes... {NO_SUBSTITUTE: \`}`;
///* 
//const string = `svg|* a:nth-child(2n+1){}`; //*/
//const string = `let notes = [{a:b()}, {c:d()}, {e:f()}];`; //*/
//const string = "b b a a a a a a a a b";
//const string = "<>!test> mango^ref \\tet ?^margarin";

//const string = "const enum bean { GUMBALL = 22 }; <Test>(foo:number) : boolean => d;";
//const string = "\"🚧🚧🚧🚧🚧\"";
//const string = "`${this.host}`";

let string = `

<> Test > ^TempA temp^TempA /* Test */ \\2 f:r { tok }

f: ^canary {   test   } 

f: Test.0 { test }

f: Test.0 { test }

<> Test > ^TempA temp^TempA /* Test */ \\2 f:r { tok }    

//Mango

# duneberry

`;

//string = "A A B B g2 2 2 A";

const history = state_history;



console.log("ABABABABABABABAABABABABABABABA");
try {
    assign_peek(state => {
        console.log(rlu.get(state & 0xFFFFFF));
    });
    const { result, err } = parse(string, env, 0);
    console.error(err);
    console.log("ABABABABABABABAABABABABABABABA");
    console.dir(result[0], { depth: null });
    // console.dir(convertMarkdownToHTMLNodes(result[0]), { depth: null });;
    //history.length = 0;
} catch (e) {
    console.error(e);
} finally {


    const hist = history.map(([ptr, type, off, len, sp, prod, u]) => ({
        ptr: ptr & 0xFFFFFF, type: type, off, len, prod, u, sp, string:
            string.slice(off - 20, off)
            + " | " +
            string.slice(off, off + len)
            + " | " +
            string.slice(off + len, len + off + 20)

        , str: rlu.get(ptr & 0xFFFFFF)
    }));

    for (const h of hist) {

        console.log("-------");

        const { ptr, type, off, len, prod, u, sp } = h;

        console.log(u);
        console.log({ sp, ptr, p: prod, type, t: getUniqueSymbolName(grammar.meta.all_symbols.by_id.get(type)), off, len });
        console.log(`/*${h.string}*/`, "\n");
        console.log(h.str, "\n");
    }
}

