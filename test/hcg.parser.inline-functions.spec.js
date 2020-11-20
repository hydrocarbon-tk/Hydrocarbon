import { compileGrammars } from "@candlefw/hydrocarbon";
import URL from "@candlefw/url";
import { compileHybrid } from "../build/library/hybrid/hybrid_compiler.js";
import { assert } from "console";
import { constructCompilerEnvironment } from "../build/library/grammar/grammar_parser.js";

const url = await URL.resolveRelative("../source/grammars/hcg/hcg.hcg");
const file = await url.fetchText();
const test_string = `
↦asi {while(θws)$next;if(\\;) return true;return false;}
↦str {
    
    $tk_start;

    while( !\\" && !θeof) { if(\\\\) $next; $next }

    if(!\\") return false;

    $tk_end;

    return true;
}

↦shift_eh {
    const start = $off;
    
    if( \\/* ) {
        $next;
        while(! \\*/ && !$end) $next;
        $no_check;
    } else if( \\// ) {
        while( !g:nl && !$end) $next;
        $no_check;
    } else $false;

    $true;
}


<> S > E
`;

assert_group("Should parse string without error.", () => {

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

    parserHybrid(test_string, env);

    console.log(env);

    assert(env.refs.get("asi").txt == "while(<--generated^^ws-->)$next;if(<--symbol^^;-->) return true;return false;");
}, sequence);
