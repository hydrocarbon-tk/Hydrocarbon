import { getPackageJsonObject } from "@candlelib/wax";
import URL from "@candlelib/url";
import { compileGrammars, compile } from "@candlelib/hydrocarbon";

await URL.server();

const result = await getPackageJsonObject();

const url = await URL.resolveRelative("../source/grammars/misc/optimized.hcg", import.meta.url);

const grammar_string = await url.fetchText();

const grammar = await compileGrammars(grammar_string, url + "");

await compile(grammar, {}, {
    name: "opt_" + result.package.version.replace(/\./g, "_"),
    recognizer_type: "js",
    completer_type: "js",
    output_dir: URL.resolveRelative("../test/compiled_parser/versioned_optimized/", import.meta.url),
    combine_recognizer_and_completer: true,
    create_function: false,
    no_file_output: false,
    number_of_workers: 1,
    add_annotations: true,
    debug: true
});