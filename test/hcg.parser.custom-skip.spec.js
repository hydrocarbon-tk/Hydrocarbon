import { compileGrammars } from "@candlefw/hydrocarbon";
import URL from "@candlefw/url";
import { compileHybrid } from "../build/library/hybrid/hybrid_compiler.js";
import { assert } from "console";
import { constructCompilerEnvironment } from "../build/library/grammar/grammar_parser.js";

const url = await URL.resolveRelative("../source/grammars/hcg/hcg.hcg");
const test_string = `
@IGNORE g:ws g:nl

# The custom_skip function is called whenever the lexer seeks the next token.
# It can be used to filter out characters and character sequences that are not
# part of the lexical makeup of the input, such as comment and annotation sections. 
# This code runs within the recognizer logic space space, thus, the same programming
# rules associated with assertion blocks apply to this code as well. 

↦custom_skip {
    if( \\/* ){
        $tk_start;
        while(! \\*/ && !$eof ) $next;
        if( \\*/ ) {
            $next;
            $produce_block_comment;
        }else $join;
    } else if ( \\// ) {
        $tk_start;
        while(!g:nl && !$eof) $next;
        $produce_line_comment;
        $next;
    } 
}

↦line_comment {
    null 
}

↦block_comment {
   null 
}

<> S > A
<> A > t:and | A t:and
`;
/**
 * Custom skips can be used by languages that have comment sections that
 * are allowed to be present between any set of tokens. The skip code will
 * run following the parsing of any token.
 */
assert_group(() => {

    const
        env = constructCompilerEnvironment(url + "", { count: 0 }, { count: 0 }, 112, new Map),
        grammar = await compileGrammars(test_string, url + "");

    const
        hcgParser = await compileHybrid(grammar, {}, {
            wasm_output_dir: "./temp/",
            ts_output_dir: "./temp/",
            add_annotations: true,
            combine_wasm_with_js: true,
            create_function: true,
            optimize: false
        });

    env.fn = env.functions;

    const out = hcgParser(`//test 
    and  /* asd */ and and /* asbbbd */and and`, env).result;

    assert("Should filter out comments and leave only desired productions.", out == ['and', 'and', 'and', 'and', 'and']);
}, sequence);
