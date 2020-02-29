import { SymbolType } from "../types/grammar.js";
function addNonTerminal(table, body, grammar, body_ind, index = 0) {
    if (!body.sym[index]) {
        return true;
        //throw new Error(`Empty production at index ${index} in [${body.production.name}]`);
    }
    const first = body.sym[index];
    let terminal = "", HAS_EMPTY_PRODUCTION = false;
    if (first.type == SymbolType.LITERAL) {
        terminal = first.val;
    }
    else if (first.type == SymbolType.EMPTY) {
        return true;
    }
    else if (first.type !== SymbolType.PRODUCTION) {
        terminal = first.val;
    }
    else {
        const bodies = grammar[first.val].bodies;
        for (let i = 0; i < bodies.length; i++)
            if (i !== body_ind && first.val !== body.production.id)
                HAS_EMPTY_PRODUCTION = addNonTerminal(table, bodies[i], grammar, bodies[i].id);
        if (index < body.length - 1 && HAS_EMPTY_PRODUCTION)
            addNonTerminal(table, body, grammar, body_ind, index + 1);
        return HAS_EMPTY_PRODUCTION;
    }
    table.set(first.val, first);
    return HAS_EMPTY_PRODUCTION;
}
export function FIRST(grammar, ...symbols) {
    if (!symbols[0])
        return [];
    const map = new Map();
    for (let i = 0; i < symbols.length; i++) {
        const SYMBOL = symbols[i], submap = new Map();
        if (SYMBOL.type == SymbolType.PRODUCTION) {
            const production = grammar[SYMBOL.val];
            let HAS_EMPTY_PRODUCTION = false;
            for (let i = 0; i < production.bodies.length; i++) {
                const body = production.bodies[i];
                HAS_EMPTY_PRODUCTION = addNonTerminal(submap, body, grammar, body.id);
            }
            //Merge the sets 
            submap.forEach((v, k) => { if (!map.has(k))
                map.set(k, v); });
            if (!HAS_EMPTY_PRODUCTION)
                break;
        }
        else {
            if (SYMBOL.type == SymbolType.EMPTY)
                continue;
            map.set(SYMBOL.val, SYMBOL);
            break;
        }
    }
    return Array.from(map.values());
}
