import parserLoader from "./parser.js";
const defaultParser = await parserLoader();

import { grammarParser } from "./grammar_parser.js";
import { filloutGrammar } from "../util/common.js";
import { Grammar } from "../types/grammar.js";
import { SymbolType } from "../types/symbol_type";
import { Production } from "../types/production";
import { Item } from "../util/item.js";

export async function createGrammar(grammar_string: string, grammar_string_path: string, parser = defaultParser): Promise<Grammar> {

    const grammar = await grammarParser(grammar_string, grammar_string_path, undefined, undefined, undefined, parser);

    filloutGrammar(grammar, null);

    const crypto = (await import("crypto"))?.default;

    grammar.hash = createGrammarHash(grammar, crypto);

    return grammar;
}

function createGrammarHash(grammar: Grammar, crypto): string {

    let str = "", to_process_productions = [new Item(0, grammar.bodies[0].length, 0, null)], processed: Set<number> = new Set([0]);

    for (let i = 0; i < to_process_productions.length; i++) {
        //Extract all productions from the body and 
        const item = to_process_productions[i];

        const out = item.body_(grammar).sym
            .filter(sym => sym.type == SymbolType.PRODUCTION)
            .flatMap(s => (<Production>grammar[s.val]).bodies)
            .filter(b => (!processed.has(b.id)))
            .map(b => new Item(b.id, b.length, 0, null));

        for (const { body } of out)
            processed.add(body);

        to_process_productions.push(...out);

        str += "\n" + item.renderUnformatted(grammar);

    }

    return crypto.createHash('md5').update(str).digest("hex");
}