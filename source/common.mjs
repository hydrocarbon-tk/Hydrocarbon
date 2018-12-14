import whind from "/node_modules/@candlefw/whind/source/whind.mjs";

export const MASK = whind.types.symbol | whind.types.operator | whind.types.open_bracket | whind.types.close_bracket;

export const EMPTY_PRODUCTION = "ɛ";

export const isNonTerm = (f) => f !== undefined && (typeof(f) == "number" || (f[0] !== "τ" && f[0] !== "ɛ" && f[0] !== "θ" && !(whind(f).type & MASK)));

function addNonTerminal(table, nonterm, grammar, body_ind, index = 0) {
    let first = nonterm[index],
        terminal = "",
        HAS_E = false;
    if (first[0] == "τ") {
        terminal = first.slice(1);
    } else if (first[0] == EMPTY_PRODUCTION) {
        table.add(EMPTY_PRODUCTION);
        return true;
    } else if (!isNonTerm(first)) {
        terminal = first;
    } else {

        let body = grammar[first].bodies;

        for (let i = 0; i < body.length; i++)
            if (i !== body_ind || first !== nonterm.production) {
                if (addNonTerminal(table, body[i], grammar, i)) {
                    HAS_E = true;
                }
            }

        if (index < nonterm.length - 1 && HAS_E)
            addNonTerminal(table, nonterm, grammar, body_ind, index + 1);

        return HAS_E;
    }


    table.add(terminal);

    return HAS_E;
}

/**************** FIRST and FOLLOW sets ***************************/

const merge = (follow, first) => {
    first.forEach((v) => {
        if (v !== EMPTY_PRODUCTION)
            follow.add(v);
    });
};

export function FIRST(grammar, ...symbols) {
    if (!symbols[0]) return [];

    let set = new Set();

    for (let i = 0; i < symbols.length; i++) {
        let SYMBOL = symbols[i];
        let subset = new Set();

        if (isNonTerm(SYMBOL)) {
            let production = grammar[SYMBOL];
            let HAS_E = false;
            for (let i = 0; i < production.bodies.length; i++) {
                let body = production.bodies[i];
                if (addNonTerminal(subset, body, grammar, body.id)) {
                    HAS_E = true;
                }
            }

            //Merge the sets 
            subset.forEach(v => set.add(v));

            if (!HAS_E) {
                break;
            }
        } else {
            if (SYMBOL == EMPTY_PRODUCTION)
                continue;

            set.add(SYMBOL);
            break;
        }
    }

    const val = [...set];

    if (isNonTerm(symbols[0]))
        grammar[symbols[0]].first = val;

    return val;
}

export function FOLLOW(grammar, production) {

    let prod = grammar[production];

    if (prod.follow) return grammar[production].follow;

    //We'll construct follows for all productions as this best down all at once. 

    let table = [];

    for (let i = 0; i < grammar.length; i++) {
        grammar[i].follow = new Set();
        table.push(grammar[i].follow);
    }

    table[0].add("$"); //End of Line

    for (let i = 0; i < grammar.length; i++) {
        let production = grammar[i];

        for (let i = 0; i < production.bodies.length; i++) {
            let body = production.bodies[i];

            for (let i = 0; i < body.length; i++) {
                let val = body[i];

                if (isNonTerm(val)) {

                    let follow = table[val];

                    for (var j = i + 1; j < body.length; j++) {
                        let val = body[j],

                            body_index = i;

                        if (isNonTerm(val)) {

                            merge(follow, FIRST(grammar, val), body_index);

                            if (new Set(FIRST(grammar, val)).has(EMPTY_PRODUCTION))
                                continue;
                        } else {
                            if (val !== EMPTY_PRODUCTION)
                                follow.add(val);
                        }
                        break;
                    }

                }
            }
        }
    }

    for (let i = 0; i < grammar.length; i++) {

        let production = grammar[i];

        let production_index = i;

        for (let i = 0; i < production.bodies.length; i++) {

            let body = production.bodies[i];

            for (let i = body.length; i > 0; i--) {
                let val = body[i - 1];

                if (isNonTerm(val)) {

                    if (val !== production_index)
                        merge(table[val], table[production_index]);

                    if (new Set(FIRST(grammar, val)).has(EMPTY_PRODUCTION))
                        continue;
                }

                break;
            }
        }
    }

    return prod.follow;
}

/************ Grammar Production Functions *****************************/

function setFunction(env, function_body, function_params = [], this_object = null) {
    if (function_body[0] == "^")
        if (env && env.functions[function_body.slice(1)])
            return env.functions[function_body.slice(1)].bind(this_object);
        else
            return () => {};

    return (Function).apply(this_object, function_params.concat([function_body]));
}

export function createFunctions(body, env) {

    body.node = null;
    body.sr = [];           

    if (body.funct.cstr) {
        let node = null;
        if (body.funct.cstr[0] == "^") {
            node = env.functions[body.funct.cstr.slice(1)];
        } else {
            node = function() {};

            node = setFunction(null, body.funct.cstr, ["params",  "env", "lex"], node);
        }

        body.node = node;
    }

    for (let funct in body.funct) {
        if (typeof(body.funct[funct]) == "string") {
            if (funct == "cstr") continue;
            
            if(!isNaN(funct)){
            	body.sr[parseInt(funct)] = new Function("items", "env", "lex", body.funct[funct]);
            }else if(body.node)
            	body.node.prototype[funct] = setFunction(env, body.funct.cstr, node.prototype);
        }
    }

    body.funct = null;
}