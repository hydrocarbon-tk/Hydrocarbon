function addNonTerminal(table, body, grammar, body_ind, index = 0) {
    if (!body.sym[index]) {
        return true;
        //throw new Error(`Empty production at index ${index} in [${body.production.name}]`);
    }

    const first = body.sym[index];

    let terminal = "",
        HAS_E = false;


    if (first.type == "literal") {
        terminal = first.val;
    } else if (first.type == "empty") {
        return true;
    } else if (first.type !== "production") {
        terminal = first.val;
    } else {

        const bodies = grammar[first.val].bodies;

        for (let i = 0; i < bodies.length; i++)
            if (i !== body_ind && first.val !== body.production.id)
                HAS_E = addNonTerminal(table, bodies[i], grammar, bodies[i].id);

        if (index < body.length - 1 && HAS_E)
            addNonTerminal(table, body, grammar, body_ind, index + 1);

        return HAS_E;
    }

    const cc = terminal.charCodeAt(0);

    //If the first character of the terminal is in the alphabet, treat the token as a identifier terminal
    if (!(cc < 48 || (cc > 57 && cc < 65) || (cc > 90 && cc < 97) || cc > 122)) {
        terminal = "" + terminal;
    }

    table.set(terminal, { v: terminal, p: grammar.bodies[body_ind].precedence || 0, type: first.type });

    return HAS_E;
}

export function FIRST(grammar, ...symbols) {

    if (!symbols[0]) return [];

    const set = new Map();

    for (let i = 0; i < symbols.length; i++) {
        const SYMBOL = symbols[i],
            subset = new Map();

        if (SYMBOL.type == "production") {

            const production = grammar[SYMBOL.val];

            let HAS_E = false;

            for (let i = 0; i < production.bodies.length; i++) {

                const body = production.bodies[i];

                HAS_E = addNonTerminal(subset, body, grammar, body.id);
            }

            //Merge the sets 
            subset.forEach((v, k) => { if (!set.has(k)) set.set(k, v); });

            if (!HAS_E) break;

        } else if (SYMBOL.v) {
            set.set(SYMBOL.v, SYMBOL);
        } else {

            if (SYMBOL.type == "empty")
                continue;

            set.set(SYMBOL.val, { v: SYMBOL.val, p: 0, type: SYMBOL.type });

            break;
        }
    }

    const val = [];

    set.forEach((v) => val.push(v));

    return val;
}