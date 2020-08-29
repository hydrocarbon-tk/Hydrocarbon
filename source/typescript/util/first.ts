import { Symbol, ProductionBody, Grammar, SymbolType } from "../types/grammar.js";


function addNonTerminal(
    table: Map<string | number, Symbol>,
    body: ProductionBody,
    grammar: Grammar,
    body_ind: number,
    index = 0,
    encountered = new Set()
): /*True if production has an empty body */ boolean {

    if (!body.sym[index]) return true;

    const first = body.sym[index];

    let terminal: string = "",
        HAS_EMPTY_PRODUCTION = false;

    if (first.type == SymbolType.LITERAL) {
        terminal = <string>first.val;
    } else if (first.type == SymbolType.EMPTY) {
        return true;
    } else if (first.type !== SymbolType.PRODUCTION) {
        terminal = <string>first.val;
    } else {

        if (!encountered.has(first.val)) {

            encountered.add(first.val);

            const bodies = grammar[first.val].bodies;

            for (let i = 0; i < bodies.length; i++)
                if (i !== body_ind && first.val !== body.production.id) {

                    HAS_EMPTY_PRODUCTION = addNonTerminal(table, bodies[i], grammar, bodies[i].id, 0, encountered);
                }


            if (index < body.length - 1 && HAS_EMPTY_PRODUCTION)
                addNonTerminal(table, body, grammar, body_ind, index + 1);
        }

        return HAS_EMPTY_PRODUCTION;
    }

    table.set(first.val, first);

    return HAS_EMPTY_PRODUCTION;
}

export function FIRST(grammar: Grammar, ...symbols: Symbol[]): Array<Symbol> {

    if (!symbols[0]) return [];

    const map: Map<string | number, Symbol> = new Map();

    for (let i = 0; i < symbols.length; i++) {

        const SYMBOL = symbols[i],
            submap: Map<string | number, Symbol> = new Map();

        if (SYMBOL.type == SymbolType.PRODUCTION) {

            const production = grammar[SYMBOL.val];

            let HAS_EMPTY_PRODUCTION = false;

            for (let i = 0; i < production.bodies.length; i++) {

                const body = production.bodies[i];

                HAS_EMPTY_PRODUCTION = addNonTerminal(submap, body, grammar, body.id);
            }

            //Merge the sets 
            submap.forEach((v, k) => { if (!map.has(k)) map.set(k, v); });

            if (!HAS_EMPTY_PRODUCTION) break;

        } else {

            if (SYMBOL.type == SymbolType.EMPTY)
                continue;

            map.set(SYMBOL.val, SYMBOL);

            break;
        }
    }

    return Array.from(map.values());
}