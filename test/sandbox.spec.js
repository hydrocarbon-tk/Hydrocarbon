import URL from "@candlelib/uri";
import fs from "fs";
import { compile, hadHocParse } from "../build/library/compiler/compiler.js";
import { getGrammar } from "./tools.js";

const fsp = fs.promises;

//const uri = URL.resolveRelative("./source/grammars/misc/test.hcg");
//const uri = URL.resolveRelative("./source/grammars/hcg-3/hcg.hcg");
const uri = URL.resolveRelative("./source/grammars/misc/php.hcg");

const grammar = await getGrammar(uri + "");

const { grammar_functions, runner } = await compile(grammar, { functions: {} }, {
    name: "test",
    recognizer_type: { js: "js", wasm: "wasm" }["js"],
    completer_type: { js: "js", ts: "ts" }["js"],
    output_dir: "./",
    memory_loader_url: "@candlelib/hydrocarbon",
    optimize: false,
    combine_recognizer_and_completer: true,
    add_annotations: true,
    debug: false,
    number_of_workers: 10
});

//const prod = grammar[27];
//const runner = constructCompilerRunner(true);
//const { fn } = constructHybridFunction(prod, grammar, runner);
////const { const: constants_a, fn: const_functions_a } = runner.render_constants();
//
////const str = fn.map(sk => sk ? skRenderAsSK(sk) : "").join("\n");
//const { fn: fn_, const: const_ } = runner.render_constants();
//const str = [...fn_, ...const_, ...fn].map(sk => sk ? skRenderAsTypeScript(sk) : "").join("\n");
////const code = Object.assign(new AS, fn).addStatement(...constants_a, ...const_functions_a).renderCode();

//await fsp.writeFile("./test/temp-function.ts", code);

const str = `<?php

$mapping = [
    \Stripe\Account::OBJECT_NAME => \Stripe\Account::class,
    \Stripe\AccountLink::OBJECT_NAME => \Stripe\AccountLink::class,
    \Stripe\AlipayAccount::OBJECT_NAME => \Stripe\AlipayAccount::class,
    \Stripe\ApplePayDomain::OBJECT_NAME => \Stripe\ApplePayDomain::class,
    \Stripe\ApplicationFee::OBJECT_NAME => \Stripe\ApplicationFee::class,
    \Stripe\ApplicationFeeRefund::OBJECT_NAME => \Stripe\ApplicationFeeRefund::class,
    \Stripe\Balance::OBJECT_NAME => \Stripe\Balance::class
]
`;

const result = hadHocParse(grammar, grammar_functions, runner, str);

assert(i, 40000, result === "");;