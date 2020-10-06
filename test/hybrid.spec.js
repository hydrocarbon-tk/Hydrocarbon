import { compileGrammars } from "@candlefw/hydrocarbon";
import URL from "@candlefw/url";
import { CompileHybrid } from "../build/library/hybrid/hybrid_compiler.js";

const url = await URL.resolveRelative("./mock/test_grammar_a.hcg");

const file = await(await URL.resolveRelative("./mock/test_grammar_a.hcg")).fetchText();

assert_group(() => {

    const grammar = await compileGrammars(file, url + "");
    /*
        Go through each item ----
        Gather each item that transitions on a particular symbol; 
        This combinations represent whole groups that can transition 
        to a new state;
    */

    assert(CompileHybrid(grammar, {}) == "");
}, sequence);



