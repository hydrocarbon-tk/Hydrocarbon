import URL from "@candlefw/url";
import { constructCompilerEnvironment } from "../../build/library/grammar/grammar_parser.js";
import { compileBasicHCGParser } from "../tools.js";

const hcg_dir = URL.resolveRelative("../../source/grammars/hcg/");
assert_group(sequence, 20000, () => {

    function getEnv() {
        let env = constructCompilerEnvironment("", { count: 0 }, { count: 0 }, 112, new Map);
        env.fn = env.functions;
        return env;
    };

    //Construct A HCG parser
    const HCGparser = await compileBasicHCGParser(false, false);



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
        assert("Number Of Root Productions Match File Declarations", root_productions.length == 9);
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

    assert_group("functions.hcg", sequence, () => {
        //Trivial grammar
        const string = await URL.resolveRelative("./functions.hcg", hcg_dir).fetchText();
        const result = HCGparser(string, getEnv());
        assert("Parse Has Not Failed", result.FAILED != true);
        const root_productions = result.result[0].filter(p => !p.subtype);
        assert("Number Of Root Productions Match File Declarations", root_productions.length == 9);
        assert("First Production Name Is Correct", root_productions[0].name === "hcg_functions");
    });


    assert_group("symbols.hcg", sequence, () => {
        //Trivial grammar
        const string = await URL.resolveRelative("./symbols.hcg", hcg_dir).fetchText();
        const result = HCGparser(string, getEnv());
        assert("Parse Has Not Failed", result.FAILED != true);
        const root_productions = result.result[0].filter(p => !p.subtype);
        assert("Number Of Root Productions Match File Declarations", root_productions.length == 23);
        assert("First Production Name Is Correct", root_productions[0].name === "hcg_symbols");
    });


    assert_group("trivial_grammar [ <> start > t:test ]", () => {
        const result = HCGparser(`<> start > t:test`, getEnv());
        assert("Parse Has Not Failed", result.FAILED != true);
        assert("Number Of Root Productions Match Declarations", result.result[0].length == 1);
        assert(result.result[0][0].name == "start");
    });


});