
import { copy, experimentalConstructRenderers, experimentalRender, traverse } from "@candlelib/conflagrate";
import URI from "@candlelib/url";
import { HCG3Grammar } from "../types/grammar_nodes";
import { hcg3_mappings } from "./mappings.js";

const renderers = experimentalConstructRenderers(hcg3_mappings);
const render = (grammar_node) => experimentalRender(grammar_node, hcg3_mappings, renderers);
/**
 * Entry point to loading a grammar from a string
 * @param str 
 * @param grammar_parser 
 * @returns 
 */
export function loadGrammarFromString(str: string, grammar_parser: any): HCG3Grammar {
    const env = {};

    return grammar_parser(str, {})[0];
}

/**
 * Merges imported into a single mono grammar 
 */
export function getMonoGrammar(grammar: HCG3Grammar): HCG3Grammar {

}

export function convertToFullyQualifiedProductionNames(grammar: HCG3Grammar): HCG3Grammar {

}

export function convertListProductions(grammar: HCG3Grammar): HCG3Grammar {
    for (const production of grammar.productions) {
        for (const body of production.bodies) {
            for (const sym of body.symbols) {
                if (sym.type == "list-production") {
                    console.log(render(body));
                }
            }
        }
    }
}

/**
 * Entry point to loading a grammar file from a URI 
 */
export async function loadGrammarFromFile(uri: URI, grammar_parser: any, existing_grammars = new Map): HCG3Grammar {

    if (uri.IS_RELATIVE)
        uri = URI.resolveRelative(uri);

    const str = await uri.fetchText();

    const grammar = loadGrammarFromString(str, grammar_parser);

    //Load imported grammars

    for (const preamble of grammar.preamble) {

        if (preamble.type == "import") {

            const location = URI.resolveRelative(preamble.uri, uri);

            if (existing_grammars.has(location + ""))
                continue;

            const import_grammar = await loadGrammarFromFile(location, grammar_parser, existing_grammars);

            grammar.imported_grammars.push({
                reference: preamble.reference,
                uri: location + "",
                grammar: import_grammar
            });
        }
    }

    existing_grammars.set(uri + "", grammar);

    return grammar;
};

/**
 * Loads grammar file from import nodes
 */
export function importGrammarFile() { }