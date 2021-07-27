import URI from "@candlelib/uri";
import { HCG3Function, HCG3Grammar } from "../../types/grammar_nodes";
import loader from "../hcg3_parser.js";
import { HCGParser } from "@candlelib/hydrocarbon/build/types/types/parser";
import { default_map } from "../../utilities/default_map.js";

/**
 * Entry point to loading a grammar from a string
 * @param str
 * @param grammar_parser
 * @returns
 */
await URI.server();

const parser = await loader;
export function loadGrammarFromString(str: string, grammar_parser: HCGParser = parser): HCG3Grammar {

    const grammar = grammar_parser(str, { group_id: 0 }).result[0];

    resolveReferencedFunctions(grammar);

    return grammar;
}
/**
 * Entry point to loading a grammar file from a URI
 */

export async function loadGrammarFromFile(uri: URI | string, grammar_parser: HCGParser = parser): Promise<HCG3Grammar> {

    const uri_string = uri + "";

    const internal_uri = new URI(uri_string);

    const existing_grammars: Map<string, HCG3Grammar> = new Map;

    const grammar = await loadGrammar(internal_uri, grammar_parser, existing_grammars);

    existing_grammars.set("root", grammar);

    const import_grammars = new Map(grammar.imported_grammars.map(g => [g.uri, g]));

    for (const gmmr of existing_grammars.values()) {

        if (gmmr == grammar) continue;

        gmmr.common_import_name = (new URI(gmmr.URI)).filename.replace(/-/g, "_");

        if (!import_grammars.has(gmmr.URI)) {
            import_grammars.set(gmmr.URI, {
                reference: gmmr.common_import_name,
                uri: gmmr.URI,
                grammar: null,
            });
        }

        for (const imported_grammar of gmmr.imported_grammars)
            imported_grammar.grammar = existing_grammars.get(imported_grammar.uri);

        import_grammars.get(gmmr.URI).grammar = gmmr;

        const ref_name = import_grammars.get(gmmr.URI).grammar.common_import_name;

        for (const production of gmmr.productions)
            production.grammar_id = ref_name;
    }

    grammar.imported_grammars = [...import_grammars.values()];

    return grammar;
}
;

async function loadGrammar(uri: URI, grammar_parser: any = parser, existing_grammars: Map<string, HCG3Grammar>): Promise<HCG3Grammar> {

    uri = getResolvedURI(uri);

    const str = await uri.fetchText();

    console.log(`Grammar: Loading ${uri}`);

    const grammar = loadGrammarFromString(str, grammar_parser);

    grammar.URI = uri + "";

    const import_locations = [];

    resolveReferencedFunctions(grammar);

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
function resolveReferencedFunctions(grammar: HCG3Grammar) {
    const fn_lu = grammar.functions.reduce((r, v) => (r.set(v.id, v), r), new Map);

    for (const production of grammar.productions) {


        for (const body of production.bodies)

            if (body.reduce_function
                &&
                body.reduce_function.ref
                &&
                fn_lu.has(body.reduce_function.ref)) {
                body.reduce_function = <HCG3Function>{
                    js: "",
                    txt: fn_lu.get(body.reduce_function.ref).txt,
                    type: "RETURNED",
                };
            }

    }

    grammar.meta = {};

    grammar.meta.ignore = <any[]>[grammar.preamble.filter(t => t.type == "ignore")[0]].filter(i => !!i)[0]?.symbols ?? [];
}

export function getResolvedURI(uri: URI, source?: URI) {
    uri = default_map[uri + ""] ?? uri;

    if (uri.IS_RELATIVE)
        uri = URI.resolveRelative(uri, source);
    return uri;
}

