import { Logger } from "@candlelib/log";
import { writeFile } from "fs/promises";
//import env from "../../ts/build/library/parser/env.js";
//import env from "../../css/build/library/parser/env.js";
import env from "../../wick/build/library/compiler/source-code-parse/env.js";
import { createBuildPack } from "../build/library/build/build.js";
import { compileGrammarFromURI } from "../build/library/grammar/compile.js";
import framework from "../build/library/grammar/hcg_parser_pending.js";
import { convert_symbol_to_string, getUniqueSymbolName } from "../build/library/grammar/nodes/symbol.js";
import { createJSFunctionsFromExpressions } from "../build/library/grammar/passes/process_js_code.js";
import { createAsytripContext } from "../build/library/asytrip/create_asytrip_context.js";
import { createTsTypes } from "../build/library/asytrip/asytrip_to_ts.js";
import { render_grammar } from "../build/library/grammar/passes/common.js";
import { createAddHocParser } from "../build/library/render/create_add_hoc_parser.js";
import { renderToGo, renderToRust, renderToTypeScript } from "../build/library/render/render.js";
import { assign_peek } from "../build/library/runtime/recognizer/iterator.js";
import { recognize } from "../build/library/runtime/recognize.js";
import URI from "@candlelib/uri";

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
//const grammar = await compileGrammarFromURI("./source/grammars/misc/ast.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/failure_recovery.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/misc/oob.hcg");
const grammar = await compileGrammarFromURI("./source/grammars/test/arithmetic_expression.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/hcg/hcg.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/hcg/symbols.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/misc/oob.hcg", parser);
//const grammar = await compileGrammarFromURI("./source/grammars/hcg/state_ir.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/peeking.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/tight_loop.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/ambiguity_resolution.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/out_of_scope.hcg");
// const { grammar, asytrip_context } = await compileGrammarFromURI("./source/grammars/test/arithmetic_expression.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/large_switch_hash_table.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/test/shift_reduce_conflict.hcg");
//const grammar = await compileGrammarFromURI("./source/grammars/hcg/state_ir.hcg");
//const grammar = await compileGrammarFromURI("../js/source/grammar/javascript.hcg");
//const string = await fs.promises.readFile("./source/grammars/hcg/comments.hcg", { encoding: "utf8" });
//const grammar = await compileGrammarFromString(`<> A > B(*) t:foo f:r{ $1 + $2 } <> B > ( g:sp | g:nl )(*)`);
Logger.get("MAIN");//.activate();

const build_pack = await createBuildPack(grammar, 1);

const asytrip_context = createAsytripContext(grammar);

/* await renderToTypeScript(
    build_pack,
    asytrip_context,
    URI.resolveRelative("./test8/")
);

await renderToGo(
    build_pack,
    asytrip_context,
    URI.resolveRelative("./source/hc_golang_sandbox/")
); */

//* 
await renderToRust(
    build_pack,
    asytrip_context,
    URI.resolveRelative("./source/hc_rust/sandbox/source/")
); //*/
/* await writeFile("./test8/ast.ts", createTsTypes(grammar, asytrip_context));

const entry_pointers = grammar.productions
    .filter(p => p.IS_ENTRY)
    .map(p => ({ name: p.name, pointer: build_pack.states_map.get(p.name).pointer }));




await writeFile("./states.map.json", JSON.stringify(rlu, undefined, 2), { encoding: "utf8" }); */

const adhoc = await createAddHocParser(build_pack, null, createJSFunctionsFromExpressions(grammar));

const rlu = {
    states_lookup: Object.fromEntries([...build_pack.states_map.entries()]
        .map(([key, val]) => [val.pointer & 0xFFFFF, val.string])),
    productions_lookup: Object.fromEntries(grammar.productions.map(p => [p.name, render_grammar(p)])),
    symbol_lookup: Object.fromEntries([...grammar.meta.all_symbols.by_id.entries()]
        .map(([a, b]) => [a, convert_symbol_to_string(b)]))
};

console.time("A");

const input = "two+three three";

let index = 0;

assign_peek((state, kernel_state) => {

    const {
        tokens: [, token],
        stack: { pointer: stack_pointer },
        production_id: prod,
        reader: { cursor }
    } = kernel_state;



    console.log(index++ + "-------\n\n");
    console.log({
        sp: stack_pointer,
        state,
        p: prod,
        type: token.type,
        t: getUniqueSymbolName(grammar.meta.all_symbols.by_id.get(token.type)),
        off: cursor,
        len: token.byte_length
    });

    const tl = token.codepoint_length;
    const to = cursor;
    console.log("=========================================================================");
    console.log(`[ ${input.slice(Math.max(0, to - 5), to)}|>${input.slice(to, tl + to)}<|${input.slice(tl + to, to + tl + 5)} ]`);
    console.log("=========================================================================");
    console.log(rlu.states_lookup[state & 0xFFFFF]);
});

console.log(adhoc.parse(input));
console.timeEnd("A");