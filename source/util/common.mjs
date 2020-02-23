import whind from "@candlefw/whind";

export const MASK = whind.types.symbol | whind.types.operator | whind.types.open_bracket | whind.types.close_bracket | whind.types.string;

export const EMPTY_PRODUCTION = "{!--EMPTY_PRODUCTION--!}";

export const isNonTerm = (f) => f.type == "production";

import { Item } from "./item.mjs";

export { Item };

export const types = whind.types;

const
    production_stack_arg_name = "sym",
    environment_arg_name = "env",
    lexer_arg_name = "lex";

export function getToken(l, SYM_LU, IGNORE_KEYWORDS = false) {
    if (l.END) return 0; /*"$eof"*/

    switch (l.ty) {
        case types.id:
            if (!IGNORE_KEYWORDS && SYM_LU.has(l.tx)) return "keyword";
            return "id";
        case types.num:
            if (!IGNORE_KEYWORDS && SYM_LU.has(l.tx)) return SYM_LU.get(l.tx);
            return "num";
        case types.string:
            return "str";
        case types.new_line:
            return "nl";
        case types.ws:
            return "ws";
        case types.data_link:
            return "dl";
        default:
            return SYM_LU.get(l.tx) || SYM_LU.get(l.ty);
    }
}

export function getPrecedence(term, grammar) {
    //const prec = grammar.rules.prec;
    //if (prec && typeof(term) == "string" && typeof(prec[term]) == "number")
    //    return prec[term];
    return -1;
}

export function createPrecedence(body, grammar) {
    const prec = body.precedence;
    let l = 0;
    for (let i = 0; i < body.length; i++) {
        l = Math.max(getPrecedence(body[i], grammar), l);
    }
    return (l >= 0) ? prec : Math.min(l, prec);
}

/**************** FIRST and FOLLOW sets ***************************/
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

    table.set(terminal, { v: terminal, p: grammar.bodies[body_ind].precedence, type: first.type });

    return HAS_E;
}


const merge = (follow, first) => {
    first.forEach((v) => {
        if (v !== EMPTY_PRODUCTION)
            follow.add(v);
    });
};

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
            subset.forEach((v, k) => { if (!set.has(k)) set.set(k, v) });

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

