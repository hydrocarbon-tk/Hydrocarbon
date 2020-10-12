import wind from "@candlefw/wind";

import { Item } from "./item.js";

import { FIRST } from "./first.js";

import { FOLLOW } from "./follow.js";

import { processClosure, getDerivedItems } from "./process_closure.js";
import { Grammar } from "../types/grammar.js";

export { Item, FOLLOW, FIRST, processClosure, getDerivedItems };

export const types = wind.types;

const
    production_stack_arg_name = "sym",
    environment_arg_name = "env",
    lexer_arg_name = "lex";

export function getToken(l, SYM_LU, IGNORE_GRAMMAR_SYMBOLS: boolean = false) {
    if (l.END) return 0;

    if (!IGNORE_GRAMMAR_SYMBOLS)
        if (SYM_LU.has(l.tx) || SYM_LU.has(l.ty)) return SYM_LU.get(l.tx) || SYM_LU.get(l.ty);

    if ((l.ty & types.num)) {

        switch (l.ty) {
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
    }

    switch (l.ty) {
        case types.id:
            return "id";
        case types.string:
            return "str";
        case types.new_line:
            return "nl";
        case types.ws:
            return "ws";
        case types.tab:
            return "tb";
    }

    return "any";
}

/************ Grammar Production Functions *****************************/

function setFunction(env, funct, function_params = [], this_object = null) {

    let func;

    try {
        func = (Function).apply(this_object, function_params.concat([(funct.type == "RETURNED" ? "" : "") + funct.txt.trim()]));
    } catch (e) {
        func = () => { return { error: e, type: "error" }; };

        throw e;
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


export function filloutGrammar(grammar: Grammar, env) {

    const bodies = [],
        symbols = new Map();

    for (let i = 0, j = 0; i < grammar.length; i++) {
        const production = grammar[i];

        for (let i = 0; i < production.bodies.length; i++, j++) {
            const body = production.bodies[i];
            body.id = j;
            body.production = production;
            bodies.push(body);
            body.precedence = createPrecedence(body, grammar);

            const sym_function = s => { if (s.type !== "production") symbols.set(s.val + s.type, s); };
            body.sym.forEach(sym_function);
            [...body.ignore.values()].forEach(a => a.forEach(sym_function));
            [...body.excludes.values()].forEach(a => a.forEach(sym_function));
            [...body.error.values()].forEach(a => a.forEach(sym_function));

            if (env) {
                if (body.reduce_function) {
                    addFunctions(body.reduce_function, production, env);
                }

                body.functions.forEach(f => {
                    addFunctions(f, production, env);
                });
            }
        }
    }

    grammar.meta = Object.assign({}, grammar.meta, { all_symbols: symbols });

    grammar.bodies = bodies;

    return grammar;
}