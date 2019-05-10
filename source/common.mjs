import whind from "../node_modules/@candlefw/whind/source/whind.mjs";

export const MASK = whind.types.symbol | whind.types.operator | whind.types.open_bracket | whind.types.close_bracket;

export const EMPTY_PRODUCTION = "ɛ";

export const isNonTerm = (f) => f !== undefined && (typeof(f) == "number" || (f[0] !== "τ" && f[0] !== "ɛ" && f[0] !== "θ" && !(whind(f).type & MASK)));

export const types = whind.types;

const production_stack_arg_name = "sym",
    environment_arg_name = "env",
    lexer_arg_name = "lex";

export function getToken(l, reserved) {
    if (l.END) return "$";

    switch (l.ty) {
        case types.id:
            if (reserved.has(l.tx)) return "τ" + l.tx;
            return "θid";
        case types.num:
            return "θnum";
        case types.string:
            return "θstr";
        case types.new_line:
            return "θnl";
        case types.ws:
            return "θws";
        case types.data_link:
            return "θdl";
        default:
            return l.tx;
    }
}

export function getPrecedence(term, grammar) {
    const prec = grammar.rules.prec;
    if (prec && typeof(term) == "string" && typeof(prec[term]) == "number")
        return prec[term];
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
function addNonTerminal(table, production_array, grammar, body_ind, index = 0) {

    if (!production_array[index]) {
        throw new Error(`Empty production at index ${index} in [${grammar[production_array.production].name}]`);
    }

    let first = production_array[index],
        terminal = "",
        HAS_E = false;

    if (first[0] == "τ") {
        terminal = first.slice(1);
    } else if (first.toString().trim() == EMPTY_PRODUCTION) {
        //table.set(EMPTY_PRODUCTION, { v: EMPTY_PRODUCTION, p: grammar.bodies[body_ind].precedence });
        return true;
    } else if (!isNonTerm(first)) {

        if (first[first.length - 1] == "!")
            return addNonTerminal(table, production_array, grammar, body_ind, index + 1, );

        terminal = first;
    } else {

        let bodies = grammar[first].bodies;

        for (let i = 0; i < bodies.length; i++)
            if (i !== body_ind && first !== production_array.production)
                HAS_E = addNonTerminal(table, bodies[i], grammar, bodies[i].id);

        if (index < production_array.length - 1 && HAS_E)
            addNonTerminal(table, production_array, grammar, body_ind, index + 1, );

        return HAS_E;
    }


    let cc = terminal.charCodeAt(0);

    if (!(cc < 48 || (cc > 57 && cc < 64) || (cc > 90 && cc < 97) || cc > 122))
        terminal = "τ" + terminal;

    table.set(terminal, { v: terminal, p: grammar.bodies[body_ind].precedence });

    return HAS_E;
}


const merge = (follow, first) => {
    first.forEach((v) => {
        if (v !== EMPTY_PRODUCTION)
            follow.add(v);
    });
};

export function FIRST(grammar, ...symbols) {

    if(symbols.length == 1 && typeof(symbols[0]) !== "object"){
        if(grammar.bodies[symbols[0]].f)
            return grammar.bodies[symbols[0]].f;
    }

    if (!symbols[0]) return [];

    const set = new Map();

    for (let i = 0; i < symbols.length; i++) {
        const SYMBOL = symbols[i],
            subset = new Map();

        if (typeof(SYMBOL) !== "object" /*&& isNonTerm(SYMBOL)*/ ) {

            const production = grammar[SYMBOL];

            let HAS_E = false;

            for (let i = 0; i < production.bodies.length; i++) {

                const body = production.bodies[i];

                HAS_E = addNonTerminal(subset, body, grammar, body.id);
            }

            //Merge the sets 
            subset.forEach((v, k) => { if (!set.has(k)) set.set(k, v) });

            if (!HAS_E) break;

        } else {

            if (SYMBOL.v == EMPTY_PRODUCTION)
                continue;

            set.set(SYMBOL.v, SYMBOL);

            break;
        }
    }

    const val = [];

    set.forEach((v) => val.push(v));

    const v = (symbols[0].v) ? symbols[0].v : symbols[0];

    if (isNonTerm(v))
        grammar[v].first = val;

    if(symbols.length == 1 && typeof(symbols[0]) !== "object"){
        grammar.bodies[symbols[0]].f = val;
    }

    return val;
}

export function FOLLOW(grammar, production) {

    let prod = grammar[production];

    if (prod.follow) return grammar[production].follow;

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

function setFunction(env, function_body, function_params = [], this_object = null, body) {
    if (function_body[0] == "^")
        if (env && env.functions[function_body.slice(1)])
            return env.functions[function_body.slice(1)].bind(this_object);
        else
            return () => {};
    let funct;

    try {
        funct = (Function).apply(this_object, function_params.concat([function_body]));
    } catch (e) {
        console.log(function_body)
        console.error(e);
        funct = () => { return { error: e, type: "error" } }
    }

    return funct
}

export function createFunctions(production, body, env) {
    body.node = null;
    body.err = null;
    body.sr = [];

    if (!production.func_counter)
        production.func_counter = 0;

    if (body.funct.cstr) {
        let node = null,
            ENV = false;

        if (body.funct.cstr[0] == "^") {

            const funct = env.functions[body.funct.cstr.slice(1)];
            
            if (funct) {
                node = {};
                node.NAME = body.funct.cstr.slice(1);
                node.TYPE = "class";
            } else {
                node = {}
                node.NAME = body.funct.cstr.slice(1);
                node.TYPE = "class"
            }

            ENV = true;
            node.ENV = ENV;
        }

        if (!node) {
            if (!env.id)
                env.id = 1;

            if (!env.FLUT)
                env.FLUT = new Map();

            let str = body.funct.cstr;

            if (env.FLUT.has(str)) {
                node = env.FLUT.get(str);
            } else {
                let id = production.name + "$" + production.func_counter++;
                node = setFunction(null, str, [production_stack_arg_name, environment_arg_name, lexer_arg_name, "state"], () => {}, body);
                env.functions[id] = node;
                env.FLUT.set(str, node);
                node.NAME = id;
                if (str.slice(0, 6) == "return")
                    node.TYPE = "function"
                else
                    node.TYPE = "class"
            }

        }

        node.ENV = ENV;

        body.node = node;
    }

    for (const funct in body.funct) {
        if (typeof(body.funct[funct]) == "string") {
            if (funct == "cstr") continue;
            if (funct == "err") {
                body.err = Function(production_stack_arg_name, environment_arg_name, lexer_arg_name, "state", body.funct[funct]);
            } else if (!isNaN(funct)) {
                body.sr[parseInt(funct)] = Function(production_stack_arg_name, environment_arg_name, lexer_arg_name, "state", body.funct[funct]);
            } else if (body.node)
                body.node.prototype[funct] = setFunction(env, body.funct.cstr, node.prototype);
        }
    }


    body.funct = null;
}

export function filloutGrammar(grammar, env) {
    let bodies = [];

    for (let i = 0, j = 0; i < grammar.length; i++) {
        let production = grammar[i];

        if (production.funct && production.funct.error) {
            production.error = Function("items", environment_arg_name, lexer_arg_name, "start", production.funct.error);
        }

        for (let i = 0; i < production.bodies.length; i++, j++) {
            let body = production.bodies[i];
            body.id = j;
            bodies.push(body);
            body.precedence = createPrecedence(body, grammar);
            createFunctions(production, body, env);
        }
    }

    grammar.bodies = bodies;
}


export class Item extends Array {
    constructor(body_id, length, offset, v = "", p = -1, g = null) {
        super(body_id, length, offset);
        this.follow = { v, p };
        this.USED = false;
        this.grammar = g;
    }

    get v() {
        return this.follow.v;
    }

    get p() {
        return this.follow.p;
    }

    get id() {
        return "" + this.body + "" + this.len + "" + this.offset + "|";
    }

    get full_id() {
        return this.id + this.v;
    }

    get body() {
        return this[0];
    }

    get len() {
        return this[1];
    }

    get offset() {
        return this[2];
    }
    get body_() {
        return this.grammar.bodies[this.body];
    }
    get sym(){
        return this.body_[this.offset];
    }

    increment() {
        if (this.offset < this.len)
            return new Item(this.body, this.len, this.offset + 1, this.v, this.p, this.grammar);
        return null;
    }

    match(item) {
        return item.id == this.id;
    }

    toString() {
        return this.id;
    }
}

export const actions = {
    ACCEPT: 1,
    SHIFT: 2,
    REDUCE: 3,
    GOTO: 4,
};