export function FOLLOW(grammar, production) {

    const
        prod = grammar[production],
        table = [];

    if (prod.follow) return grammar[production].follow;

    for (let i = 0; i < grammar.length; i++) {
        grammar[i].follow = new Set();
        table.push(grammar[i].follow);
    }

    table[0].add("$eof"); //End of Line

    for (let i = 0; i < grammar.length; i++) {
        const production = grammar[i];

        for (let i = 0; i < production.bodies.length; i++) {
            const body = production.bodies[i];

            for (let i = 0; i < body.length; i++) {
                const val = body[i];

                if (isNonTerm(val)) {

                    const follow = table[val];

                    for (var j = i + 1; j < body.length; j++) {

                        const
                            val = body[j],
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

    for (let production_index = 0; production_index < grammar.length; production_index++) {

        const production = grammar[production_index];

        for (let i = 0; i < production.bodies.length; i++) {

            const body = production.bodies[i];

            for (let i = body.length; i > 0; i--) {

                const val = body[i - 1];

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

function setFunction(env, funct, function_params = [], this_object = null) {
    let func;
    try {
        func = (Function).apply(this_object, function_params.concat([(funct.type == "RETURNED" ? "return " : "") + funct.txt.trim()]));
    } catch (e) {
        func = () => { return { error: e, type: "error" } };

        throw "";
    }

    return func;
}

function addFunctions(funct, production, env) {

    if (!env.id)
        env.id = 1;

    if (!env.FLUT)
        env.FLUT = new Map;

    if (!production.func_counter)
        production.func_counter = 0;

    if (!funct.env) {
        const str = funct.txt.trim();
        let name = env.FLUT.get(str);


        if (!name) {
            name = funct.type[0] + production.id + (production.func_counter++) + "_" + production.name.replace(/\$/g, "_");
            funct.name = name;
            env.functions[name] = setFunction(null, funct, [production_stack_arg_name, environment_arg_name, lexer_arg_name, "state", "output", "len"], {});
            env.functions[name].INTEGRATE = true;
            env.FLUT.set(str, name);
        }
        funct.name = name;
    }
}

export function filloutGrammar(grammar, env) {

    const bodies = [],
        symbols = new Map();

    for (let i = 0, j = 0; i < grammar.length; i++) {
        const production = grammar[i];

        if (production.error_function)
            addFunctions(production.error_function, production, env);

        for (let i = 0; i < production.bodies.length; i++, j++) {
            const body = production.bodies[i];
            body.id = j;
            bodies.push(body);
            body.precedence = createPrecedence(body, grammar);

            const sym_function = s => { if (s.type !== "production") symbols.set(s.val + s.type, s); };
            body.sym.forEach(sym_function);
            [...body.ignore.values()].forEach(a => a.forEach(sym_function));
            [...body.excludes.values()].forEach(a => a.forEach(sym_function));
            [...body.error.values()].forEach(a => a.forEach(sym_function));

            if (body.reduce_function) {
                addFunctions(body.reduce_function, production, env);
            }

            body.functions.forEach(f => {
                addFunctions(f, production, env);
            });
        }
    }

    grammar.meta.all_symbols = symbols;

    grammar.bodies = bodies;
}

export const actions = {
    ACCEPT: 1,
    SHIFT: 2,
    REDUCE: 3,
    GOTO: 4,
};

export function processClosure(items, grammar, error, excludes, offset = 0, added = new Set()) {

    let exclusion_count = 0;

    if (!excludes) {
        if (items.excludes)
            excludes = items.excludes.slice();
        else
            excludes = [];
        items.excludes = [];
    }

    const bodies = grammar.bodies,
        g = items.length;

    for (let i = offset; i < g; i++) {
        const
            item = items[i],
            body = bodies[item.body],
            len = item.len,
            index = item.offset,
            B = body.sym[index],
            Be = body.sym.slice(index + 1),
            b = item.follow,
            end = items.length,
            step_excludes = excludes.slice(),
            new_excludes = [],
            out_excludes = [];

        if (body.excludes.has(index)) {
            if (!items.excludes)
                items.excludes = [];
            body.excludes.get(index).forEach(e => step_excludes.push({ body: item.body, symbols: Array.isArray(e) ? e : [e], offset: 0, l: Array.isArray(e) ? e.length : 1, inner_offset: index }));
        }

        for (let u = 0; u < step_excludes.length; u++) {

            const ex = step_excludes[u];

            if (item.body == ex.body && index == ex.inner_offset) {

                const
                    d = ex.offset,
                    j = index, //, clock = 0;
                    i_sym = body.sym[j],
                    e_sym = ex.symbols[d];

                if (i_sym && i_sym.type !== "production" && i_sym.val == e_sym.val) {
                    if (d == ex.l - 1) {
                        exclusion_count++;
                        item.USED = true;
                        break;
                    }

                    //Excludes going to next round
                    items.excludes.push({ body: ex.body, symbols: ex.symbols, offset: d + 1, l: ex.l, inner_offset: j + 1 });
                } else {
                    new_excludes.push({ body: ex.body, symbols: ex.symbols, offset: d, l: ex.l, inner_offset: 0 });
                }
            }
        }

        if (item.USED)
            continue;

        if (index < len && B.type == "production") {
            let first;

            if (Be.length > 0)
                first = FIRST(grammar, ...Be, b);
            else
                first = [b];

            const production = grammar[B.val];

            if (production.graph_id < 0)
                production.graph_id = grammar.graph_id++;

            for (let i = 0; i < production.bodies.length; i++) {

                const
                    pbody = production.bodies[i],
                    body_index = pbody.id,
                    first_mod = [...first.slice(), ...pbody.reduce];

                out_excludes.push(...new_excludes.map(e => ({ body: body_index, symbols: e.symbols, offset: e.offset, l: e.l, inner_offset: e.inner_offset })));

                for (let i = 0, l = first_mod.length; i < l; i++) {

                    if (!first_mod[i])
                        continue;

                    const
                        item = new Item(pbody.id, pbody.length, 0, first_mod[i], grammar),
                        sig = item.full_id;

                    if (!added.has(sig)) {
                        items.push(item);
                        added.add(sig);
                    }
                }
            }

            const
                added_count = items.length - end,
                count = processClosure(items, grammar, error, out_excludes, g, added);

            if (count > 0 && count == added_count) {
                item.USED = true;
                exclusion_count++;
            }

            exclusion_count += count;
        }
    }


    return exclusion_count;
}