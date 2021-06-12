import URI from "@candlelib/uri";
import { HCG3Grammar } from "../types/grammar_nodes";
import loader from "./hcg3_parser.js";
import { HCGParser } from "@candlelib/hydrocarbon/build/types/types/parser";
import { default_map } from "../utilities/default_map.js";

/**
 * Entry point to loading a grammar from a string
 * @param str
 * @param grammar_parser
 * @returns
 */
await URI.server();
export function loadGrammarFromString(str: string, grammar_parser: HCGParser = loader.parser): HCG3Grammar {
    const a = grammar_parser(str);

    return a.result[0];
}
/**
 * Entry point to loading a grammar file from a URI
 */

export async function loadGrammarFromFile(uri: URI | string, grammar_parser: HCGParser = loader.parser): Promise<HCG3Grammar> {

    const uri_string = uri + "";

    const internal_uri = new URI(uri_string);

    const existing_grammars: Map<string, HCG3Grammar> = new Map;

    const grammar = await loadGrammar(internal_uri, grammar_parser, existing_grammars);

    existing_grammars.set("root", grammar);

    for (const grammar of existing_grammars.values()) {

        grammar.common_import_name = (new URI(grammar.URI)).filename.replace(/-/g, "_");

        for (const imported_grammar of grammar.imported_grammars) {
            imported_grammar.grammar = existing_grammars.get(imported_grammar.uri);
        }
    }

    return grammar;
}
;

async function loadGrammar(uri: URI, grammar_parser: any = loader.parser, existing_grammars: Map<string, HCG3Grammar>): Promise<HCG3Grammar> {
    uri = getResolvedURI(uri);

    const str = await uri.fetchText();

    const grammar = loadGrammarFromString(str, grammar_parser);

    grammar.URI = uri + "";

    const import_locations = [];


    //Load imported grammars
    for (const preamble of grammar.preamble) {

        if (preamble.type == "import") {

            const location = getResolvedURI(new URI(preamble.uri), uri),
                location_string = location + "";

            grammar.imported_grammars.push({
                uri: location_string,
                grammar: null,
                reference: preamble.reference
            });

            import_locations.push(location_string);

            if (!existing_grammars.has(location_string)) {

                // temporarily assign empty value until the import 
                // can be completed
                existing_grammars.set(location_string, null);

                const import_grammar = await loadGrammar(location, grammar_parser, existing_grammars);

                existing_grammars.set(location_string, import_grammar);

            }
        }
    }

    return grammar;
}


export function getResolvedURI(uri: URI, source?: URI) {
    uri = default_map[uri + ""] ?? uri;

    if (uri.IS_RELATIVE)
        uri = URI.resolveRelative(uri, source);
    return uri;
}

