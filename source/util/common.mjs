import whind from "@candlefw/whind";

export const MASK = whind.types.symbol | whind.types.operator | whind.types.open_bracket | whind.types.close_bracket | whind.types.string;

export const EMPTY_PRODUCTION = "{!--EMPTY_PRODUCTION--!}";

export const isNonTerm = (f) => f.type == "production";

import { Item } from "./item.mjs";

import { FIRST } from "./first.js";

import { FOLLOW } from "./follow.js";

import { processClosure } from "./process_closure.js";

export { Item, FOLLOW, FIRST, processClosure };

export const types = whind.types;

const
    production_stack_arg_name = "sym",
    environment_arg_name = "env",
    lexer_arg_name = "lex";

export function getToken(l, SYM_LU, IGNORE_KEYWORDS = false) {
    if (l.END) return 0; /*"$eof"*/
    
    if((l.ty & types.num)){

        if (!IGNORE_KEYWORDS && SYM_LU.has(l.tx)) return SYM_LU.get(l.tx);
        
        //*
        switch(l.ty){
            case types.sci:
                return "sci";
            case types.hex:
                return "hex";
            case types.oct:
                return "oct";
            case types.bin:
                return "bin";
            case types.flt:
                return "flt";
            case types.int:
                return "int";
            default:
            case types.num:
                return "num";
        }
        //*/
    }

    switch (l.ty) {
        case types.id:
            if (!IGNORE_KEYWORDS && SYM_LU.has(l.tx)) return "keyword";
            return "id";
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
            env.functions[name] = setFunction(null, funct, [production_stack_arg_name, environment_arg_name, lexer_arg_name, "pos", "output", "len"], {});
            env.functions[name].INTEGRATE = true;
            env.FLUT.set(str, name);
        }
        funct.name = name;
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