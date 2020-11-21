import { compileGrammars } from "@candlefw/hydrocarbon";
import URL from "@candlefw/url";
import { compileHybrid } from "../build/library/hybrid/hybrid_compiler.js";
import { assert } from "console";
import { constructCompilerEnvironment } from "../build/library/grammar/grammar_parser.js";

const url = await URL.resolveRelative("../source/grammars/hcg/hcg.hcg");
const file = await url.fetchText();
const test_string = (await URL.resolveRelative("../source/grammars/hcg/functions.hcg").fetchText());

assert_group(() => {

    const
        env = constructCompilerEnvironment(url + "", { count: 0 }, { count: 0 }, 112, new Map),
        grammar = await compileGrammars(file, url + ""),
        parserHybrid = await compileHybrid(grammar, {}, {
            wasm_output_dir: "./temp/",
            ts_output_dir: "./temp/",
            add_annotations: true,
            combine_wasm_with_js: true,
            create_function: true,
            optimize: false
        });

    env.fn = env.functions;

    assert(parserHybrid(test_string, env));

}, sequence);
