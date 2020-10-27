import { Grammar } from "../types/grammar.js";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { HybridMultiThreadRunner } from "./hybrid_mt_runner.js";
import fs from "fs";
import spark from "@candlefw/spark";
import URL from "@candlefw/url";
import { printJumpTable } from "./assemblyscript/hybrid_lexer.js";
const fsp = fs.promises;

export async function compileHybrid(grammar: Grammar, env: GrammarParserEnvironment) {

    const type = "WebAssembly";

    const mt_runner = new HybridMultiThreadRunner(grammar, env);

    for (const updates of mt_runner.run()) {
        // /console.dir({ updates });
        await spark.sleep(1);
    }

    const temp_dir = URL.resolveRelative("./temp/");
    const temp_source = URL.resolveRelative("./temp/source/");
    const rust_file = URL.resolveRelative("./temp/source/parser.ts");
    const module_file = URL.resolveRelative("./temp/parser.js");
    const jump_table_file = URL.resolveRelative("./temp/jump_table.js");
    try {
        //Create the temp directory
        await fsp.mkdir(temp_source + "", { recursive: true });
        fsp.writeFile(rust_file + "", mt_runner.parser);
        fsp.writeFile(module_file + "", mt_runner.js_resolver);
        fsp.writeFile(jump_table_file + "", printJumpTable());

        //run the wasm-pack inside the temp directory
        /*
        await new Promise(res{
            const rust = spawn("wasm-pack", "build", {cwd: temp_dir + "" } (e, stdout, stderr)=>{
                if(e)
                    console.log(e);
                res();
            })
        }
*/

    } catch (e) {
        console.log(e);
    }

    //Create the temp directory
    fs.writeFileSync(`./hybrid_${new URL(grammar.uri).filename}.js`, "export default " + mt_runner.parser);

    return Function(`return (${mt_runner.parser})()`)();
}

