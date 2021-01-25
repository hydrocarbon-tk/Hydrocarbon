import URL from "@candlefw/url";
import { Grammar } from "../types/grammar";
import { GrammarParserEnvironment } from "../types/grammar_compiler_environment";
import { default_map } from "../utilities/default_map.js";
import { Sym_Is_A_Production, Sym_Is_A_Production_Token } from "../utilities/symbol.js";

export default function (sym, env: GrammarParserEnvironment) {


    const
        FILE_URL = env.FILE_URL,
        AWAIT = env.AWAIT,
        PENDING_FILES = env.PENDING_FILES,
        meta_imported_productions = env.meta_imported_productions,
        url = sym[3],
        id = sym[6];

    //load data from the other file
    const
        uri = default_map[url] ?? URL.resolveRelative(url, FILE_URL + ""),

        key = uri + "";

    env.imported_grammar_name_resolution_map.set(id, key);

    if (meta_imported_productions.has(key)) {
        const p = meta_imported_productions.get(key);
        if (!p.SYMBOL_LIST || p.PENDING)
            return { type: "import", id, url };
    } else
        meta_imported_productions.set(key, Object.assign([], { SYMBOL_LIST: true, PENDING: true, LU: null }));

    env.AWAIT.count++;

    env.PENDING_FILES.count++;

    uri.fetchText().then(async txt => {

        let prods: Grammar = null;

        try {
            prods = await env.grammarParser(
                txt,
                uri,
                env.stamp * env.body_count ** AWAIT.count + 1 + (Math.random() * 10000) | 0,
                meta_imported_productions,
                PENDING_FILES
            );
        } catch (e) {
            console.warn("Error encountered in " + uri);
            throw e;
        }

        let EXISTING = false;
        prods.imported = true;

        for (let i = 0; i < prods.length; i++) {
            const prod = prods[i];

            if (!prod.IMPORTED) { //Only allow one level of name spacing

                prod.name = `${id}$${prod.name}`;
                prod.IMPORTED = true;
                prod.url = uri.path;

                if (prod.bodies) {
                    for (const body of prod.bodies) {
                        for (const sym of body.sym) {
                            if ((Sym_Is_A_Production(sym) || Sym_Is_A_Production_Token(sym)) && !sym.IMPORTED && sym.val !== -55) {
                                sym.val = -55;
                                sym.name = `${id}$${sym.name}`;
                            }
                        }
                    }
                }
            }
        }

        let p;
        //Make sure only one instance of any URL resource is used in grammar.

        if ((p = meta_imported_productions.get(key))) {

            if (p.SYMBOL_LIST) {

                p.forEach(sym => {

                    try {
                        const production = prods.LU.get(sym.name);
                        sym.name = `${id}$${production.name}`;
                        sym.RESOLVED = true;
                        sym.production = production;
                        sym.resolveFunction(production);
                    } catch (e) {
                        console.error(e);
                        throw Error(`\nError in: \nfile://${uri}:\n\tGrammar ${id} does not have a production named ${sym.name}`);
                    }

                });
            } else
                EXISTING = true;
        }

        if (!EXISTING) {
            env.productions.push(...prods);
            env.productions.meta.preambles.push(...prods.meta.preambles);
            meta_imported_productions.set(key, prods);
        }

        env.PENDING_FILES.count--;
        env.AWAIT.count--;
    }).catch(e => {
        throw e;
    });

    return { type: "import", id, url };
}