import URL from "@candlelib/uri";
import { compileGrammarSource } from "../tools.js";

import fs from "fs";
const fsp = fs.promises;

const files_names = await fsp.readdir(URL.resolveRelative("./versioned_optimized/").toString());

const data = await URL.resolveRelative("./versioned_optimized/data.txt").fetchText();

const hcg_parsers = [];

for (const file of files_names.filter(d => d.includes(".js")).map(f => URL.resolveRelative("./versioned_optimized/" + f)))
    hcg_parsers.push((await harness._import(file + "")).default);

const latest_parser = await compileGrammarSource("../../source/grammars/misc/optimized.hcg", false);

assert_group(sequence, 40000, () => {

    harness.markTime();
    assert(hcg_parsers[0](data).FAILED == false);
    harness.getTime("Parser X");
});

assert_group(sequence, 40000, () => {
    harness.markTime();
    assert(latest_parser(data).FAILED == false);
    harness.getTime("Current Parser");
});