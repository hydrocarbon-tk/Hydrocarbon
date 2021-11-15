import { Logger } from '@candlelib/log';
import URI from '@candlelib/uri';
import { GrammarObject } from "@hctoolkit/common";
import { deduplicateProductionBodies, GrammarCompilationReport } from './compile';
import { integrateReferencedProductions } from "../passes/referenced_production";
import { createCollisionMatrix, processSymbols } from '../passes/common.js';
import { convertListProductions } from "../passes/convert_list_productions.js";
import { extractMetaSymbolsFromBodies } from "../passes/extract_meta_symbols.js";
import { integrateImportedGrammars } from "../passes/import.js";
import { buildItemMaps } from "../passes/item_map.js";
import { buildScannerProduction } from '../passes/scanner_production.js';


export async function compileResourceFile(grammar: GrammarObject): Promise<GrammarObject> {

    const errors: Error[] = [];

    try {

        //Production and Body transformations.
        integrateImportedGrammars(grammar, errors);

        integrateReferencedProductions(grammar, errors);

        convertListProductions(grammar, errors);

        extractMetaSymbolsFromBodies(grammar, errors);

        deduplicateProductionBodies(grammar, errors);

    } catch (e) {
        console.error(e);

        if (e instanceof Error)
            errors.push(e);
    }

    if (errors.length > 0) {

        throw new GrammarCompilationReport(errors);
    }

    return grammar;
}

export async function resolveResourceFile(grammar: GrammarObject):
    Promise<GrammarObject> {

    const errors: Error[] = [];

    try {


        //distributePriorities(grammar, errors);

        //Meta transformations: Symbols, Functions & Items
        processSymbols(grammar, errors);

        buildScannerProduction(grammar);

        // Reprocess symbols to incorporate symbols from scanner productions
        processSymbols(grammar, errors);

        buildItemMaps(grammar);

        createCollisionMatrix(grammar);

    } catch (e) {
        console.error(e);

        if (e instanceof Error)
            errors.push(e);
    }

    if (errors.length > 0) {


        throw new GrammarCompilationReport(errors);
    }

    return grammar;
}

export async function resolveResourceGrammarCLI(
    arg: "stdin" | URI,
    logger: Logger
) {

    var grammar: GrammarObject;

    if (arg === "stdin") {
        await new Promise((ok, fail) => {
            process.stdin.resume();
            process.stdin.setEncoding('utf8');

            let data: string[] = [];
            process.stdin.on('data', function (chunk: string) {

                data.push(chunk);

            });
            process.stdin.on('end', async function () {

                grammar = JSON.parse(data.join(""));

                ok(0);
            });

            process.stdin.on("error", function (e) {
                logger.error(e);
                fail(1);
            });
        });
    } else {

        const input_file = URI.resolveRelative(arg);

        if (input_file) {

            if (!(await input_file.DOES_THIS_EXIST()))
                throw new Error(`${arg} does not exists`);

            grammar = <any>await input_file.fetchJSON();

            if (!("type" in grammar) || grammar.type != "hc-grammar-5")
                throw new Error("Unable to recognize Hydrocarbon Resource File");
        } else {
            throw new Error("Unable to recognize Hydrocarbon Resource File");
        }
    }

    //@ts-ignore
    grammar = await resolveResourceFile(grammar);

    return grammar;
}