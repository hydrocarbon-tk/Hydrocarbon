/* 
 * Copyright (C) 2021 Anthony Weathersby - The Hydrocarbon Parser Compiler
 * see /source/typescript/hydrocarbon.ts for full copyright and warranty 
 * disclaimer notice.
 */
import { HCGParser } from "@candlelib/hydrocarbon";
import { Logger, LogLevel } from '@candlelib/log';
import "@candlelib/paraffin";
import URI from "@candlelib/uri";
import { GrammarObject, ProductionFunction } from "@hctoolkit/common";
import loader from "../parser/hcg_parser.js";
import { default_map } from './default_map.js';

/**
 * Entry point to loading a grammar from a string
 * @param str
 * @param grammar_parser
 * @returns
 */
await URI.server();

const grammar_logger = Logger.get("MAIN").createLogger("GRAMMAR");

const { parse: parser } = await loader;
export function loadGrammarFromString(str: string, grammar_parser: HCGParser = parser): GrammarObject {

    const { result: [grammar], err } = grammar_parser(str, { group_id: 0 });

    if (err) {
        throw err;
    }

    resolveReferencedFunctions(grammar);

    return grammar;
}
/**
 * Entry point to loading a grammar file from a URI
 */

export async function loadGrammarFromFile(uri: URI | string, grammar_parser: HCGParser = parser): Promise<GrammarObject | null> {

    const uri_string = uri + "";

    const internal_uri = new URI(uri_string);

    const existing_grammars: Map<string, GrammarObject> = new Map;

    const grammar = await loadGrammar(internal_uri, grammar_parser, existing_grammars);

    if (grammar) {

        existing_grammars.set("root", grammar);

        const import_grammars = new Map(grammar.imported_grammars.map(g => [g.uri, g]));

        for (const gmmr of existing_grammars.values()) {

            if (gmmr == grammar) continue;

            gmmr.common_import_name = (new URI(gmmr.URI)).filename.replace(/-/g, "_");

            if (!import_grammars.has(gmmr.URI)) {
                import_grammars.set(gmmr.URI, {
                    reference: gmmr.common_import_name,
                    uri: gmmr.URI,
                    grammar: <any>undefined,
                });
            }

            for (const imported_grammar of gmmr.imported_grammars)
                imported_grammar.grammar = <any>existing_grammars.get(imported_grammar.uri);

            const obj = import_grammars.get(gmmr.URI);

            if (obj) {

                obj.grammar = gmmr;

                const ref_name = obj.grammar.common_import_name;

                for (const production of gmmr.productions)
                    production.grammar_id = ref_name;
            }
        }

        grammar.imported_grammars = [...import_grammars.values()];
    }

    return grammar;
}
;

async function loadGrammar(
    uri: URI,
    grammar_parser: any = parser,
    existing_grammars: Map<string, GrammarObject>,
): Promise<GrammarObject | null> {

    uri = getResolvedURI(uri);

    let str = "";


    str = await uri.fetchText();


    grammar_logger.debug(`Loading ${uri}`);

    const grammar = loadGrammarFromString(str, grammar_parser);

    grammar_logger.debug(`Loaded ${uri}. ${grammar.productions.length} productions identified`);

    grammar.URI = uri + "";

    const import_locations = [];

    resolveReferencedFunctions(grammar);

    createMeta(grammar);

    //Load imported grammars
    for (const preamble of grammar.preamble) {

        if (preamble.type == "import") {

            const location = getResolvedURI(new URI(preamble.uri), uri),
                location_string = location + "";

            grammar.imported_grammars.push({
                uri: location_string,
                grammar: <any>null,
                reference: preamble.reference
            });

            import_locations.push(location_string);

            if (!existing_grammars.has(location_string)) {

                // temporarily assign empty value until the import 
                // can be completed
                existing_grammars.set(location_string, <any>null);

                try {
                    const import_grammar = await loadGrammar(location, grammar_parser, existing_grammars);

                    if (import_grammar)
                        existing_grammars.set(location_string, import_grammar);
                } catch (e) {

                    Logger
                        .get("hydrocarbon")
                        .get("file-loader")
                        .activate(LogLevel.ERROR)
                        .error(`Unable to open ${uri}`);

                    console.log(e);

                    if (preamble.tok || preamble.pos)
                        (<any>preamble.tok ?? preamble.pos).token_slice(8).throw("Unable to load import", uri + "");

                    return null;
                }
            }
        }
    }

    return grammar;
}

/**
 * Replace function references with function logic from the referenced definition. 
 */
function resolveReferencedFunctions(grammar: GrammarObject) {

    const fn_lu = grammar.functions.reduce((r, v) => (r.set(v.id, v), r), new Map);

    for (const production of grammar.productions) {

        production.name = production.symbol.name;

        for (const body of production.bodies)

            if (body.reduce_function
                &&
                body.reduce_function.ref
                &&
                fn_lu.has(body.reduce_function.ref)) {

                body.reduce_function = <ProductionFunction>{
                    js: "",
                    txt: fn_lu.get(body.reduce_function.ref).txt,
                    type: "RETURNED",
                };
            }

    }
}

function createMeta(grammar: GrammarObject) {
    grammar.meta = {
        token_row_size: 0,
        ignore: <any[]>[grammar.preamble.filter(t => t.type == "ignore")[0]].filter(i => !!i)[0]?.symbols ?? []
    };
}

export function getResolvedURI(uri: URI, source?: URI) {

    uri = default_map[uri + ""] ?? uri;

    if (uri.IS_RELATIVE) {
        const candidate = URI.resolveRelative(uri, source);
        if (candidate)
            uri = candidate;
    }

    return uri;
}

