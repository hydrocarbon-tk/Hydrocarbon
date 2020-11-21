import { compileGrammars } from "@candlefw/hydrocarbon";
import URL from "@candlefw/url";
import { compileHybrid } from "../build/library/hybrid/hybrid_compiler.js";
import { assert } from "console";

//const url = await URL.resolveRelative("../source/grammars/hcg/hcg.hcg");
const url = await URL.resolveRelative("./mock/test_grammar_e_fork.hcg");

const file = await url.fetchText();

const test_string = `( (test);(test);, mango ) => { trucks }`;

assert_group(() => {

    const grammar = await compileGrammars(file, url + "");

    //const grammarB = await compileGrammars(fileB, urlB + "");
    /*
        Go through each item ----
        Gather each item that transitions on a particular symbol; 
        This combinations represent whole groups that can transition 
        to a new state;
    */
    //const B = await compileHybrid(grammarB);
    const parserHybrid = await compileHybrid(grammar, {}, {
        ts_output_dir: "./temp/",
        wasm_output_dir: "./temp/",
        combine_wasm_with_js: true
    });

    //const parserLL = renderLLFN(grammar);
    const env = {
        functions: {
            parseString(a, b, lex) {

                const pk = lex.pk,
                    end = lex.tx;

                lex.next();

                while (!pk.END && pk.tx != end) {
                    if (pk.tx == "\\")
                        pk.next();
                    pk.next();
                }

                lex.tl = pk.off - lex.off;
            }
        }
    };


    assert(parserHybrid(test_string, {}));


}, sequence);
