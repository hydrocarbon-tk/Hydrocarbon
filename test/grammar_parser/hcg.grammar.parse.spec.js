import URL from "@candlefw/url";

import { compileGrammars } from "@candlefw/hydrocarbon";
import { compileHybrid } from "../../build/library/compiler/hybrid_compiler.js";
import { constructCompilerEnvironment } from "../../build/library/grammar/grammar_parser.js";

const hcg_dir = URL.resolveRelative("../../source/grammars/hcg/");
assert_group(sequence, () => {


    function getEnv() {
        let env = constructCompilerEnvironment("", { count: 0 }, { count: 0 }, 112, new Map);
        env.fn = env.functions;
        return env;
    };

    //Construct A HCG parser
    const HCG_source_url = await URL.resolveRelative("../../source/grammars/hcg/hcg.hcg");
    const HCG_source = await HCG_source_url.fetchText();
    const
        grammar =
            await compileGrammars(HCG_source, HCG_source_url + ""),
        HCGparser =
            await compileHybrid(grammar, {}, {
                type: "javascript",
                completer_output_dir: "./temp/",
                recognizer_output_dir: "./temp/",
                create_function: true,
                no_file_output: false,
                number_of_workers: 10,
                add_annotations: false,
                debug: false
            });

    assert("Construct HCG Parser", HCGparser != undefined);

    /*
    Test the HCG parser to ensure that it is capable of parsing:
    1. The HCG grammar definition files;
    2. The default productions file;
    3. Various grammar inputs;
    */

    assert_group("hcg.hcg", () => {
        //Trivial grammar
        const string = await URL.resolveRelative("./hcg.hcg", hcg_dir).fetchText();
        const result = HCGparser(string, getEnv());
        assert("Parse Has Not Failed", result.FAILED != true);
        const root_productions = result.result[0].filter(p => !p.subtype);
        assert("Number Of Root Productions Match File Declarations", root_productions.length == 2);
        assert("First Production Name Is Correct", root_productions[0].name === "hydrocarbon");
    });

    assert_group("preambles.hcg", sequence, () => {
        //Trivial grammar
        const string = await URL.resolveRelative("./preambles.hcg", hcg_dir).fetchText();
        const result = HCGparser(string, getEnv());
        assert("Parse Has Not Failed", result.FAILED != true);
        const root_productions = result.result[0].filter(p => !p.subtype);
        assert("Number Of Root Productions Match File Declarations", root_productions.length == 10);
        assert("First Production Name Is Correct", root_productions[0].name === "hcg_preamble");
    });

    assert_group("comments.hcg", sequence, () => {
        //Trivial grammar
        const string = await URL.resolveRelative("./comments.hcg", hcg_dir).fetchText();
        const result = HCGparser(string, getEnv());
        assert("Parse Has Not Failed", result.FAILED != true);
        const root_productions = result.result[0].filter(p => !p.subtype);
        assert("Number Of Root Productions Match File Declarations", root_productions.length == 6);
        assert("First Production Name Is Correct", root_productions[0].name === "hcg_comment");
    });

    assert_group("productions.hcg", sequence, () => {
        //Trivial grammar
        const string = await URL.resolveRelative("./productions.hcg", hcg_dir).fetchText();
        const result = HCGparser(string, getEnv());
        assert("Parse Has Not Failed", result.FAILED != true);
        const root_productions = result.result[0].filter(p => !p.subtype);
        assert("Number Of Root Productions Match File Declarations", root_productions.length == 4);
        assert("First Production Name Is Correct", root_productions[0].name === "hcg_productions");
    });

    assert_group("production_bodies.hcg", sequence, () => {
        //Trivial grammar
        const string = await URL.resolveRelative("./production_bodies.hcg", hcg_dir).fetchText();
        const result = HCGparser(string, getEnv());
        assert("Parse Has Not Failed", result.FAILED != true);
        const root_productions = result.result[0].filter(p => !p.subtype);
        assert("Number Of Root Productions Match File Declarations", root_productions.length == 7);
        assert("First Production Name Is Correct", root_productions[0].name === "hcg_production_bodies");
    });

    assert_group(solo, "functions.hcg", sequence, () => {
        //Trivial grammar
        const string = await URL.resolveRelative("./functions.hcg", hcg_dir).fetchText();
        const result = HCGparser(string, getEnv());
        assert("Parse Has Not Failed", result.FAILED != true);
        const root_productions = result.result[0].filter(p => !p.subtype);
        assert("Number Of Root Productions Match File Declarations", root_productions.length == 9);
        assert("First Production Name Is Correct", root_productions[0].name === "hcg_functions");
    });


    assert_group(solo, "symbols.hcg", sequence, () => {
        //Trivial grammar
        const string = await URL.resolveRelative("./symbols.hcg", hcg_dir).fetchText();
        const result = HCGparser(string, getEnv());
        assert("Parse Has Not Failed", result.FAILED != true);
        const root_productions = result.result[0].filter(p => !p.subtype);
        assert("Number Of Root Productions Match File Declarations", root_productions.length == 22);
        assert("First Production Name Is Correct", root_productions[0].name === "hcg_symbols");
    });


    assert_group("trivial_grammar [ <> start > t:test ]", () => {
        const result = HCGparser(`<> start > t:test`, getEnv());
        assert("Parse Has Not Failed", result.FAILED != true);
        assert("Number Of Root Productions Match Declarations", result.result[0].length == 1);
        assert(result.result[0][0].name == "start");
    });


});