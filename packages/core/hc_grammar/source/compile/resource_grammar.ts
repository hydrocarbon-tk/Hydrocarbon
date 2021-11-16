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

export async function resolveResourceFile(grammar: GrammarObject, logger: Logger):
    Promise<GrammarObject> {

    const errors: Error[] = [];

    try {


        //distributePriorities(grammar, errors);

        logger.rewrite_log("Processing core symbols");
        processSymbols(grammar, errors);

        logger.rewrite_log("Building scanner productions");
        buildScannerProduction(grammar);

        logger.rewrite_log("Processing scanner symbols");
        processSymbols(grammar, errors);

        logger.rewrite_log("Building item maps");
        buildItemMaps(grammar);

        logger.rewrite_log("Creating collision matrix");
        createCollisionMatrix(grammar);

        logger.rewrite_log("Grammar hydration complete");
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
    arg: "stdin" | "" | URI,
    logger: Logger
) {

    var grammar: GrammarObject;

    if (arg === "stdin" || !arg) {
        await new Promise((ok, fail) => {
            process.stdin.resume();
            process.stdin.setEncoding('utf8');

            let data: string[] = [];
            process.stdin.on('data', function (chunk: string) {
                data.push(chunk);

            });
            process.stdin.on('end', async function stdin_end() {

                try {
                    grammar = JSON.parse(data.join(""));

                    logger.log("Read from stdin");

                    ok(0);
                } catch (e) {
                    logger.error(new Error("Unable to parse input as grammar file"));
                    fail(-1);
                }
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
    grammar = await resolveResourceFile(grammar, logger);

    return grammar;
}